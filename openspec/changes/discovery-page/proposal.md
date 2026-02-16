# Discovery Page

## Why
The discovery page is the primary entry point for non-authenticated visitors—a public browsing experience that showcases the best pitched books across all users. It drives engagement by making great book recommendations immediately discoverable without requiring sign-up.

## What Changes
- Add `/discover` route with public-facing book discovery interface
- Implement filterable catalog by category (AI, Business, Spirituality, Psychology, etc.)
- Add multi-sort options: highest rated, most recent, most pitches
- Create book card component displaying: cover image, title, author, average rating, pitch count
- Implement full-text search by title or author
- Add pagination or infinite scroll for large collections
- Style with parchment/beige aesthetic matching brand identity
- Ensure fully responsive grid layout for mobile and desktop
- Implement category selection with visual filtering UI

## Capabilities

### New Capabilities
- `discover-books`: Fetch all books with at least one pitch, with sorting and filtering
- `filter-by-category`: Apply category filter to book list, returning only books tagged with selected category
- `sort-books`: Sort collection by rating (descending), creation date (descending), or pitch count (descending)
- `search-books`: Full-text search by title or author, with ranking
- `paginate-results`: Paginate or infinite-scroll load book discovery results
- `book-card-display`: Render book card with cover, metadata, and rating summary
- `responsive-grid`: Grid layout that adapts to viewport (mobile: 1-2 cols, tablet: 2-3 cols, desktop: 3-4 cols)

### Modified Capabilities
(none)

## Impact
- **Database queries**: New filtered/sorted queries on `books` and `reviews` tables with aggregation (avg rating, count pitches)
- **UI components**: Book card, category filter pills, sort dropdown, search input, pagination controls
- **Routes**: Add `/discover` page and API endpoint `/api/books/discover` (GET with query params: category, sort, search, page)
- **Styling**: Integrate parchment/beige color scheme into tailwind config if not already present
- **Performance**: Index `reviews.book_id` and `book_tags.tag_id` for fast filtering; consider materialized view for aggregated stats
- **SEO**: Ensure discoverable pages are server-rendered or prerendered for search indexing
