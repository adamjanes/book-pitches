# Discovery Page — Tasks

> **PRD:** [PRD.md](./PRD.md)
> **Status:** 0/14 tasks complete

---

## 1. Data Layer

- [ ] **1.1 Create getDiscoveryBooks query function**
  `src/lib/supabase/queries.ts` — getDiscoveryBooks(options): Promise<{ books, totalCount, hasNextPage, hasPrevPage }>
  Create query function supporting category filter (via book_categories join), sort options (recent/rating/pitches), ILIKE search, and offset-based pagination. Default to 12 books per page. For "recent" sort, LEFT JOIN to pitches table and use MAX(pitches.created_at) grouped by book.id, ordered DESC. Use book_with_stats view as base. Return totalCount for pagination calculation.

- [ ] **1.2 Add buildDiscoveryUrl helper**
  `src/lib/utils.ts` — buildDiscoveryUrl({ category, sort, search, page })
  Utility function to construct /discover URLs with query params. Handles encoding, omits empty/default params (page=1 omitted, sort='recent' omitted), ensures consistent URL format for navigation components.

## 2. Client Components

- [ ] **2.1 Create CategoryFilter component with styling**
  `src/components/CategoryFilter.tsx` — CategoryFilter({ categories, selectedSlug, basePath })
  Horizontally scrollable pill selector with "All" option + category pills. Client component using Next.js Link for navigation. **Reads `category` URL param and highlights matching pill on page load** (enables pre-selection when navigating from homepage category cards). Tailwind styling: card/button theme styles, selected pill has accent background, unselected has neutral background. Smooth scroll behavior, adequate padding for touch targets (min 44×44px). Mobile-friendly touch scrolling with `overflow-x-auto`.
  VERIFY:
  1. Start dev server: `npm run dev`
  2. Navigate to `http://localhost:3000/discover?category=ai`
  3. Assert category pills render horizontally with scroll
  4. Assert "AI" pill is highlighted with accent background (pre-selected from URL)
  5. Click "Business" category pill
  6. Assert URL updates to `/discover?category=business`
  7. Assert "Business" pill is now highlighted
  8. Assert pills have consistent styling with existing theme
  9. Screenshot: `verification/discovery-page-2.1.png`

- [ ] **2.2 Create SortDropdown component with styling**
  `src/components/SortDropdown.tsx` — SortDropdown({ currentSort, basePath })
  Dropdown/select with 3 options: "Most Recent" (default), "Highest Rated", "Most Pitches". Client component that preserves other query params (category, search) when changing sort. Uses URL navigation via Next.js Link or router.push(). Tailwind styling: match existing input field styling from SearchBar, dropdown chevron icon, proper focus states, accessible labels.
  VERIFY:
  1. Navigate to `http://localhost:3000/discover`
  2. Assert sort dropdown shows "Most Recent" as default
  3. Assert dropdown matches theme styling
  4. Focus dropdown with keyboard (Tab)
  5. Assert focus ring appears
  6. Open dropdown, select "Highest Rated"
  7. Assert URL updates to `/discover?sort=rating`
  8. Assert dropdown now shows "Highest Rated"
  9. Screenshot: `verification/discovery-page-2.2.png`

- [ ] **2.3 Create Pagination component with styling**
  `src/components/Pagination.tsx` — Pagination({ currentPage, totalPages, basePath })
  Previous/Next navigation buttons with page numbers. Disabled when at first/last page. Client component using Next.js Link. Preserves all query params (category, sort, search), changes only page number. Button styling: existing button theme styles, disabled state clearly visible (opacity/color), arrows or text labels ("Previous"/"Next") with spacing.
  VERIFY:
  1. Navigate to `http://localhost:3000/discover` (assuming >12 books exist)
  2. Assert "Next" button is enabled
  3. Assert "Previous" button is disabled with distinct visual state
  4. Assert pagination buttons match existing button styles
  5. Click "Next"
  6. Assert URL is `/discover?page=2`
  7. Assert "Previous" button is now enabled and styled correctly
  8. Screenshot: `verification/discovery-page-2.3.png`

## 3. Page Implementation

