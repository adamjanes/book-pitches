# Landing Page — Tasks

> **PRD:** [PRD.md](./PRD.md)
> **Status:** 0/12 tasks complete

---

## 1. Design System (Already Applied)

**Note:** Parchment design system (Lora font + parchment color palette) is already applied globally in the pitch-creation-flow feature. No setup tasks needed for landing page — just use existing `font-lora`, `text-parchment-dark`, `bg-parchment-base`, and other utility classes.

## 2. Data Layer

- [ ] **2.1 Add FeaturedPitch type and getFeaturedPitches query**
  `src/lib/supabase/types.ts`, `src/lib/supabase/queries.ts` — Data structures
  Add `FeaturedPitch` interface extending `Pitch` with nested `book` (title, author, cover_url, slug) and `user` (name, slug) objects. Add `getFeaturedPitches()` function that queries pitches with rating >= 7, joins books and users tables, orders by created_at DESC, limits to 6. Returns `FeaturedPitch[]`. Test with empty database (should return empty array).

## 3. Hero Section

- [ ] **3.1 Create HeroSection component with SearchBar**
  `src/components/HeroSection.tsx` — Server component
  Build hero with: large serif heading (Lora font, text-5xl) "Share your book picks in 90 seconds", subtitle paragraph, gradient background using parchment colors. Include existing SearchBar component that navigates to `/discover?q=<query>` when the user searches. Add "Record Your First Pitch" CTA button linking to `/signup` (warm-brown background, white text, rounded, hover state).
  VERIFY:
  1. Navigate to `http://localhost:3000`
  2. Verify hero heading displays with Lora serif font
  3. Verify SearchBar is present and functional (type query → navigates to `/discover?q=<query>`)
  4. Verify CTA button has warm-brown background and hover state
  5. Screenshot: `verification/landing-page-3.1.png`

## 4. How It Works Section

- [ ] **4.1 Create HowItWorks component**
  `src/components/HowItWorks.tsx` — Server component
  Build 3-column grid (responsive: 1 col mobile, 3 col desktop) showing steps: "Search for a book", "Record your pitch", "Share with readers". Each step has a number badge (1, 2, 3), heading, and 1-sentence description. Use simple text-based design (no icons for V1), parchment aesthetic.
  VERIFY:
  1. Navigate to `http://localhost:3000`
  2. Scroll to "How It Works" section
  3. Verify 3 steps display in grid layout on desktop
  4. Resize browser to mobile width (375px) — verify 1-column stacked layout
  5. Screenshot: `verification/landing-page-4.1.png`

## 5. Audio Player Component

- [ ] **5.1 Create AudioPlayer component**
  `src/components/AudioPlayer.tsx` — Client component
  Create client component with props: `audioUrl: string | null`, `duration: number | null`, `pitchId: string`. Use local state: `isPlaying` (boolean), useRef for native `<audio>` element. Implement play/pause toggle on button click. Render native `<audio>` element (hidden) with src={audioUrl}. Update button icon based on isPlaying state. Display duration next to button formatted as MM:SS (e.g., 90s → "1:30"), text-sm muted color. No global playback context — simple component.
  VERIFY:
  1. Manually create a test pitch in Supabase with audio_url
  2. Navigate to `http://localhost:3000`
  3. Scroll to featured pitches section
  4. Verify play button appears on pitch card
  5. Click play — verify audio starts (check browser audio icon)
  6. Verify button changes to pause icon
  7. Click pause — verify audio stops
  8. Verify duration displays correctly (MM:SS format)
  9. Screenshot: `verification/landing-page-5.1.png`

## 6. Featured Pitches Section

- [ ] **6.1 Create FeaturedPitches component with AudioPlayer**
  `src/components/FeaturedPitches.tsx` — Client component
  Client component accepting `pitches: FeaturedPitch[]` prop. Renders section heading "Featured Pitches" and grid layout (3 columns desktop, 1-2 mobile). Each pitch card shows: book cover (or fallback), book title, author, user name, rating badge, first 100 chars of pitch_text. Integrate AudioPlayer component into each card when `audio_url` exists. Add empty state: when `pitches.length === 0`, show centered message "No pitches yet. Be the first to record!" with a signup CTA link.
  VERIFY:
  1. Navigate to `http://localhost:3000`
  2. Scroll to featured pitches section
  3. Verify pitch cards display in 3-column grid (desktop)
  4. Verify each card shows book cover, title, author, user name, rating, pitch text preview
  5. Verify audio player appears when audio_url exists
  6. Resize to mobile (375px) — verify responsive layout (1-2 columns)
  7. Screenshot: `verification/landing-page-6.1.png`

## 7. Category Grid

- [ ] **7.1 Update CategoryCard and create category grid section**
  `src/components/CategoryCard.tsx`, `src/app/page.tsx` — Category layout
  Update CategoryCard to link to `/discover?category=<slug>` instead of `/categories/[slug]`. If pitch count is not already displayed in CategoryCard, add it as subtitle: "N pitches" below category name (text-sm, muted color). In page.tsx, replace existing horizontal category layout with 2x5 grid (desktop) and 2-column (mobile). Add section heading "Browse by Category". Use updated CategoryCard component. Style grid with gap-4, parchment aesthetic.
  VERIFY:
  1. Navigate to `http://localhost:3000`
  2. Scroll to category grid section
  3. Verify categories display in 2x5 grid on desktop
  4. Verify each card shows category name and pitch count
  5. Click a category card — verify navigation to `/discover?category=<slug>`
  6. Resize to mobile (375px) — verify 2-column layout
  7. Screenshot: `verification/landing-page-7.1.png`

