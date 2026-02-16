# Book Browsing

## Purpose
The book browsing capability provides the core reading experience for discovering and viewing books. Users can view featured books on the homepage, browse the complete catalog, search for specific titles or authors, view detailed book information with reviews and tags, and navigate between books via rating-based sorting.

## Requirements

### Requirement: R-BROWSE-01 - Homepage Featured Books Display
The system SHALL display the top 8 highest-rated books on the homepage.

#### Scenario: Homepage Load Without Search Query
- **WHEN** a user visits the homepage without a search query parameter
- **THEN** the system fetches the top 8 books ordered by avg_rating descending (nulls last)
- **AND** displays them in a responsive grid under "Top Rated" heading
- **AND** provides a "View all" link to /books

### Requirement: R-BROWSE-02 - Browse All Books Page
The system SHALL provide a dedicated page to browse the complete book catalog.

#### Scenario: Browse All Books
- **WHEN** a user visits /books without a search query
- **THEN** the system fetches all books from book_with_stats view
- **AND** orders them by avg_rating descending (nulls last)
- **AND** displays them in a responsive grid
- **AND** shows "All Books" as the page heading
- **AND** generates SEO metadata with title "Browse Books | Book Pitches"

### Requirement: R-BROWSE-03 - Book Detail Page Rendering
The system SHALL display comprehensive book information on individual book pages.

#### Scenario: Valid Book Slug
- **WHEN** a user visits /books/[slug] with a valid slug
- **THEN** the system fetches the book record by slug
- **AND** fetches all reviews for that book with joined user data, ordered by created_at descending
- **AND** fetches all tags for that book with joined category data
- **AND** displays book title, author, published year, average rating, pitch count
- **AND** displays all reviews in chronological order (newest first)
- **AND** displays all tags as category-linked badges
- **AND** generates SEO metadata with title "{book.title} by {book.author} | Book Pitches"

#### Scenario: Invalid Book Slug
- **WHEN** a user visits /books/[slug] with a slug that doesn't match any book
- **THEN** the system returns null from getBookBySlug
- **AND** calls Next.js notFound() to render 404 page

### Requirement: R-BROWSE-04 - Book Cover Display with Fallback
The system SHALL display book cover images with graceful fallback for missing covers.

#### Scenario: Book Has Cover URL
- **WHEN** a book has a non-null cover_url value
- **THEN** the system calls getBookCoverUrl() to construct the full URL
- **AND** renders an img tag with the cover image
- **AND** applies hover scale animation (scale-105) on BookCard components

#### Scenario: Book Missing Cover URL
- **WHEN** a book has null cover_url value
- **THEN** the system renders a fallback placeholder with accent-light background
- **AND** displays the first letter of the book title in large text (5xl on cards, 7xl on detail page)
- **AND** displays the author name in smaller text below the initial

### Requirement: R-BROWSE-05 - Rating Display with Color Coding
The system SHALL display book ratings with color-coded visual badges.

#### Scenario: High Rating (≥8.0)
- **WHEN** a book has avg_rating ≥ 8.0
- **THEN** the Rating component applies "rating-high" CSS class (green)
- **AND** displays rating as "X/10" format

#### Scenario: Medium Rating (6.0-7.9)
- **WHEN** a book has avg_rating between 6.0 and 7.9
- **THEN** the Rating component applies "rating-medium" CSS class (yellow)
- **AND** displays rating as "X/10" format

#### Scenario: Low Rating (<6.0)
- **WHEN** a book has avg_rating < 6.0
- **THEN** the Rating component applies "rating-low" CSS class (orange)
- **AND** displays rating as "X/10" format

#### Scenario: No Rating
- **WHEN** a book has null avg_rating
- **THEN** the Rating component applies "rating-none" CSS class
- **AND** displays "N/A" text without "/10" suffix

#### Scenario: Size Variants
- **WHEN** the Rating component is rendered
- **THEN** it supports three size variants: sm (px-2 py-0.5 text-xs), md (px-2.5 py-1 text-sm), lg (px-3 py-1.5 text-base)

### Requirement: R-BROWSE-06 - Search Functionality
The system SHALL provide debounced search with URL parameter synchronization.