- [ ] **3.1 Create /discover route with all components**
  `src/app/discover/page.tsx` — Server Component with searchParams handling
  Parse searchParams for category, sort, q, page (all optional). Call getDiscoveryBooks() with parsed options. Fetch categories for CategoryFilter UI. Render layout: CategoryFilter at top, SortDropdown + SearchBar in flexbox row below, BookGrid (reuse existing component), Pagination at bottom. Add generateMetadata() function for dynamic SEO (title format: "Discover {Category} Books | Book Pitches" or "Book Discovery | Book Pitches"). Include canonical URL handling.

- [ ] **3.2 Implement empty state and responsive layout**
  `src/app/discover/page.tsx` — Conditional rendering for zero results + layout
  When books.length === 0, show friendly message: "No books found. Try adjusting your filters or be the first to record a pitch!" Include CTA button linking to pitch creation (if exists) or books search. Responsive layout: stack vertically on mobile (category pills row → sort/search row → grid), horizontal arrangement on desktop if space allows. Maintain consistent spacing, use existing card/button styles.
  VERIFY:
  1. Navigate to `http://localhost:3000/discover?q=zzznobookexists123`
  2. Assert empty state message appears
  3. Assert message includes helpful text about adjusting filters
  4. Resize viewport to 375px wide (mobile)
  5. Assert category pills scroll horizontally
  6. Assert sort and search are in flexbox row
  7. Resize viewport to 1280px (desktop)
  8. Assert layout adapts appropriately
  9. Screenshot: `verification/discovery-page-3.2-empty.png`, `verification/discovery-page-3.2-mobile.png`, `verification/discovery-page-3.2-desktop.png`

## 4. Navigation

- [ ] **4.1 Replace "Browse" nav link with "Discover"**
  `src/components/Navigation.tsx` — Change existing "Browse" link
  Replace "Browse" link (currently pointing to /books) with "Discover" link pointing to /discover. Ensure active state styling when on /discover route. Update link text from "Browse" to "Discover".
  VERIFY:
  1. Navigate to `http://localhost:3000`
  2. Assert "Discover" link appears in navigation (no "Browse" link)
  3. Click "Discover" link
  4. Assert navigates to `/discover`
  5. Assert link has active state styling
  6. Screenshot: `verification/discovery-page-4.1.png`

- [ ] **4.2 Create redirect from /books to /discover**
  `next.config.ts` — Add redirect configuration
  Add redirect rule: `/books` → `/discover` (permanent: false). **DO NOT** redirect `/books/:slug` — individual book detail pages should still work at `/books/{slug}`. Use Next.js redirects array in next.config.ts with source: `/books`, destination: `/discover`, and has: undefined to prevent matching paths with segments.
  VERIFY:
  1. Navigate to `http://localhost:3000/books`
  2. Assert redirects to `http://localhost:3000/discover`
  3. Navigate to `http://localhost:3000/books/some-book-slug`
  4. Assert does NOT redirect (book detail page loads normally)
  5. Screenshot: `verification/discovery-page-4.2.png`

- [ ] **4.3 Enhance SearchBar to preserve query params**
  `src/components/SearchBar.tsx` — Accept and preserve current searchParams
  Modify SearchBar to accept current searchParams prop (optional, for backwards compatibility). When provided, preserve non-search params (category, sort, page) when building search URL. Ensure existing usage still works. Use buildDiscoveryUrl() helper if applicable.
  VERIFY:
  1. Navigate to `http://localhost:3000/discover?category=ai&sort=rating`
  2. Type "thinking" in search
  3. Wait for debounce (300ms)
  4. Assert URL becomes `/discover?category=ai&sort=rating&q=thinking`
  5. Assert category and sort are preserved
  6. Clear search
  7. Assert URL returns to `/discover?category=ai&sort=rating`
  8. Screenshot: `verification/discovery-page-4.3.png`

## 5. Integration & E2E Verification

- [ ] **5.1 Test category + sort filtering**
  Manual test with data verification
  Create test data with books in different categories if needed. Verify filter works correctly, URL updates, results match filter. Test sort options work correctly with filtering.
  VERIFY:
  1. Navigate to `http://localhost:3000/discover`
  2. Note total book count
  3. Click "Business" category
  4. Assert URL is `/discover?category=business`
  5. Assert only Business books appear
  6. Select "Highest Rated" sort
  7. Assert URL is `/discover?category=business&sort=rating`
  8. Assert books reorder (highest rated Business books first)
  9. Click "All" category
  10. Assert URL is `/discover?sort=rating`
  11. Assert all books reappear, sorted by rating
  12. Screenshot: `verification/discovery-page-5.1.png`

