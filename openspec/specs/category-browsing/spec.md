# Category Browsing

## Purpose

Users can discover and browse books organized by category. The system displays all categories on a listing page and allows users to view all books within a specific category, sorted by rating. Categories group related tags together (e.g., Business, Psychology, Spirituality) to help users find books relevant to their interests.

## Requirements

### Requirement: R-CAT-01 - Display All Categories

The system SHALL fetch and display all categories in a responsive grid layout at `/categories`.

#### Scenario: Load categories listing page
- **WHEN** a user navigates to `/categories`
- **THEN** the server fetches all categories from the database ordered by `display_order`
- **AND** displays a grid of category cards (1 column on mobile, 2 on tablet, 3 on desktop, 4 on large screens)
- **AND** each card shows the category name and book count
- **THEN** if no categories exist, display a centered "No categories yet" message

#### Data flow
- Calls `getCategories()` query from server component
- Query executes 3 operations per category: fetch category, fetch tags in category, count books via `book_tags` join
- Returns array of categories with computed `book_count` and associated `tags`

#### Acceptance criteria
- Categories rendered in grid layout with proper spacing
- "No categories yet" message displays when categories array is empty
- Page title is "Categories | Book Pitches"
- Page description is "Browse book categories"

---

### Requirement: R-CAT-02 - Navigate to Category Detail

The system SHALL allow users to click a category card to view all books in that category.

#### Scenario: Click category card
- **WHEN** user clicks a category card on `/categories`
- **THEN** browser navigates to `/categories/[slug]` where `[slug]` is the category's slug
- **AND** the category detail page loads and displays the category name with book count

#### Link structure
- `CategoryCard` component wraps the card div in a `Link` with `href="/categories/{category.slug}"`
- Link is semantic HTML navigation, not a button or custom onclick handler

#### Acceptance criteria
- Each category card is clickable
- Navigation to correct URL with category slug
- 404/notFound page displayed if category slug does not exist

---

### Requirement: R-CAT-03 - Display Category Detail with Sorted Books

The system SHALL display a category detail page showing the category name, book count, and all books sorted by average rating (highest first).

#### Scenario: Load category detail page
- **WHEN** user navigates to `/categories/[slug]`
- **THEN** the server fetches the category by slug
- **AND** fetches all tags belonging to that category
- **AND** fetches all books tagged with any of those tags via the `book_tags` junction table
- **THEN** displays category name as page heading
- **AND** displays "{count} book(s)" subtitle
- **AND** renders all books in the BookGrid component
- **AND** books are sorted by `avg_rating` in descending order (highest rated first, nulls last)

#### Data flow
1. Fetch category by `slug` from `categories` table
2. Fetch all tags where `category_id` matches
3. Extract tag IDs and query `book_tags` table for all `book_id` values
4. Deduplicate book IDs (a book may have multiple tags in the same category)
5. Fetch books from `book_with_stats` view filtered by book IDs
6. Sort by `avg_rating` descending

#### Deduplication behavior
- Books with multiple tags in the same category appear once in the grid
- Deduplication uses `Set` to extract unique book IDs before final fetch

#### Acceptance criteria
- Category name and book count displayed at top
- Book count is accurate (deduplicated)
- Books display in BookGrid layout
- Books sorted by rating (highest first)
- Page title is "{Category Name} Books | Book Pitches"
- Page description is "Browse {Category Name} book reviews and elevator pitches"

---

### Requirement: R-CAT-04 - Handle Empty Category

The system SHALL handle categories with no books gracefully.

#### Scenario: View category with zero books
- **WHEN** a category has no associated tags OR no books tagged with those tags
- **THEN** the category detail page displays category name and "0 books" subtitle
- **AND** the BookGrid renders as empty (no books displayed)
- **AND** no error is thrown

#### Implementation detail
- `getCategoryBySlug()` query checks if `tagData.length === 0` and returns early with empty `books` array
- Checks again after `book_tags` join if `bookTagData.length === 0`

#### Acceptance criteria
- Page loads without error
- "0 books" message displays
- Empty BookGrid renders gracefully

---

### Requirement: R-CAT-05 - CategoryCard Component

The system SHALL render category cards with name and book count, styled as interactive cards.

#### Component interface
```typescript
interface CategoryCardProps {
  category: Category & { book_count: number }
}
```

#### Display
- Card wrapper uses `card` class with padding `p-6` and flex layout
- Category name rendered as `<h3>` with class `text-lg font-semibold text-foreground`
- Book count rendered as `<p>` with class `text-sm text-muted`
- Text reads "{count} {book/books}" (grammatically correct singular/plural)

#### Styling
- Inherits default card styles from theme
- Has implicit hover/interactive state via Link wrapper

#### Acceptance criteria
- Category name and count both visible
- Correct singular/plural grammar
- Proper spacing and typography

---

### Requirement: R-CAT-06 - TagBadge Component Links to Category

The system SHALL render tag badges that optionally link to a category page.

#### Component interface
```typescript
interface TagBadgeProps {
  tag: { name: string; slug: string }
  category?: { name: string; slug: string }
}
```

