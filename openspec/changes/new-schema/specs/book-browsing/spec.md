# Book Browsing

MODIFIED: Update book browsing to use pitches instead of reviews, with books sourced from Open Library.

## Requirements

### Requirement: R-BROWSE-03 (Book detail page)

MODIFIED: The book detail page now shows all PITCHES (not reviews), including audio players. The `book_with_stats` view queries the `pitches` table.

#### Scenario: Loading book detail

WHEN a user navigates to `/books/[slug]`
THEN the system SHALL fetch the book record and all associated pitches
AND the system SHALL display audio players for each pitch

#### Scenario: Book with multiple pitches

WHEN a book has 3 pitches from different users
THEN the system SHALL display all 3 pitches with audio players
AND each pitch SHALL show the user name, rating, and date

### Requirement: R-BROWSE-09 (Pitches section)

MODIFIED: Renamed from "Reviews section" to "Pitches section" — shows audio pitch players instead of text reviews.

#### Scenario: Displaying pitches

WHEN a user views a book detail page
THEN the system SHALL display a "Pitches" section
AND each pitch SHALL render as an audio player with metadata

#### Scenario: No pitches yet

WHEN a book has no pitches
THEN the system SHALL display a message "No pitches yet. Be the first!"

### Requirement: R-BROWSE-11 (Sort by rating)

MODIFIED: Aggregates from `pitches.rating` not `reviews.rating`.

#### Scenario: Average rating calculation

WHEN a book has pitches with ratings [8, 9, 7]
THEN the system SHALL calculate avg_rating as 8.0
AND the system SHALL display this on the book card

#### Scenario: Sorting books by rating

WHEN a user sorts the discovery page by rating
THEN the system SHALL order books by their average pitch rating (highest first)

### Requirement: Open Library Data Fields

ADDED: The `books` table gains the following columns populated from Open Library API:
- `open_library_key` (text, unique, nullable)
- `description` (text, nullable)
- `slug` (text, unique, not null)
- `published_year` (integer, nullable)

#### Scenario: Book created from Open Library

WHEN a user creates a pitch for "The Lean Startup"
AND the book is fetched from Open Library work "/works/OL16802744W"
THEN the system SHALL create a book record with:
- open_library_key = "/works/OL16802744W"
- title = "The Lean Startup"
- author = "Eric Ries"
- published_year = 2011
- description = <Open Library description>
- slug = "the-lean-startup-eric-ries"

### Requirement: On-Demand Book Creation

ADDED: Books are created on-demand when a user records a pitch, not bulk-seeded.

#### Scenario: First pitch creates book

WHEN a user searches for "Atomic Habits" via Open Library
AND selects the book to pitch
AND no book record exists for that Open Library key
THEN the system SHALL create a new book record from Open Library data
AND the system SHALL associate the pitch with this new book

#### Scenario: Subsequent pitch reuses book

WHEN a user searches for "Atomic Habits"
AND a book record already exists for that Open Library key
THEN the system SHALL reuse the existing book record
AND the system SHALL associate the new pitch with this existing book

### Requirement: Book Stats View Recalculation

ADDED: The `book_with_stats` view is recalculated to aggregate from the `pitches` table:
- `avg_rating`: average of pitches.rating
- `pitch_count`: count of pitches

#### Scenario: Stats aggregation

WHEN a book has 4 pitches with ratings [7, 8, 9, 8]
THEN the book_with_stats view SHALL show:
- avg_rating = 8.0
- pitch_count = 4

#### Scenario: Book with no pitches

WHEN a book has been created but has no pitches yet
THEN the book_with_stats view SHALL show:
- avg_rating = NULL
- pitch_count = 0
