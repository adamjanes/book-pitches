# Landing Page — PRD

> **Feature:** landing-page
> **Status:** draft
> **Generated:** 2026-02-17
> **Project:** Book Pitches (Next.js 16 / Supabase / Tailwind 4)

---

## 1. Problem

First-time visitors to the site see a basic homepage with top-rated books and categories, but the page doesn't communicate the core value proposition ("record audio pitches for books you love") or establish the warm, literary parchment aesthetic that differentiates the platform from commercial book sites. The current homepage feels generic and doesn't inspire engagement or signups.

## 2. Solution

Replace the current homepage (`src/app/page.tsx`) with a marketing-focused landing page featuring: (1) a text-focused hero section that explains the voice-first pitch concept, (2) a featured pitches section showcasing 6 recent high-quality pitches with inline audio players, (3) category shortcuts as a visual grid, (4) parchment/paper-like design system using beige backgrounds and serif typography. This establishes the literary aesthetic and makes the value prop immediately clear to visitors.

## 3. Capabilities

| Capability | Type | Description |
|------------|------|-------------|
| Hero Section | New | Large serif heading + subtitle explaining the pitch concept, with CTA button and SearchBar component |
| Featured Pitches | New | Display 6 recent pitches (rating >= 7) with book covers, pitch text preview, and inline audio playback |
| Audio Player Component | New | Minimal play/pause button + duration display using native HTML5 `<audio>` element |
| Category Grid | Modified | Visual 2x5 grid showing all 10 categories with pitch counts, replacing horizontal pills |
| Parchment Design System | Existing | Already applied globally in pitch-creation-flow — Tailwind CSS theme extension with beige/cream palette, serif headings (Lora), sans-serif body (Inter) |
| How It Works Section | New | Simple 3-step visual (Search → Record → Share) to reinforce the concept |
| SEO Metadata | New | Enhanced Open Graph tags, JSON-LD structured data for rich previews |
| ISR Revalidation | New | Server Component with 60-minute ISR revalidation for fresh content |

## 4. Scope

**In scope:**
- Replace existing homepage (`src/app/page.tsx`) with new landing page
- Use existing parchment design system (already applied globally in pitch-creation-flow)
- Featured pitches section with audio playback (6 recent pitches, rating >= 7)
- Minimal inline audio player component (play/pause + duration)
- Category grid (2x5 desktop, 2-column mobile)
- "How It Works" 3-step section
- SEO metadata (Open Graph, JSON-LD)
- ISR with 60-minute revalidation
- Empty state handling (no pitches on launch)

**Out of scope:**
- Video content or rich media beyond audio
- Personalized content or recommendations (requires auth state)
- A/B testing or multiple hero variants
- Blog or editorial content section
- Manual editorial curation (V2 feature with `featured` boolean flag)
- Waveform visualization (V2 — basic timer is sufficient)
- Animation-heavy design (keeping it warm and calm)

## 5. Technical Design

### Architecture

```
┌─────────────────────────────────────────────┐
│  src/app/page.tsx (Server Component)        │
│  - Fetch featured pitches (rating >= 7)     │
│  - Fetch categories with counts             │
│  - ISR revalidate: 3600s                    │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┴──────────┬──────────────────┬───────────────┐
    │                     │                  │               │
┌───▼───────────┐ ┌───────▼────────┐ ┌──────▼──────┐ ┌─────▼──────────┐
│ HeroSection   │ │ FeaturedPitches│ │ HowItWorks  │ │ CategoryGrid   │
│ (server)      │ │ (client)       │ │ (server)    │ │ (server)       │
└───────────────┘ └───────┬────────┘ └─────────────┘ └────────────────┘
                          │
                   ┌──────▼────────┐
                   │ AudioPlayer   │
                   │ (client)      │
                   └───────────────┘
```

### Key Decisions