#### Scenario: User Types Search Query
- **WHEN** a user types in the SearchBar component
- **THEN** the component sets local state immediately
- **AND** debounces the URL update by 300ms
- **AND** after debounce timeout, pushes new URL with ?q={encoded_query} parameter
- **AND** triggers server-side re-render with searchBooks() query

#### Scenario: User Presses Enter Key
- **WHEN** a user presses Enter while focused on SearchBar
- **THEN** the component clears the debounce timer
- **AND** immediately pushes URL with current query value
- **AND** triggers server-side re-render

#### Scenario: User Clears Search
- **WHEN** a user clicks the clear button (X icon) in SearchBar
- **THEN** the component sets query state to empty string
- **AND** clears the debounce timer
- **AND** pushes URL to basePath (or "/" if no basePath)
- **AND** triggers server-side re-render showing all books

#### Scenario: Search Results Display
- **WHEN** a page receives a ?q={query} URL parameter
- **THEN** the system calls searchBooks(query)
- **AND** uses .ilike pattern matching on both title and author columns
- **AND** orders results by avg_rating descending
- **AND** displays result count as "{N} result(s) for "{query}""

#### Scenario: SearchBar Base Path
- **WHEN** SearchBar is rendered with basePath="/books"
- **THEN** all URL pushes use "/books?q={query}" instead of "/?q={query}"
- **AND** clearing search returns to "/books" instead of "/"

### Requirement: R-BROWSE-07 - Responsive Book Grid Layout
The system SHALL display books in a responsive grid that adapts to screen size.

#### Scenario: Grid Breakpoints
- **WHEN** the BookGrid component renders
- **THEN** it uses 1 column on mobile (default)
- **AND** 2 columns on sm breakpoint
- **AND** 3 columns on md breakpoint
- **AND** 4 columns on lg breakpoint
- **AND** applies 6-unit gap between grid items

#### Scenario: Empty Grid State
- **WHEN** BookGrid receives an empty books array
- **THEN** it displays "No books found." centered message with muted text
- **AND** applies py-12 padding

### Requirement: R-BROWSE-08 - Tag Display on Book Detail
The system SHALL display book tags with category grouping.

#### Scenario: Book Has Tags
- **WHEN** a book detail page renders and getBookBySlug returns tags array
- **THEN** the system displays each tag as a TagBadge component
- **AND** each badge links to the category page (/categories/[slug])
- **AND** tags are displayed in a flex-wrap container with 2-unit gap

#### Scenario: Book Has No Tags
- **WHEN** getBookBySlug returns empty tags array
- **THEN** the tags section is not rendered (conditional rendering)

### Requirement: R-BROWSE-09 - Reviews Display on Book Detail
The system SHALL display all user reviews/pitches for a book.

#### Scenario: Book Has Reviews
- **WHEN** a book has one or more reviews
- **THEN** the system displays "Pitches" heading
- **AND** renders each review as a ReviewCard component
- **AND** separates reviews with divider lines (divide-y divide-warm-border)
- **AND** shows reviews in chronological order (newest first, per created_at DESC)

#### Scenario: Book Has No Reviews
- **WHEN** a book has zero reviews
- **THEN** the system displays "No pitches yet. Be the first to pitch this book!" centered message
- **AND** applies py-8 padding and muted text color

### Requirement: R-BROWSE-10 - SEO Metadata Generation
The system SHALL generate dynamic SEO metadata for all book-related pages.

#### Scenario: Book Detail Page Metadata
- **WHEN** generateMetadata is called for /books/[slug]
- **THEN** the system fetches book by slug
- **AND** if book found, sets title to "{book.title} by {book.author} | Book Pitches"
- **AND** sets description to "Read the elevator pitch for {book.title} by {book.author}"

#### Scenario: Browse Books Page Metadata
- **WHEN** /books page renders
- **THEN** the system sets static title "Browse Books | Book Pitches"
- **AND** sets static description "Browse all curated book reviews and elevator pitches"

### Requirement: R-BROWSE-11 - Sort Order by Rating
The system SHALL consistently sort books by rating in descending order.

#### Scenario: All Book Queries
- **WHEN** any query fetches from book_with_stats view
- **THEN** the system applies .order('avg_rating', { ascending: false, nullsFirst: false })
- **AND** books with highest ratings appear first
- **AND** books with null ratings appear last

