# User Profiles

## Purpose

Allow users to view a curated collection of another user's book reviews and ratings. The user profile page displays the reviewer's information, aggregated statistics, and all their reviews/pitches in a chronological feed, with cross-links to book detail pages.

## Requirements

### Requirement: R-USER-01 - Profile Page Route and Access

The system SHALL serve a user profile at the route `/users/[slug]` where `[slug]` is the user's URL-safe identifier.

#### Scenario: Valid user profile accessed
- **WHEN** a user navigates to `/users/adam-janes`
- **THEN** the page loads with HTTP 200
- **AND** the page title is set to `{user.name} | Book Pitches`
- **AND** the page description is `{user.name}'s book pitches and reviews`

#### Scenario: Non-existent user profile
- **WHEN** a user navigates to `/users/nonexistent`
- **THEN** the page returns HTTP 404 (Next.js `notFound()`)
- **AND** the user sees the 404 page

### Requirement: R-USER-02 - User Data Retrieval

The system SHALL fetch user profile data by slug using the `getUserBySlug(slug)` query, which atomically retrieves user metadata and all related reviews with book information.

#### Scenario: Query execution and data structure
- **WHEN** `getUserBySlug('adam-janes')` is called
- **THEN** the query returns an object with `user` (User) and `reviews` (array of Review & Book joined data)
- **AND** reviews are ordered by `created_at DESC` (newest first)
- **AND** each review includes full book data: id, title, author, slug, cover_url, published_year, isbn, created_at

#### Scenario: Query error handling
- **WHEN** the database throws an error
- **THEN** the error propagates to the page component
- **AND** the page crashes with an unhandled error

### Requirement: R-USER-03 - Profile Header Display

The system SHALL display a profile header with the user's avatar (initial circle), name, optional bio, book count, and average rating.

#### Scenario: Full profile information
- **WHEN** a user profile loads with name "Adam Janes", bio "Book curator", and 10 reviews with ratings [8, 9, 7, 8, 8, 9, 7, 8, 6, 8]
- **THEN** the avatar shows "A" in a circular badge with accent background
- **AND** the name displays as "Adam Janes" in 3xl font weight bold
- **AND** the bio displays as "Book curator" in muted text color
- **AND** the stat shows "10 books reviewed"
- **AND** the stat shows "Average rating: 7.8/10"

#### Scenario: Profile without bio
- **WHEN** a user profile loads with no bio
- **THEN** the bio paragraph is not rendered
- **AND** only name and stats display

#### Scenario: User with no reviews
- **WHEN** a user profile loads with 0 reviews
- **THEN** the stat shows "0 books reviewed"
- **AND** the average rating stat is not displayed

### Requirement: R-USER-04 - Avatar Rendering (Initial Circle)

The system SHALL render the user's avatar as a circular badge with the user's name's first character (uppercase), with accent background and text color.

#### Scenario: Avatar initial generation
- **WHEN** a user named "Claire" is displayed
- **THEN** the avatar shows "C" (first character uppercase)
- **AND** the avatar is 80×80 pixels on profile header
- **AND** the avatar is 8×8 pixels on review cards
- **AND** the background uses `bg-accent-light` and text uses `text-accent`

#### Scenario: Avatar in navigation context
- **WHEN** a reviewer's name appears linked in a review card
- **THEN** a smaller 8×8px avatar is shown alongside the reviewer name
- **AND** clicking the avatar OR name links to `/users/{user.slug}`

### Requirement: R-USER-05 - Statistics Computation

The system SHALL compute user statistics (book count and average rating) from the reviews array.

#### Scenario: Book count calculation
- **WHEN** a user has 5 reviews
- **THEN** the book count displays as "5 books reviewed"
- **AND** the singular form "1 book reviewed" is used when exactly 1 review exists

#### Scenario: Average rating calculation
- **WHEN** a user has reviews with ratings [7, 8, 9]
- **THEN** the average rating is computed as (7 + 8 + 9) / 3 = 8.0
- **AND** the average rating displays as "Average rating: 8.0/10" via `formatRating()`
- **AND** the average rating is not displayed if the user has 0 reviews

### Requirement: R-USER-06 - Reviews/Pitches Section

The system SHALL display all user reviews in a chronological (newest first) feed with each review rendered as a ReviewCard.

#### Scenario: Reviews list with items
- **WHEN** a user profile loads with 3 reviews
- **THEN** a "Pitches" section header displays
- **AND** all 3 reviews are rendered as ReviewCard components
- **AND** reviews are separated by divider lines (border-warm-border)
- **AND** the last review has no bottom border

#### Scenario: Empty reviews list
- **WHEN** a user has no reviews
- **THEN** the "Pitches" section still displays
- **AND** a centered message "No pitches yet." displays in muted text
- **AND** no ReviewCard components are rendered

### Requirement: R-USER-07 - Review Card Display (with Book Reference)

The system SHALL render ReviewCard components with the `showBook={true}` prop, which displays the book reference in each review card.

#### Scenario: Review card with book reference
- **WHEN** a ReviewCard is rendered on a user profile with `showBook={true}`
- **THEN** the card displays: reviewer avatar + name, rating, book title + author link, pitch text, date
- **AND** the book reference is clickable and links to `/books/{book.slug}`
- **AND** the book reference displays as "{title} by {author}" in accent color with hover underline

