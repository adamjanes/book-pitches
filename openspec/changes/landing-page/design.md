# Landing Page Design

## Context

The landing page is the first impression of the platform. It must communicate the core concept ("record your ~90-second audio pitch for books you love") and establish the warm, literary parchment/beige aesthetic that differentiates the platform from commercial book sites. The page serves two audiences: new visitors who need to understand the concept and sign up, and returning users who want quick access to featured content. The database has pitches with audio_url for playback, books with cover images, and 10 predefined categories.

## Goals / Non-Goals

**Goals:**
- Communicate the voice-first pitch concept immediately in the hero section
- Establish the parchment/paper-like design system (beige backgrounds, serif headings, warm accents)
- Feature a selection of recent high-quality pitches with embedded audio players
- Provide category browse shortcuts linking to filtered discovery page
- Include clear call-to-action for signup/login leading to pitch creation
- Mobile-first responsive layout
- SEO metadata and JSON-LD structured data

**Non-Goals:**
- Personalized content or recommendations
- A/B testing or multiple hero variants
- Animation-heavy design (keep it warm and calm, not flashy)
- Video content or rich media beyond audio
- Blog or editorial content section

## Decisions

### Decision 1: Tailwind CSS custom theme, not a separate design system

**Choice:** Define the parchment palette and typography as Tailwind CSS theme extensions in `tailwind.config.ts`. No separate design system package or component library.

**Why:** The app is a single Next.js project — a separate design system package adds overhead (versioning, publishing, syncing) with no benefit. Tailwind's theme extension is the standard approach for custom design tokens in this stack. The parchment palette becomes available as utility classes (`bg-parchment`, `text-warm-brown`, etc.).

**Color palette:**
- Base/background: `#F5F0E8` (warm parchment)
- Card surface: `#FFFDF7` (cream white)
- Primary text: `#3D2B1F` (dark brown)
- Secondary text: `#6B5744` (medium brown)
- Accent: `#8B7355` (warm brown)
- Accent hover: `#A0845C` (lighter warm brown)
- Border: `#E5DDD0` (soft beige)

**Alternative considered:** CSS variables only (no Tailwind extension). Works but loses Tailwind's utility-first approach and requires writing custom CSS for every color usage.

### Decision 2: Serif headings with Google Fonts

**Choice:** Use Lora (serif) for headings and display text, Inter (sans-serif) for body text. Load via `next/font/google` for automatic optimization.

**Why:** Lora is a well-balanced serif font with a literary feel — warm, readable, and available on Google Fonts for free. Inter is a clean sans-serif that pairs well and is highly readable for body text. Loading via `next/font/google` handles font subsetting, preloading, and prevents layout shift.

**Alternative considered:** Playfair Display for headings. More dramatic but can feel overly ornate at smaller sizes. System serif fonts (`Georgia, "Times New Roman"`). No cost or loading time, but less control over the visual identity.

### Decision 3: Featured pitches from recent high-rated content

**Choice:** The featured section shows 6 recent pitches with ratings >= 7, ordered by `created_at DESC`. No editorial curation — purely algorithmic.

**Why:** Manual curation requires admin tooling that doesn't exist yet. A simple query (recent + highly rated) produces good results and is self-updating. As more pitches are added, the featured section naturally refreshes.

**Query:** `SELECT p.*, b.* FROM pitches p JOIN books b ON p.book_id = b.id WHERE p.rating >= 7 ORDER BY p.created_at DESC LIMIT 6`

**Empty state:** When fewer than 6 pitches exist, show whatever is available. If zero pitches, show the hero section with a prominent "Be the first to record a pitch" CTA.

**Alternative considered:** Editorially curated featured list. Better quality control but requires admin interface and manual maintenance. V2 could add a `featured` boolean flag on pitches.

### Decision 4: Minimal inline audio player for featured pitches

**Choice:** Featured pitch cards include a small play/pause button and duration display. Clicking play starts audio playback using the native HTML5 `<audio>` element. Only one pitch plays at a time (playing a new one pauses the current).

**Why:** Audio is the core value prop — visitors should be able to sample pitches immediately on the landing page without navigating away. A minimal player (play/pause + duration) fits in the card layout without overwhelming the design. The native `<audio>` element handles cross-browser format differences (webm/mp4).

