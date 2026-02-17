# Discovery Page — PRD

> **Feature:** discovery-page
> **Status:** draft
> **Generated:** 2026-02-17
> **Project:** Book Pitches (Next.js 16 / Supabase / Tailwind 4)

---

## 1. Problem

New visitors need an engaging entry point to discover the best book pitches on the platform without requiring authentication. The current `/books` page exists but lacks critical discovery features like category filtering, flexible sorting options, and a curated browsing experience optimized for public engagement.

## 2. Solution

Build a public `/discover` route (or enhance the existing `/books` page) with category filtering, multiple sort options (highest rated, most recent, most pitches), text search, and a responsive book card grid. The page uses URL-based state for shareability and SEO, server-side rendering for fast initial loads, and the existing `book_with_stats` view for efficient aggregated queries.

## 3. Capabilities

| Capability | Type | Description |
|------------|------|-------------|
| **Category Filtering** | New | Filter books by predefined categories (AI, Business, Spirituality, etc.) via clickable pill UI |
| **Multi-Sort Options** | New | Sort by "Most Recent" (default), "Highest Rated", or "Most Pitches" |
| **Text Search** | Modified | Enhance existing search to work seamlessly with filters and sorting |
| **URL-Based State** | New | Category, sort, and search params live in URL for shareability and SEO |
| **Responsive Grid** | Existing | Reuse BookGrid component with BookCard for consistent presentation |
| **Offset Pagination** | New | Simple page-based pagination (12 books per page) using ?page=N&limit=12 |

## 4. Scope

**In scope:**
- Public `/discover` route (replaces `/books` listing page)
- Category filter UI with horizontally scrollable pills
- Category pre-selection from URL params (e.g., clicking homepage category card navigates to `/discover?category=ai` with pill highlighted)
- Sort dropdown with 3 options: Most Recent (default), Highest Rated, Most Pitches
- Integration of existing SearchBar component with new filters
- URL search params for all state (category, sort, search, page)
- Server Component architecture for SEO and performance
- Offset-based pagination with page numbers and Previous/Next navigation
- Reuse existing BookCard, BookGrid, SearchBar, CategoryCard components
- Query layer enhancements in `queries.ts` for filtered/sorted discovery
- Redirect `/books` → `/discover` (book detail pages at `/books/{slug}` still work)

**Out of scope:**
- Personalized recommendations (V2)
- Advanced search filters (year range, rating range)
- Full-text search with pg_trgm ranking (V2)
- Infinite scroll (pagination for SEO)
- User-specific filtering
- Audio playback on discovery cards (audio only on book detail pages)

## 5. Technical Design

### Architecture

```
┌─────────────────────────────────────────────────┐
│  /discover (or /books)                          │
│  Server Component                               │
│  ├─ Parse URL params (category, sort, q, cursor)│
│  ├─ Call getDiscoveryBooks(filters)             │
│  ├─ Render CategoryFilter (client)              │
│  ├─ Render SortDropdown (client)                │
│  ├─ Render SearchBar (client)                   │
│  ├─ Render BookGrid (server)                    │
│  └─ Render Pagination (client)                  │
└─────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────┐
│  queries.ts                                     │
│  getDiscoveryBooks(options)                     │
│  ├─ Query book_with_stats                       │
│  ├─ Join book_categories if category filter     │
│  ├─ Apply ILIKE search if query                 │
│  ├─ Order by sort option                        │
│  └─ Cursor pagination (limit 12)                │
└─────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Choice | Why | Alternative Considered |
|----------|--------|-----|------------------------|
| **State Management** | URL search params for all filters | Every filtered view is shareable/bookmarkable; great for SEO; no client state needed | Client-side state with SPA — faster interactions but worse SEO and requires loading states |
| **Search Implementation** | ILIKE for V1, pg_trgm later | Simple, no extensions required, works fine at V1 scale (hundreds of books) | pg_trgm with GIN indexes — better quality but premature for V1 scale |
| **Pagination** | Offset-based using page number | Simple, intuitive URLs (?page=2), works fine at V1 scale (hundreds of books), easier to implement | Cursor-based — better at massive scale but overcomplicated for V1 |
| **Category UI** | Horizontal scrollable pills | Fits 10 categories naturally on desktop, scrolls on mobile, touch-friendly | Sidebar with category list — requires drawer on mobile, more complex layout |
| **Default Sort** | Most Recent (MAX(pitches.created_at) per book) | Shows books with newest pitches first, gives recent activity visibility, avoids rich-get-richer effect | Highest Rated — rewards quality but creates permanence at top |
| **Component Reuse** | Existing BookCard/BookGrid/SearchBar | Visual consistency, reduced code duplication | New components — leads to inconsistency |

### Data Model

**No schema changes required.** Uses existing tables and views:

- `book_with_stats` view (has `avg_rating`, `pitch_count`)
- `book_categories` table for category filtering
- `categories` table for category metadata
- `pitches` table for "most recent" sort

**New query function signature:**

```typescript
interface DiscoveryOptions {
  categorySlug?: string
  sort?: 'recent' | 'rating' | 'pitches'
  search?: string
  page?: number
  limit?: number
}

async function getDiscoveryBooks(options: DiscoveryOptions): Promise<{
  books: BookWithStats[]
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
}>
```

### Key Interfaces

```typescript
// Client Components
interface CategoryFilterProps {
  categories: Array<Category & { book_count: number }>
  selectedSlug?: string
  basePath: string
}

