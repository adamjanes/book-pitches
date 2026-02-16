# Discovery Page Design

## Context

The discovery page is the primary browsing experience for the platform — where visitors find pitched books across all users. It must work without authentication (public page) and provide filtering by category, sorting, and search. The database has 10 predefined categories (AI, Business, Spirituality, Psychology, Fiction, History, Science, Self-Help, Philosophy, Other). The `book_with_stats` view (from new-schema) provides pre-aggregated book data (average rating, pitch count). The platform uses a parchment/beige aesthetic with serif typography for headings.

## Goals / Non-Goals

**Goals:**
- Public `/discover` route showing all books with at least one pitch
- Category filtering via clickable pills
- Sorting: highest rated, most recent, most pitches
- Text search by title or author
- Responsive book card grid with cover, title, author, rating, pitch count
- Cursor-based pagination
- SEO-friendly (server-rendered, shareable URLs with filter state)

**Non-Goals:**
- Personalized recommendations — V2
- Advanced search (by year, by rating range, etc.)
- Full-text search with ranking (pg_trgm) — V2
- Infinite scroll (use pagination for SEO)
- User filtering (find books pitched by a specific user)

## Decisions

### Decision 1: Server Component with URL search params

**Choice:** The discovery page is a React Server Component. All filter state (category, sort, search, page) lives in URL search params (e.g., `/discover?category=ai&sort=rating&q=thinking`).

**Why:** URL-based state makes every filtered view shareable and bookmarkable. Server-rendered pages with the correct data are great for SEO. No client-side state management needed — the URL is the single source of truth. When a user clicks a category pill or changes sort, it navigates to a new URL and the Server Component re-renders with the new data.

**Alternative considered:** Client-side SPA with `useSearchParams` and client-side filtering. Faster interactions but worse SEO, requires loading states, and the server sends all data upfront (or needs a separate API endpoint).

### Decision 2: ILIKE search for V1, pg_trgm later

**Choice:** Text search uses PostgreSQL `ILIKE` on title and author columns: `WHERE title ILIKE '%query%' OR author ILIKE '%query%'`.

**Why:** ILIKE is simple, requires no extensions or indexes, and works fine at V1 scale (hundreds of books). It handles case-insensitive partial matching. When the book catalog grows to thousands, switch to `pg_trgm` for fuzzy matching and better performance.

**Alternative considered:** `pg_trgm` extension with GIN indexes. Better search quality (typo tolerance, ranking) but requires enabling the extension, creating indexes, and writing more complex queries. Premature for V1.

### Decision 3: Cursor-based pagination

**Choice:** Paginate discovery results using cursor-based pagination (keyset pagination) with `created_at` as the cursor. Show 12 books per page with "Previous" and "Next" links.

**Why:** Cursor-based pagination is more efficient than OFFSET-based for large datasets and produces stable results when new content is added. The page links use URL params (`?cursor=2025-01-15T10:00:00Z&direction=next`) so each page is a unique URL for SEO.

**Page size:** 12 books — works well in a 3-column grid (4 rows) and 2-column grid (6 rows) on different screen sizes.

**Alternative considered:** OFFSET-based pagination (`?page=2`). Simpler but has performance issues at high page numbers and produces unstable results when new pitches are added. Also considered infinite scroll — poor for SEO since all content is on one URL.

### Decision 4: Horizontally scrollable category pills

**Choice:** Categories displayed as a horizontally scrollable row of pill/chip buttons at the top of the page. Clicking a category filters the results. Clicking "All" (default) removes the filter.

**Why:** With 10 categories, a horizontal row fits on desktop screens and scrolls naturally on mobile. Pills are touch-friendly and visually clear — the selected pill is highlighted. This pattern is familiar from streaming services and e-commerce sites.

**Layout:** Fixed at the top of the discovery page, below the page title and above the sort/search controls.

**Alternative considered:** Sidebar with category list. Takes horizontal space on desktop, requires a drawer on mobile. More complex layout for the same functionality.

### Decision 5: Default sort by most recent

**Choice:** Default sort order is "most recently pitched" (by `pitches.created_at DESC` on the latest pitch for each book). Other sort options: "highest rated" (by average rating DESC), "most pitches" (by pitch count DESC).

**Why:** Most recent is the best default because it shows fresh content and gives new pitches visibility. Rating-based sorting biases toward books with few high ratings. Pitch count biases toward popular books. Users can switch sort via a dropdown.

**Sort implementation:** The `book_with_stats` view provides `avg_rating` and `pitch_count`. For "most recent," query by the max `created_at` from related pitches.

**Alternative considered:** Default to highest rated. Rewards quality but creates a rich-get-richer effect where high-rated books stay at the top permanently.

### Decision 6: Reusable BookCard component

**Choice:** Create a `BookCard` component used on both the discovery page and profile page. It displays: cover image, title, author, average rating (stars or number), and pitch count.

**Why:** Consistency across pages and reduced code duplication. The card is the primary visual unit of the platform — it should look and behave the same everywhere.

**Variants:** The card may show slightly different data depending on context (discovery: pitch count across all users; profile: user's own rating). Use props to control which data is displayed.

**Alternative considered:** Separate card components for discovery and profile. Leads to visual inconsistency and duplicated styling.

## Risks / Trade-offs

- **[Risk] Empty discovery page** → If no pitches exist yet, the page shows nothing. Mitigation: show a friendly "No pitches yet — be the first to record one!" state with a CTA linking to `/record`.
- **[Risk] ILIKE performance at scale** → `ILIKE '%query%'` can't use indexes and requires sequential scan. Mitigation: at V1 scale this is fast. Add `pg_trgm` GIN indexes when search performance degrades.
- **[Trade-off] No personalization** → All users see the same discovery page. Acceptable for V1 — personalized recommendations require usage data and a recommendation engine.
- **[Trade-off] Category pills take vertical space** → On mobile, the pills row plus sort/search controls push book content down. Mitigation: keep the UI compact — pills on one scrollable row, sort and search on one row below.
- **[Risk] SEO for filtered pages** → `/discover?category=ai` might be seen as duplicate content. Mitigation: use canonical URLs appropriately. The unfiltered `/discover` is the canonical; filtered views use `rel=canonical` pointing to the base page.

## Open Questions

- Should the search input be always visible or behind a search icon toggle? **Recommendation: always visible — search is a primary interaction on a discovery page.**
- Should we show audio players directly on the discovery page book cards, or only on the book detail page? **Recommendation: no audio on discovery cards — keep them as navigational elements. Audio plays on the book page where the full pitch context is shown.**
