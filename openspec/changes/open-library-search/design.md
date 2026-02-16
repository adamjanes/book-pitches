# Open Library Search — Design Document

## Context

The book-pitches app lets users search for books and record audio elevator pitches. Instead of seeding a static book database, books are imported on-demand from the Open Library API when users search for them during the pitch recording flow. The database schema (from new-schema change) defines a `books` table with `open_library_key` (unique, nullable) for deduplication. Open Library is a free, public API with no auth required but can be slow (2-5s response times).

## Goals / Non-Goals

**Goals:**
- Search Open Library by title/author and display results with covers
- Import selected books into Supabase (or reuse existing records)
- Deduplicate books by Open Library work key
- Handle API latency gracefully with loading states and debounced input
- Provide a reusable BookSearch component for the pitch recording flow

**Non-Goals:**
- Bulk importing books or batch syncing from Open Library
- Caching Open Library results server-side (V2 optimization)
- Supporting ISBN-based search (title/author search covers this)
- Syncing book metadata updates from Open Library after import
- Building a standalone book browsing page (that's the discovery-page change)

## Decisions

### Decision 1: Direct client-side fetch to Open Library API

**Choice:** Fetch Open Library search results directly from the browser. No API route proxy.

**Why:** Open Library's search API is public, requires no auth, and supports CORS. A proxy adds latency (client → server → OL → server → client) and server load without benefit. The search endpoint returns JSON that can be consumed directly by the React component.

**Alternative considered:** Next.js API route proxy (`/api/books/search`). Would allow server-side caching and rate limiting, but adds unnecessary complexity for V1. The API is free and has no published rate limits for reasonable use.

**Endpoint:** `https://openlibrary.org/search.json?q={query}&limit=10&fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median`

### Decision 2: Open Library work key for deduplication

**Choice:** Use the work key (e.g., `/works/OL45883W`) as the `open_library_key` in the books table.

**Why:** Work keys group all editions of a book under one identifier. If User A pitches the hardcover of "Thinking, Fast and Slow" and User B pitches the paperback, they share the same work key and therefore the same book record. Edition keys would create duplicate book entries for different formats.

**Alternative considered:** Edition key (`/books/OL7353617M`). More specific but creates duplicates across editions — defeats the purpose of a canonical book record.

### Decision 3: Debounce search input at 300ms

**Choice:** Debounce user input with a 300ms delay before triggering an API call. Show a loading spinner during fetch.

**Why:** 300ms is the sweet spot — fast enough to feel responsive, slow enough to avoid firing on every keystroke. Open Library's API is slow (2-5s), so reducing unnecessary calls matters. Combined with an AbortController to cancel in-flight requests when new input arrives.

**Alternative considered:** 500ms debounce. Feels sluggish. 100ms debounce. Fires too many requests, especially during fast typing.

### Decision 4: Cover image URL construction from cover ID

**Choice:** Construct cover URLs using Open Library's covers API: `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg` (medium size).

**Why:** The search API returns a `cover_i` field (cover ID integer), not a full URL. The covers API is a simple CDN-backed URL pattern. Medium size (-M, ~180px) is appropriate for search result thumbnails. Store this constructed URL in `books.cover_url`.

**Size options:** -S (small, ~40px), -M (medium, ~180px), -L (large, ~500px). Use -M for cards, -L for book detail pages.

### Decision 5: Create-or-get pattern for book records

**Choice:** When a user selects a search result, check if a book with that `open_library_key` exists. If yes, return it. If no, insert a new record with metadata from Open Library. This is done via a Supabase query in a Server Action.

**Why:** The UNIQUE constraint on `open_library_key` prevents duplicates at the database level. The application-level check avoids hitting the constraint error on every selection. Using a Server Action (not a client-side insert) keeps the logic server-side where we can handle race conditions.

**Flow:**
1. User selects a search result
2. Server Action receives: title, author, open_library_key, cover_url, published_year, description
3. Query: `SELECT * FROM books WHERE open_library_key = $1`
4. If found: return existing book
5. If not: `INSERT INTO books (...) VALUES (...) RETURNING *`
6. Return book to client for the pitch form

**Alternative considered:** Supabase `upsert` with `onConflict: 'open_library_key'`. Cleaner SQL but would overwrite existing metadata on every selection, which we don't want (original data should be preserved).

### Decision 6: Minimal metadata from Open Library

**Choice:** Import only: title, author (first author), published_year (first_publish_year), cover_url (constructed), open_library_key, and description (from work detail endpoint if available).

**Why:** The search endpoint provides most fields directly. Description requires a second fetch to the work detail endpoint (`/works/{key}.json`), which is acceptable since it only happens once per book creation (not per search). Keep the import lightweight.

**Description fetch:** Optional — only when creating a new book record. If the second fetch fails, insert with NULL description. Can be backfilled later.

## Risks / Trade-offs

- **[Risk] Open Library API downtime** → The API occasionally has slow periods or outages. Mitigation: timeout after 8 seconds, show "search unavailable, try again" message. The app is usable without search (existing books still work).
- **[Risk] Missing cover images** → Not all books have covers in Open Library. Mitigation: show a placeholder book cover image when `cover_i` is null.
- **[Risk] Incorrect author data** → Open Library sometimes has multiple or incorrect author attributions. Mitigation: store `author_name[0]` (first author). Users can't edit this in V1, but the data is usually accurate for well-known books.
- **[Trade-off] No server-side caching** → Repeated searches for the same query hit Open Library each time. Acceptable for V1 — add Redis or in-memory cache if API becomes a bottleneck.
- **[Trade-off] Description requires second API call** → Adds latency to book creation. Acceptable since it only happens once per book (not per search or per pitch).
- **[Risk] Race condition on book creation** → Two users could create the same book simultaneously. Mitigation: the UNIQUE constraint on `open_library_key` prevents duplicates at the DB level. The second insert fails gracefully — catch the constraint error and return the existing record.

## Open Questions

- Should we fetch the book description during search (adds latency to every search) or only on book creation (adds latency once)? **Recommendation: on creation only.**
- Minimum search query length before firing API call? **Recommendation: 3 characters — avoids too-broad results.**