**Single-playback enforcement:** A shared state context (or simple ref) tracks which pitch is currently playing. Starting a new pitch pauses the current one.

**Alternative considered:** Full audio player with seek bar and waveform. Too prominent for a landing page card. Visitors just need to sample — detailed playback is for the book detail page.

### Decision 5: Server Component with ISR revalidation

**Choice:** The landing page is a React Server Component with ISR (Incremental Static Regeneration) revalidating every 60 minutes. Fetches featured pitches and category data at build time, refreshes periodically.

**Why:** The landing page content (featured pitches, categories) changes slowly — hourly revalidation is sufficient. ISR gives the performance of a static page (served from CDN edge) with the freshness of server-rendered content. The page loads instantly for visitors.

**Revalidation:** `export const revalidate = 3600` (60 minutes) in the page file.

**Alternative considered:** Fully static (build-time only). Stale until next deploy — bad for a content-driven page. Fully dynamic (no caching). Unnecessary server load for content that changes slowly.

### Decision 6: Text-focused hero, no stock photography

**Choice:** The hero section uses a large serif heading, a descriptive subtitle, and a warm background pattern or gradient — no stock photography of books or people.

**Hero copy (draft):**
- Heading: "Share your book picks in 90 seconds"
- Subtitle: "Record an audio pitch for the books you love. Build your bookshelf. Discover what others are reading."
- CTA: "Start Recording" (→ /record if authenticated, → /signup if not)

**Why:** Stock photography of books is generic and used by every book site. A text-focused hero with warm typography and subtle patterns (paper texture, bookshelf line art) feels more authentic and literary. The parchment palette creates warmth without needing photos.

**Alternative considered:** Hero with background image (bookshelf photo). Generic, competes with text readability, and adds image loading time. Illustration or icon-based hero. More distinctive but requires commissioning art — can add later.

### Decision 7: Category shortcuts as visual grid

**Choice:** Below the featured pitches, show a grid of 10 category cards. Each card shows the category name and pitch count. Clicking a card navigates to `/discover?category={slug}`.

**Why:** Categories are the primary content organization. Showing them on the landing page with pitch counts gives visitors a clear mental model of what content exists and provides direct navigation to filtered discovery. The grid layout works well in the parchment aesthetic — each card looks like a labeled library section.

**Layout:** 2x5 grid on desktop, 2-column scrollable on mobile. Each card is a simple rectangle with category name (serif, centered) and "N pitches" subtitle.

**Alternative considered:** Horizontal scrollable pills (like the discovery page). Works but is less visually prominent — the landing page should make categories a destination, not just a filter.

## Risks / Trade-offs

- **[Risk] Empty state on launch** → No pitches exist when the site first launches. Mitigation: the hero section works without featured pitches. Show a "coming soon" or "be the first" state. Adam will record initial pitches to seed the featured section.
- **[Risk] Audio autoplay restrictions** → Browsers block autoplay. Mitigation: audio only plays on user interaction (click). No autoplay attempted.
- **[Trade-off] Google Fonts loading** → Lora and Inter add ~40-60KB of font files. Mitigation: `next/font/google` automatically subsets and preloads. Use `font-display: swap` for fast text rendering.
- **[Trade-off] ISR revalidation lag** → Featured pitches can be up to 60 minutes stale. Acceptable for V1 — users won't notice if the latest pitch takes an hour to appear on the landing page.
- **[Risk] Parchment palette accessibility** → Low-contrast beige/brown combinations may fail WCAG contrast checks. Mitigation: ensure text colors meet AA contrast ratio (4.5:1) against background colors. Dark brown (#3D2B1F) on parchment (#F5F0E8) = ~8.5:1 — passes.

## Open Questions

- Should the hero CTA say "Start Recording" or "Record Your First Pitch"? **Recommendation: "Record Your First Pitch" for new visitors, "Record a Pitch" for returning authenticated users.**
- Should we include a "How It Works" section below the hero? **Recommendation: yes, a simple 3-step visual (Search → Record → Share) to reinforce the concept for first-time visitors.**