## 8. Page Integration

- [ ] **8.1 Replace homepage content with new landing page**
  `src/app/page.tsx` — Main layout assembly
  Remove existing hero, featured books, and search result logic. Add ISR with `export const revalidate = 3600`. Fetch featured pitches via `getFeaturedPitches()` and categories via existing query. Render new component stack: HeroSection → HowItWorks → FeaturedPitches → CategoryGrid. Ensure page uses Server Component pattern.
  VERIFY:
  1. Navigate to `http://localhost:3000`
  2. Verify entire page uses parchment background color
  3. Verify sections render in order: Hero → How It Works → Featured → Categories
  4. Scroll through entire page — verify consistent spacing and visual hierarchy
  5. Screenshot: `verification/landing-page-8.1.png`

## 9. SEO & Accessibility

- [ ] **9.1 Add SEO metadata, JSON-LD, and contrast audit**
  `src/app/page.tsx`, `src/app/globals.css` — SEO and accessibility
  Export `metadata` object with enhanced title ("Book Pitches — Share your book picks in 90 seconds"), description, Open Graph image (use placeholder for V1), twitter card tags. Add `<script type="application/ld+json">` with WebSite schema including name, url, description. Test all text/background combinations using WebAIM Contrast Checker — ensure dark brown (#3D2B1F) on parchment (#F5F0E8) meets 4.5:1. Adjust if needed. Add focus-visible ring styles to CTA button and audio player buttons (warm-brown color).
  VERIFY:
  1. Navigate to `http://localhost:3000`
  2. View page source — verify Open Graph meta tags exist
  3. Search for "application/ld+json" — verify structured data script exists
  4. Use WebAIM Contrast Checker — verify all text meets WCAG AA (4.5:1)
  5. Use keyboard Tab key to navigate — verify visible focus states on interactive elements
  6. Screenshot: `verification/landing-page-9.1.png`

## 10. Integration Testing — Real Data

- [ ] **10.1 Test with real pitch data**
  `Supabase Console` — Data seeding
  Manually create 3-6 test pitches in Supabase with ratings >= 7, audio_url (use sample MP3), and complete book/user relationships. Verify featured section populates correctly with real data. Play audio to confirm playback works.
  VERIFY:
  1. Create test pitches in Supabase with audio files
  2. Navigate to `http://localhost:3000`
  3. Verify featured pitches display with real data
  4. Play audio on multiple cards — verify playback works
  5. Verify book covers display correctly
  6. Screenshot: `verification/landing-page-10.1.png`

## 11. Integration Testing — Empty State

- [ ] **11.1 Test empty state (no pitches)**
  `Supabase Console` — Empty database
  Temporarily set all pitch ratings < 7 (or delete pitches). Verify empty state message displays with CTA in featured section. Verify hero and categories still render correctly.
  VERIFY:
  1. Set all pitch ratings < 7 in Supabase
  2. Navigate to `http://localhost:3000`
  3. Verify featured section shows "No pitches yet" message
  4. Verify signup CTA appears and links to `/signup`
  5. Verify hero and categories sections still work
  6. Screenshot: `verification/landing-page-11.1.png`

## 12. Mobile Responsiveness Audit

- [ ] **12.1 Test all breakpoints**
  `Browser DevTools` — Responsive design
  Test page on mobile viewport (375px width), tablet (768px), desktop (1440px). Verify all sections adapt correctly, images don't break layout, text remains readable. Verify no horizontal scroll on any breakpoint. Test SearchBar in hero on mobile.
  VERIFY:
  1. Open DevTools → Responsive Design Mode
  2. Set viewport to 375px (mobile) — verify all sections work
  3. Set viewport to 768px (tablet) — verify all sections work
  4. Set viewport to 1440px (desktop) — verify all sections work
  5. Verify SearchBar is usable on mobile
  6. Verify no horizontal scroll on any breakpoint
  7. Screenshot: `verification/landing-page-12.1.png`

## 13. Performance & Lighthouse Audit

- [ ] **13.1 Run Lighthouse audit**
  `Lighthouse` — Performance check
  Run Lighthouse audit on homepage. Target: Performance score >= 90, Accessibility >= 95, LCP < 2.5s. Address any critical issues. Verify Lora font loads efficiently (next/font/google should handle subsetting and preloading).
  VERIFY:
  1. Navigate to `http://localhost:3000`
  2. Open DevTools → Lighthouse
  3. Run audit for Desktop and Mobile
  4. Verify Performance >= 90
  5. Verify Accessibility >= 95
  6. Verify LCP < 2.5s
  7. Screenshot: `verification/landing-page-13.1.png`

---

**Task Signature Format:** Each task commit message should follow: "Add [component/feature] — [brief description]"

**Example:** "Add HeroSection component with Lora serif heading, SearchBar, and CTA button"

**Dependencies:**
- No design system setup needed — already applied globally
- Task 2.1 must complete before 6.1 (data layer required for featured pitches)
- Task 5.1 must complete before 6.1 (audio player required for integration)
- Tasks 3.1, 4.1, 5.1, 6.1, 7.1 must complete before 8.1 (all components required for page assembly)
- Task 8.1 must complete before 9.1, 10.1, 11.1, 12.1, 13.1 (page must exist for testing)