| Decision | Choice | Why | Alternative Considered |
|----------|--------|-----|------------------------|
| Design System | Use existing global design system | Parchment palette and Lora font already applied globally in pitch-creation-flow feature. No changes needed — just use existing utility classes. | Re-define design system locally (redundant). |
| Typography | Lora (serif headings), Inter (body), via `next/font/google` | Lora has literary feel, pairs well with Inter. Google Fonts auto-optimizes (subsetting, preloading, no layout shift). | Playfair Display (too ornate), system serif (less control over visual identity). |
| Featured Logic | Algorithmic: `rating >= 7 ORDER BY created_at DESC LIMIT 6` | No admin tooling for curation yet. Recent + highly-rated produces good results and self-updates. | Editorial curation (better quality but requires admin UI — V2 feature). |
| Audio Player | Native HTML5 `<audio>` with custom play/pause button | Core value prop requires immediate sampling. Minimal player fits card layout. Native element handles cross-browser formats. | Full player with seek/waveform (too prominent for landing page card). |
| Rendering | React Server Component with ISR (`revalidate = 3600`) | Content changes slowly — hourly revalidation is sufficient. ISR gives static-like performance with content freshness. | Fully static (stale until deploy), fully dynamic (unnecessary server load). |
| Hero Design | Text-focused with gradient background, no stock photography | Stock book photos are generic. Text + serif typography + parchment palette feels more literary. | Background image (generic, hurts readability), illustration (requires commissioning art). |

### Data Model

No schema changes required. Uses existing tables:

```sql
-- Featured pitches query
SELECT
  p.*,
  b.title, b.author, b.cover_url, b.slug as book_slug,
  u.name as user_name, u.slug as user_slug
FROM pitches p
JOIN books b ON p.book_id = b.id
JOIN users u ON p.user_id = u.id
WHERE p.rating >= 7
ORDER BY p.created_at DESC
LIMIT 6;

-- Category counts already handled by existing getCategories() query
```

### Key Interfaces

```typescript
// Featured pitch with joined data
export interface FeaturedPitch extends Pitch {
  book: {
    title: string
    author: string
    cover_url: string | null
    slug: string
  }
  user: {
    name: string
    slug: string
  }
}

// Audio player props (uses native HTML5 <audio> element)
interface AudioPlayerProps {
  audioUrl: string | null
  duration: number | null
  pitchId: string
}

// Parchment color palette (Tailwind theme extension)
{
  colors: {
    parchment: {
      base: '#F5F0E8',    // warm parchment background
      cream: '#FFFDF7',   // card surface
      border: '#E5DDD0',  // soft beige border
    },
    'warm-brown': {
      DEFAULT: '#8B7355', // accent
      light: '#A0845C',   // accent hover
      medium: '#6B5744',  // secondary text
      dark: '#3D2B1F',    // primary text
    }
  }
}
```

## 6. UX Flow

1. **First-time visitor lands on homepage** → sees hero section with large serif heading "Share your book picks in 90 seconds" and subtitle explaining the concept
2. **Visitor scrolls down** → sees "How It Works" 3-step visual (Search → Record → Share)
3. **Visitor reaches featured pitches section** → sees 6 pitch cards with book covers, user names, ratings, and pitch text previews
4. **Visitor clicks play button on a pitch card** → audio starts playing, play button changes to pause icon, any currently playing pitch pauses
5. **Visitor scrolls to categories section** → sees 2x5 grid of category cards with names and pitch counts
6. **Visitor clicks category card** → navigates to `/discover?category=<slug>` (filtered discovery page)
7. **Visitor clicks "Record Your First Pitch" CTA in hero** → redirects to `/signup` if unauthenticated, `/record` if authenticated (pitch creation flow, future feature)

**Empty state (launch with 0 pitches):**
- Hero section unchanged
- Featured section shows: "No pitches yet. Be the first to record!" with prominent signup CTA
- Categories still render (with "0 pitches" counts)

## 7. Requirements

**REQ-01** The hero section SHALL display a large serif heading "Share your book picks in 90 seconds" and a subtitle "Record an audio pitch for the books you love. Build your bookshelf. Discover what others are reading."

**REQ-02** The hero section SHALL include a primary CTA button WHEN user is unauthenticated THEN button text is "Record Your First Pitch" and links to `/signup`.

**REQ-02a** The hero section SHALL include a SearchBar component that navigates to `/discover?q=<query>` when the user searches.

**REQ-03** The "How It Works" section SHALL display 3 steps ("Search for a book", "Record your pitch", "Share with readers") with icons and brief descriptions.

**REQ-04** The featured pitches section SHALL query the database for pitches WHERE `rating >= 7` ORDER BY `created_at DESC` LIMIT 6.