- [ ] **5.2 Test search + filter integration**
  Verify search works with category and sort
  Test search alone, search + category, search + category + sort combinations. Verify debounce works (300ms).
  VERIFY:
  1. Navigate to `http://localhost:3000/discover?category=ai&sort=rating`
  2. Type "thinking" in search bar
  3. Wait for debounce (300ms)
  4. Assert URL is `/discover?category=ai&sort=rating&q=thinking`
  5. Assert results match all three filters
  6. Clear search
  7. Assert URL returns to `/discover?category=ai&sort=rating`
  8. Change sort to "Most Pitches"
  9. Assert URL is `/discover?category=ai&sort=pitches`
  10. Screenshot: `verification/discovery-page-5.2.png`

- [ ] **5.3 Test pagination with filters**
  Verify offset-based pagination works correctly
  Ensure next/prev navigation preserves filters (category, sort, search). Test edge cases (first/last page). Verify page numbers are correct.
  VERIFY:
  1. Navigate to `http://localhost:3000/discover` (ensure >12 books exist)
  2. Assert page shows 12 books
  3. Assert "Next" enabled, "Previous" disabled
  4. Click "Next"
  5. Assert URL is `/discover?page=2`
  6. Assert new set of up to 12 books appears
  7. Assert "Previous" now enabled
  8. Click "Previous"
  9. Assert URL is `/discover` (page=1 omitted)
  10. Assert returns to first page
  11. Navigate to `/discover?category=ai&sort=rating&page=2`
  12. Assert category and sort filters are preserved on page 2
  13. Screenshot: `verification/discovery-page-5.3.png`

- [ ] **5.4 E2E test: Full discovery flow + accessibility**
  End-to-end test of complete user journey + keyboard navigation
  User lands on /discover → filters by category → sorts → searches → paginates → clicks book → arrives at book detail page. All filters work together correctly, URLs are shareable, back button works. Also verify keyboard navigation and ARIA labels.
  VERIFY:
  1. Navigate to `http://localhost:3000/discover`
  2. Click "AI" category
  3. Select "Highest Rated" sort
  4. Type "neural" in search
  5. Assert URL is `/discover?category=ai&sort=rating&q=neural`
  6. Assert results match all filters
  7. Click "Next" (if available)
  8. Assert pagination preserves filters (URL includes page param)
  9. Click a book card
  10. Assert navigates to `/books/{slug}`
  11. Use browser back button
  12. Assert returns to filtered discovery page with state intact
  13. Use Tab key to navigate through category pills
  14. Assert pills are focusable with visible focus ring
  15. Press Enter on a category pill
  16. Assert filter applies
  17. Tab to sort dropdown, open with keyboard
  18. Tab to search input, type and verify works
  19. Tab to pagination buttons, activate with Enter
  20. Screenshot: `verification/discovery-page-5.4-flow.png`, `verification/discovery-page-5.4-keyboard.png`

- [ ] **5.5 Responsive + SEO verification**
  Verify mobile/tablet/desktop layouts + server-side rendering
  Test on various viewport sizes, ensure horizontal scroll works on category pills, grid adapts correctly. Check server-side rendering (view source shows book data), metadata is correct.
  VERIFY:
  1. Navigate to `http://localhost:3000/discover`
  2. Resize to 375px (iPhone)
  3. Assert category pills scroll horizontally
  4. Assert BookGrid shows 1-2 columns
  5. Resize to 768px (tablet)
  6. Assert BookGrid shows 2-3 columns
  7. Resize to 1280px (desktop)
  8. Assert BookGrid shows 3-4 columns
  9. View page source (Ctrl+U or Cmd+Option+U)
  10. Assert book data is present in initial HTML (server-rendered)
  11. Assert meta tags include correct title and description
  12. Navigate to `http://localhost:3000/discover?category=ai`
  13. Assert meta title includes "AI" or "Discover AI Books"
  14. Screenshot: `verification/discovery-page-5.5-mobile.png`, `verification/discovery-page-5.5-tablet.png`, `verification/discovery-page-5.5-desktop.png`
