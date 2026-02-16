# Open Library Search

## Why
Users need to find and import books from Open Library to pitch them. Instead of manually managing a static book list, books are dynamically created from Open Library API data when a user searches and selects a result. This enables unlimited book coverage and automatic deduplication when multiple users pitch the same book.

## What Changes
- Add book search component that queries Open Library API (`https://openlibrary.org/search.json`)
- Display search results with cover thumbnails, title, author, and publish year
- Implement selection flow: user picks a result → book record created in Supabase (or reused if exists)
- Deduplicate books by `open_library_key` (each book record maps to one Open Library identifier)
- Handle API latency gracefully with loading states and debounced input
- Gracefully handle API errors (timeouts, slow responses)

## Capabilities

### New Capabilities
- `book-search`: Query Open Library API by title/author; display paginated results with cover images
- `book-import`: Convert Open Library result into Supabase book record; auto-populate `open_library_key`, `title`, `author`, `cover_url`, `description`, `published_year`
- `book-deduplication`: Check if book already exists by `open_library_key` before creating; reuse existing record if found
- `search-debouncing`: Debounce search input to reduce API calls; show loading state while fetching

### Modified Capabilities
- `book-discovery`: Books no longer seeded from static list; created on-demand during pitch recording flow
- `book-records`: `books` table now requires `open_library_key` field for new records created via search

## Impact

### Affected Code
- **New component:** `BookSearchDialog` or `BookSearch` — search input, results list, selection handler
- **API route:** `POST /api/books/search` — proxy Open Library queries; handle dedup logic
- **Database hooks:** `useBooks` — add mutation for `createOrGetBook(open_library_key, metadata)`
- **Pitch recording flow:** Integrate search step before audio recording
- **Types:** Extend `Book` type with `open_library_key`, ensure `cover_url` and `description` optional vs. required

### Dependencies
- **Open Library API:** Free, no auth required. Search endpoint: `https://openlibrary.org/search.json?q=<query>&limit=10`
- **Supabase:** Existing client; no new dependencies
- **HTTP client:** Use `fetch` (built-in) or existing HTTP library

### Network & Performance
- Open Library can be slow (2–5s response times); implement UI feedback
- Debounce search input (300–500ms) to avoid excessive API calls
- Cache search results client-side (optional, low priority for V1)
- Timeout handling: abort requests if no response after 5s

### Data Model (No Changes Required)
- `books` table already has `open_library_key` field (from new-schema proposal)
- UNIQUE constraint on `open_library_key` ensures no duplicates

### Breaking Changes
None — this is additive to the existing flow.