interface SortDropdownProps {
  currentSort: 'recent' | 'rating' | 'pitches'
  basePath: string
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

// Page Props
interface DiscoveryPageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
    q?: string
    page?: string
  }>
}
```

## 6. UX Flow

1. User lands on `/discover` (or navigates from home/navigation)
2. Page loads with default state: no category filter, sorted by "Most Recent", no search, first page
3. User sees horizontally scrollable category pills at top (with "All" selected by default)
4. **Category pre-selection:** If user clicks a category card on homepage (or anywhere) and navigates to `/discover?category=ai`, the "AI" pill is automatically highlighted and books are filtered on page load
5. Below pills: sort dropdown (left) and search bar (right) on same row
6. Below controls: responsive grid of BookCards (12 per page)
7. User clicks category pill (e.g., "AI") → navigates to `/discover?category=ai`
8. Page reloads showing only AI books, pill highlighted
9. User changes sort to "Highest Rated" → URL updates to `/discover?category=ai&sort=rating`
10. User types search query → debounced navigation to `/discover?category=ai&sort=rating&q=thinking`
11. User clicks "Next" → URL updates to `/discover?category=ai&sort=rating&q=thinking&page=2`
12. User clicks book card → navigates to `/books/{slug}` (existing book detail page)
13. User clears search → returns to filtered/sorted view without search
14. User clicks "All" category → removes category filter from URL
15. **Legacy route handling:** User visits `/books` → redirected to `/discover` (book detail pages at `/books/{slug}` still work)

## 7. Requirements

**REQ-01**: The page SHALL display all books that have at least one pitch WHEN no filters are applied.

**REQ-02**: The page SHALL filter books by category WHEN a category pill is clicked, showing only books tagged with that category.

**REQ-03**: The page SHALL support three sort options: "Most Recent" (default), "Highest Rated", and "Most Pitches" WHEN user selects from sort dropdown.

**REQ-04**: The page SHALL sort by most recently pitched book (MAX(pitches.created_at) per book, descending) WHEN "Most Recent" is selected.

**REQ-05**: The page SHALL sort by average rating (descending) WHEN "Highest Rated" is selected.

**REQ-06**: The page SHALL sort by pitch count (descending) WHEN "Most Pitches" is selected.

**REQ-07**: The page SHALL search books by title or author (case-insensitive partial match) WHEN user enters a search query.

**REQ-08**: The page SHALL combine category filter, sort, and search filters WHEN multiple filters are active.

**REQ-09**: The page SHALL store all filter state in URL search parameters WHEN any filter changes.

**REQ-10**: The page SHALL display 12 books per page WHEN rendering the grid.

**REQ-11**: The page SHALL use offset-based pagination with page numbers WHEN navigating between pages.

**REQ-12**: The page SHALL show "Previous" link WHEN current page > 1 THEN navigate to previous page (?page=N-1).

**REQ-13**: The page SHALL show "Next" link WHEN there are more results THEN navigate to next page (?page=N+1).

**REQ-14**: The page SHALL highlight the selected category pill WHEN a category filter is active.

**REQ-15**: The page SHALL show "All" pill as selected WHEN no category filter is active.

**REQ-16**: The page SHALL display category pills in a horizontally scrollable row WHEN viewport is narrow.

**REQ-17**: The page SHALL render as a Server Component WHEN page loads for SEO and performance.

**REQ-18**: The page SHALL show empty state message WHEN no books match the current filters.

**REQ-19**: The page SHALL reuse existing BookCard component WHEN rendering book grid items.

**REQ-20**: The page SHALL reuse existing SearchBar component WHEN rendering search input.

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Empty discovery page if no pitches exist yet | Low | Medium | Show friendly empty state with CTA to "Be the first to record a pitch!" linking to pitch creation |
| ILIKE search performance degrades at scale | Medium | Medium | Acceptable at V1 scale (hundreds of books). Add pg_trgm GIN indexes in V2 when catalog grows to thousands |
| Category pills take too much vertical space on mobile | Low | Low | Use single scrollable row, keep UI compact, ensure pills are touch-friendly |
| SEO issues with filtered URLs as duplicate content | Low | Medium | Use canonical URLs appropriately — unfiltered `/discover` is canonical, filtered views use rel=canonical |
| Complex cursor pagination logic with multiple sort options | Medium | Low | Start with single sort field (created_at), keep cursor format simple, test edge cases |
| User confusion between /books and /discover routes | Low | Low | Either replace /books with /discover or redirect one to the other for consistency |

## 9. Success Criteria

- [ ] Discovery page is publicly accessible without authentication
- [ ] All 10 categories display in scrollable pill UI
- [ ] Category filtering works correctly (books match selected category)
- [ ] Sort dropdown has 3 options and applies correct ordering
- [ ] Search works with category and sort filters combined
- [ ] URL parameters correctly represent all filter state
- [ ] Pagination shows correct Previous/Next links based on results
- [ ] BookGrid displays 12 books per page in responsive layout
- [ ] Empty state appears when no results match filters
- [ ] Page is server-rendered and SEO-friendly
- [ ] All interactive elements (pills, dropdown, search) work smoothly
- [ ] Clicking book card navigates to existing book detail page

## 10. Impact

### New Files

| File | Purpose |
|------|---------|
| `src/app/discover/page.tsx` | Main discovery page (or enhance existing `/books/page.tsx`) |
| `src/components/CategoryFilter.tsx` | Horizontally scrollable category pill selector (client component) |
| `src/components/SortDropdown.tsx` | Sort option selector (client component) |
| `src/components/Pagination.tsx` | Cursor-based pagination controls (client component) |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/supabase/queries.ts` | Add `getDiscoveryBooks()` function with category, sort, search, cursor filtering |
| `src/components/SearchBar.tsx` | Potentially enhance to preserve other query params when searching |
| `src/components/Navigation.tsx` | Replace "Browse" link with "Discover" link pointing to `/discover` |
| `next.config.ts` or `src/app/books/page.tsx` | Redirect `/books` → `/discover` (keep `/books/[slug]` for book detail pages) |