#### Scenario: ReviewCard internal structure
- **WHEN** a ReviewCard renders
- **THEN** the header shows: (avatar + reviewer name link) on left, rating stars on right
- **AND** the reviewer name links to `/users/{user.slug}`
- **AND** pitch text renders as "pitch-text" class
- **AND** if no pitch_text exists, the placeholder "No pitch written yet." displays in italic muted text
- **AND** the date renders as localized format: "Month Day, Year" (e.g., "February 12, 2026")

### Requirement: R-USER-08 - Cross-Linking (Users ↔ Books)

The system SHALL enable navigation between users and books via slugs.

#### Scenario: Reviewer name links to user profile
- **WHEN** a reviewer's name is clicked in a ReviewCard
- **THEN** the link navigates to `/users/{user.slug}`

#### Scenario: Book reference links to book detail
- **WHEN** a book title in a review is clicked
- **THEN** the link navigates to `/books/{book.slug}`

#### Scenario: Slug reliability
- **WHEN** a user or book is rendered
- **THEN** the slug field is guaranteed to be present and URL-safe (lowercase, hyphens, no special chars)

### Requirement: R-USER-09 - Rating Display and Formatting

The system SHALL display ratings consistently using the Rating component and `formatRating()` utility.

#### Scenario: Average rating formatting
- **WHEN** average rating is 7.8
- **THEN** it displays as "7.8/10" via `formatRating(7.8)`
- **AND** fractional ratings are displayed to 1 decimal place

#### Scenario: Individual review rating display
- **WHEN** a review with rating 9 is rendered in ReviewCard
- **THEN** the Rating component displays the rating with size="sm"

### Requirement: R-USER-10 - SEO Metadata

The system SHALL generate SEO metadata for user profile pages.

#### Scenario: Metadata generation for profile
- **WHEN** `/users/adam-janes` is rendered
- **THEN** `generateMetadata()` is called with the slug
- **AND** the title is set to `{user.name} | Book Pitches`
- **AND** the description is set to `{user.name}'s book pitches and reviews`
- **AND** metadata is used by Next.js for head tags and social sharing

#### Scenario: Metadata for non-existent user
- **WHEN** a non-existent user is requested
- **THEN** the metadata falls back to `{ title: 'User Not Found | Book Pitches' }`

### Requirement: R-USER-11 - Dynamic Page Rendering

The system SHALL render user profile pages as dynamic (non-static) to ensure fresh data on each request.

#### Scenario: Force-dynamic configuration
- **WHEN** the user profile page is rendered
- **THEN** the page is marked with `export const dynamic = 'force-dynamic'`
- **AND** Next.js does not cache or pre-render the page
- **AND** each request fetches fresh user and review data from the database

### Requirement: R-USER-12 - Layout and Styling

The system SHALL style the profile header and reviews section with consistent spacing and typography.

#### Scenario: Profile header layout
- **WHEN** the profile header renders
- **THEN** the avatar and content area are displayed side-by-side with gap-6
- **AND** the name is 3xl bold
- **AND** the bio is muted color with max-width-2xl
- **AND** stats are small text in muted color with gap-4 spacing
- **AND** the entire profile section has space-y-12 spacing before the reviews section

#### Scenario: Reviews section layout
- **WHEN** the reviews section renders
- **THEN** the header "Pitches" is 2xl bold
- **AND** reviews are separated by warm-border dividers with py-6 padding

## Known Gaps

### Missing Error Handling
- Database query errors are not caught; they propagate as unhandled 500 errors rather than graceful fallbacks
- No retry logic for transient Supabase failures
- No user-facing error messages or fallback UI

### No User Avatar Upload
- The `avatar_url` field in the database is never populated; avatars are always generated as initial circles
- No profile settings to upload a custom avatar image
- Avatar customization beyond initials is not supported

### No Review Pagination
- All user reviews are loaded in a single query with no pagination or infinite scroll
- Large review lists (100+ items) will load all data at once
- No "load more" button or pagination controls

### No User Creation/Authentication
- V1 is read-only; no user account signup or login
- User data is pre-seeded in the database
- No auth gating on profile pages (all profiles are public)
- No edit capability for a user's own profile or reviews

### No Review Editing
- Reviews cannot be edited or deleted after creation
- Pitch text is immutable once written

### No Pitch Generation
- Pitch text must be manually written; no AI generation workflow
- Empty pitch fallback message is shown but pitches are never auto-generated

### Limited Bio Support
- Bio field is plain text only; no markdown, rich text, or formatting
- No bio length validation or truncation UI

### No Following/Social Features
- Users cannot follow each other
- No user discovery or browse-all-users page
- No "followed users' reviews" feed or social graph

### No User Slug Customization
- Slugs are auto-generated from names (via `slugify()`) with no user customization
- Slug collisions are not handled (first user with a name "wins" the slug)

### Missing TypeScript Null Safety
- Some optional fields (user.bio, review.pitch_text) lack explicit null checks in template rendering
- Implicit null coalescing via conditionals (e.g., `{user.bio && ...}`) works but could be more explicit