#### Behavior
- **If `category` provided:** Badge is wrapped in `Link` to `/categories/{category.slug}`
- **If `category` not provided:** Badge renders as static `<span>` (no link)

#### Styling
- Badge uses inline-flex with pill-shaped styling (`rounded-full`)
- Colors: `bg-accent-light text-accent` at rest
- On hover: `bg-accent text-white` with `transition-colors`
- Typography: `text-xs font-medium px-2.5 py-1`

#### Acceptance criteria
- Conditional rendering (link vs span)
- Correct hover state
- Semantic link when category provided
- Can be used in book details and category listings

---

### Requirement: R-CAT-07 - SEO Metadata for Category Pages

The system SHALL generate SEO-optimized metadata for both categories listing and category detail pages.

#### Categories listing page
- Title: "Categories | Book Pitches"
- Description: "Browse book categories"
- Static metadata defined in page component

#### Category detail page
- Title: "{Category Name} Books | Book Pitches"
- Description: "Browse {Category Name} book reviews and elevator pitches"
- Generated dynamically via `generateMetadata()` function
- Generates metadata even if category not found (404 case)

#### Implementation
- Uses Next.js `Metadata` type and `generateMetadata()` export
- Calls `getCategoryBySlug()` in metadata generator
- Returns fallback title if category does not exist

#### Acceptance criteria
- Metadata reflects actual category names and purposes
- Titles include "Book Pitches" brand
- Descriptions include category name where applicable
- 404 case handled gracefully in metadata

---

### Requirement: R-CAT-08 - Dynamic Route Rendering

The system SHALL handle dynamic category slug parameters using Next.js App Router patterns.

#### Dynamic route structure
- Route: `/categories/[slug]/page.tsx`
- Params: `Promise<{ slug: string }>`

#### Implementation
- Page component accepts `CategoryPageProps` with `params: Promise<{ slug: string }>`
- Awaits params object before extracting slug (Next.js 15+ pattern)
- Metadata generator also awaits params
- Uses `notFound()` from `next/navigation` if category not found

#### Force dynamic rendering
- Both page and metadata generator set `export const dynamic = 'force-dynamic'`
- Ensures fresh data fetches (no static generation)

#### Acceptance criteria
- Route parameter extracted correctly
- Async params pattern works without race conditions
- notFound() navigation works when slug invalid

---

### Requirement: R-CAT-09 - Book Count Calculation

The system SHALL accurately calculate the number of books in each category, accounting for multi-tagged books.

#### Calculation method
- `getCategories()` query: For each category, gets all tags, then counts distinct `book_id` values in `book_tags` where `tag_id IN (category's tag IDs)`
- `getCategoryBySlug()` query: Gets all tag IDs, then all `book_id` entries in `book_tags`, then deduplicates before final book fetch

#### Deduplication
- `getCategoryBySlug()` explicitly deduplicates: `Array.from(new Set(bookTagData.map(bt => bt.book_id)))`
- Book appearing under multiple tags in same category counts as 1 book

#### Data consistency
- `getCategories()` uses Supabase `count` mode for efficiency
- `getCategoryBySlug()` fetches full `book_with_stats` for each book after deduplication

#### Acceptance criteria
- Book counts are accurate
- Multi-tagged books counted once per category
- Count displayed on both listing and detail pages matches actual books rendered

---

## Known Gaps

### Performance: N+1 Query Pattern in getCategories()
**Issue:** The `getCategories()` query executes 3 database calls per category (fetch category, fetch tags, count books), resulting in O(N) queries for N categories.

**Impact:** With 10+ categories, multiple round-trips to database cause slow page loads.

**Recommendation:** Use a single aggregation query or database view to fetch categories with pre-computed book counts and tag arrays.

### Error Handling
**Issue:** All queries throw errors without try-catch. Page crashes on database errors instead of handling gracefully.

**Impact:** Network errors, permission errors, or database outages cause unhandled exceptions.

**Recommendation:** Wrap queries in try-catch and display user-friendly error messages, or use Supabase error boundaries.

### No Pagination
**Issue:** Category pages load all books at once with no pagination or lazy loading.

**Impact:** Categories with 50+ books may have poor performance and slow initial page renders.

**Recommendation:** Implement cursor-based pagination or infinite scroll for category detail pages.

### No Empty Category Handling in CategoryCard
**Issue:** Categories with 0 books still render and are clickable, navigating to an empty detail page. No visual indication that category is empty.

**Impact:** User confusion when clicking a category that has no books.

**Recommendation:** Optionally hide empty categories from listing, or show visual indicator (e.g., "Coming soon" badge).

### Missing Metadata Fallback
**Issue:** If `generateMetadata()` fails, no fallback metadata is set.

**Impact:** 500 page when metadata generation throws.

**Recommendation:** Wrap metadata generation in try-catch with fallback static metadata.

### No Breadcrumb Navigation
**Issue:** Category detail page has no breadcrumb or back button.

**Impact:** Users may get lost navigating; no clear path back to categories listing.

**Recommendation:** Add breadcrumb or back button for better UX.
