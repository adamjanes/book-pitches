# Landing Page

## Why
The landing page is the entry point for all visitors and must immediately communicate the core concept of voice-first book pitches while establishing a warm, literary aesthetic that differentiates the platform from commercial alternatives.

## What Changes
- Add route `/` (homepage) with hero section explaining the pitch concept
- Implement featured pitches section with embedded audio players for sample recordings
- Add category browse shortcuts linking to filtered book/pitch views
- Design parchment/paper-like aesthetic using beige/cream backgrounds, serif typography, and warm accent colours
- Build mobile-first responsive layout optimized for touch audio playback
- Implement SEO metadata and structured data (Schema.org) for discoverability
- Add call-to-action buttons (signup/login flow leading to pitch creation)

## Capabilities

### New Capabilities
- `hero-section`: Hero text block explaining "record your pitch for the books you love" with background imagery
- `featured-pitches-carousel`: Carousel or grid displaying 3-6 curated audio pitch previews with player controls
- `audio-player-embed`: Lightweight in-page audio player component for pitch playback
- `category-shortcuts`: Navigation grid/list showing top book categories with pitch counts
- `call-to-action-button`: Prominent signup/login button linking to auth flow
- `parchment-design-system`: Tailwind CSS configuration for beige palette, serif fonts, warm accents
- `seo-meta-layer`: Dynamic meta tags, Open Graph, and JSON-LD schema for rich previews
- `responsive-layout`: Mobile-first CSS Grid/Flexbox layout for viewport breakpoints (sm, md, lg)

### Modified Capabilities
(none in this change)

## Impact
- **Routes:** Adds `app/page.tsx` (homepage)
- **Components:** New `components/HeroSection.tsx`, `components/FeaturedPitches.tsx`, `components/AudioPlayer.tsx`, `components/CategoryGrid.tsx`
- **Styling:** Updates `app/globals.css` with parchment palette and typography system
- **Data:** Queries Supabase `reviews` table (audio_url, pitch_text, rating) and `books` + `tags` for featured/category display
- **Dependencies:** No new npm packages (Tailwind + native HTML5 audio)
- **Database:** Requires `reviews.audio_url` column (audio pitch recordings); assumes `books`, `tags`, `book_tags` tables exist
- **Performance:** Static generation (ISR) recommended for featured section; CDN for audio assets