### Requirement: R-BROWSE-12 - Server-Side Rendering Enforcement
The system SHALL render all book browsing pages server-side on every request.

#### Scenario: All Book Browsing Routes
- **WHEN** any book browsing route is accessed (/, /books, /books/[slug])
- **THEN** the route exports `export const dynamic = 'force-dynamic'`
- **AND** Next.js renders the page server-side on every request
- **AND** no static generation or ISR is used

## Known Gaps

### Gap: No Error Handling for Query Failures
**Description:** All queries in queries.ts throw errors directly without try-catch wrapping. If Supabase query fails (network, permissions, etc.), the error bubbles to Next.js error boundary with no user-friendly message.

**Impact:** Users see generic error page on database failures. No graceful degradation or retry logic.

**Suggested Resolution:** Add error boundaries to page components with fallback UI. Wrap query calls in try-catch with user-friendly error states. Consider toast notifications for transient failures.

### Gap: No Pagination on Browse All Page
**Description:** /books page fetches ALL books from database with no limit or pagination. The getBooks() query without limit parameter returns entire dataset.

**Impact:** As book count grows (currently seeding 264), page load time and memory usage increase linearly. At scale (1000+ books), this becomes a performance bottleneck.

**Suggested Resolution:** Implement cursor-based pagination or infinite scroll with limit parameter. Add page size config (e.g., 24 books per page).

### Gap: No Loading States or Skeleton Loaders
**Description:** All pages use `<Suspense fallback={null}>` only for SearchBar component. Book data fetching has no loading indicator. SSR means users see blank screen until full page render.

**Impact:** On slow network or large queries, users have no feedback that content is loading. Perceived performance is poor.

**Suggested Resolution:** Add loading.tsx files for route segments. Use skeleton loaders for BookGrid and book detail components. Consider streaming SSR with partial hydration.

### Gap: Force-Dynamic Disables Performance Optimizations
**Description:** All routes use `export const dynamic = 'force-dynamic'`, disabling Next.js static generation and ISR. Every page request hits the database.

**Impact:** Higher server load, slower TTFB, increased database query count. No CDN caching benefits. Inefficient for content that rarely changes (book catalog is mostly static).

**Suggested Resolution:** Use ISR with revalidation time (e.g., 60 seconds) for browse pages. Only force-dynamic for search results and user-specific pages. Add database query caching layer.

### Gap: Potential N+1 Query in Category Loading
**Description:** getCategories() executes 1 query for all categories, then N queries in Promise.all for tags (1 per category) and book counts (1 per category). For 10 categories, this is 21 queries total.

**Impact:** High database round-trip latency on homepage. Not scalable as category count grows.

**Suggested Resolution:** Refactor to use JOIN queries or database views that pre-aggregate tag and book counts. Single query to fetch all data at once.

### Gap: Book Detail Page Three Separate Queries
**Description:** getBookBySlug() executes three separate queries: book by slug, reviews with user join, tags with category join. Sequential execution with no parallelization.

**Impact:** 3x round-trip latency to database. Slower page load on book detail pages.

**Suggested Resolution:** The reviews and tags queries are already parallelizable (they don't depend on each other, only on book.id). Refactor to Promise.all after book fetch to reduce latency by ~33%.

### Gap: No Search Result Highlighting
**Description:** searchBooks() uses .ilike pattern matching but results don't highlight matching text. Users must visually scan to find why a book matched their query.

**Impact:** Poor search UX, especially for partial matches on long titles or author names.

**Suggested Resolution:** Add client-side highlighting component that wraps matching substrings in <mark> tags. Pass query parameter to BookCard component.

### Gap: Search Is Case-Insensitive But Not Fuzzy
**Description:** Search uses .ilike (case-insensitive LIKE) but no fuzzy matching, typo tolerance, or relevance ranking. "Stephen King" won't match "Steven King" typo.

**Impact:** Users must type exact spelling to find books. No "did you mean?" suggestions.

**Suggested Resolution:** Implement PostgreSQL full-text search with tsvector/tsquery for relevance ranking. Add pg_trgm extension for fuzzy matching. Consider Algolia or Meilisearch for advanced search features.