**REQ-05** Each featured pitch card SHALL display the book cover, book title, author, user name, rating badge, and first 100 characters of pitch text.

**REQ-06** Each featured pitch card SHALL include an audio player component WHEN `audio_url` is not null THEN show play/pause button and duration.

**REQ-07** The audio player SHALL use native HTML5 `<audio>` elements with play/pause controls (no global playback enforcement in V1).

**REQ-08** The category grid SHALL display all categories in a 2x5 grid on desktop and 2-column scrollable on mobile, showing category name and pitch count. Category cards SHALL link to `/discover?category=<slug>`.

**REQ-09** The page SHALL use ISR with `revalidate = 3600` (60 minutes) to balance performance and content freshness.

**REQ-10** The page SHALL update `<head>` metadata with enhanced Open Graph tags (title, description, image) and JSON-LD structured data for SEO.

**REQ-11** The page SHALL use the existing parchment design system (already applied globally in pitch-creation-flow) with colors: parchment base (#F5F0E8), cream (#FFFDF7), warm brown (#8B7355), dark brown (#3D2B1F).

**REQ-12** The page SHALL use Lora (serif) for headings and Inter for body text (both already configured globally via `next/font/google`).

**REQ-13** The featured pitches section SHALL show an empty state message "No pitches yet. Be the first to record!" with signup CTA WHEN no pitches meet the criteria (rating >= 7).

**REQ-14** All text colors on parchment background SHALL meet WCAG AA contrast ratio (4.5:1 minimum) for accessibility.

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Empty state on launch — no pitches exist | High | Medium | Hero section works without featured pitches. Show "coming soon" state. Adam will seed initial pitches after pitch creation flow is built. |
| Audio autoplay restrictions in browsers | Low | Low | Audio only plays on user interaction (click). No autoplay attempted. |
| Google Fonts loading time (~40-60KB) | Low | Low | `next/font/google` auto-subsets and preloads. Use `font-display: swap` for fast text rendering. |
| No ISR verification test in CI | Low | Low | ISR revalidation behavior verified manually during development. Not critical for V1. |
| Parchment palette accessibility (low contrast) | Medium | Medium | Ensure dark brown (#3D2B1F) on parchment (#F5F0E8) meets contrast ratio. Calculated: ~8.5:1 — passes WCAG AA. |
| Featured pitches query returns < 6 results | Medium | Low | Design supports any number from 0-6. Show whatever is available. |

## 9. Success Criteria

- [ ] First-time visitors can understand the pitch concept within 5 seconds of landing
- [ ] Featured pitches display with playable audio (when pitches exist)
- [ ] Audio player enforces single playback (one pitch at a time)
- [ ] Parchment design system is consistently applied across all sections
- [ ] Category grid links correctly to category pages
- [ ] Page loads quickly (<2s LCP on 3G) due to ISR
- [ ] SEO metadata appears correctly in social media link previews
- [ ] Empty state (no pitches) displays gracefully with clear CTA
- [ ] All text meets WCAG AA contrast requirements
- [ ] Page is fully responsive (mobile, tablet, desktop)

## 10. Impact

### New Files

| File | Purpose |
|------|---------|
| `src/components/HeroSection.tsx` | Hero section with heading, subtitle, CTA button (server component) |
| `src/components/FeaturedPitches.tsx` | Featured pitches grid with audio players (client component) |
| `src/components/AudioPlayer.tsx` | Minimal audio player (play/pause + duration, client component) |
| `src/components/HowItWorks.tsx` | 3-step visual section (server component) |
| `src/lib/supabase/queries/getFeaturedPitches.ts` | Query for recent high-rated pitches with joined book/user data |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/page.tsx` | Replace entire contents with new landing page layout |
| `src/app/layout.tsx` | Import Lora font via `next/font/google`, add to body className |
| `src/app/globals.css` | Add parchment color palette to `@theme inline`, add serif font family |
| `src/lib/supabase/queries.ts` | Add `getFeaturedPitches()` function |
| `src/lib/supabase/types.ts` | Add `FeaturedPitch` interface |
| `src/components/CategoryCard.tsx` | Potentially add pitch count prop and display (if not already shown) |
| `src/app/metadata.ts` (new) | Centralized SEO metadata with Open Graph and JSON-LD |
