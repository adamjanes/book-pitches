# Open Library Search Tasks

## 1. Open Library API Client

- [x] 1.1. Create `src/lib/openlibrary.ts` with types for Open Library search response (`OLSearchResult`, `OLSearchResponse`) and a `searchBooks(query: string)` function that fetches from `https://openlibrary.org/search.json?q={query}&limit=10&fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median`
- [ ] 1.2. Add `fetchBookDescription(workKey: string)` function that fetches from `https://openlibrary.org/works/{key}.json` and extracts description (handling both string and `{value: string}` formats). Return null on failure.
- [ ] 1.3. Add `getBookCoverUrl(coverId: number | null, size: 'S' | 'M' | 'L')` helper that constructs `https://covers.openlibrary.org/b/id/{coverId}-{size}.jpg` or returns null if no coverId

## 2. Book Create-or-Get Server Action

- [ ] 2.1. Create `src/app/actions/books.ts` with a `createOrGetBook` Server Action that accepts Open Library metadata (title, author, openLibraryKey, coverUrl, publishedYear)
- [ ] 2.2. Implement dedup logic: query `books` table by `open_library_key` first, return existing record if found
- [ ] 2.3. If not found, fetch description from Open Library work detail endpoint, generate slug from title, insert new book record, return it
- [ ] 2.4. Handle race condition: catch unique constraint error on `open_library_key` and return the existing record instead of throwing

## 3. BookSearch Component

- [ ] 3.1. Create `src/components/BookSearch.tsx` client component with a search input field and results area
- [ ] 3.2. Implement 300ms debounce on input using a custom hook or setTimeout pattern. Enforce 3-character minimum before searching.
- [ ] 3.3. Use AbortController to cancel in-flight requests when new input arrives
- [ ] 3.4. Display search results as cards with cover thumbnail (or placeholder), title, first author, and publish year
- [ ] 3.5. Add loading spinner state while API request is in flight
- [ ] 3.6. Handle errors: show "Search unavailable, please try again" on timeout (8s) or API failure
- [ ] 3.7. Handle empty results: show "No books found" message

## 4. Book Selection Flow

- [ ] 4.1. Add click handler on search result cards that calls the `createOrGetBook` Server Action with the selected book's Open Library metadata
- [ ] 4.2. Show a brief loading/selected state on the card while the Server Action runs
- [ ] 4.3. On success, call an `onBookSelected(book: Book)` callback prop with the created/existing book record
- [ ] 4.4. On error, display an error message without crashing

## 5. Integration & Verification

- [ ] 5.1. Create a temporary test page at `/test-search` that renders the BookSearch component with an `onBookSelected` callback that logs the result (for manual verification)
- [ ] 5.2. Verify: search returns results, covers display, debounce works, loading states show
- [ ] 5.3. Verify: selecting a new book creates a record in Supabase with correct fields
- [ ] 5.4. Verify: selecting the same book twice returns the existing record (dedup works)
- [ ] 5.5. Remove the `/test-search` page after verification
