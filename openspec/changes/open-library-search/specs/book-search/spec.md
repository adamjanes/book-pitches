## ADDED Requirements

### Requirement: Search Open Library by query
The system SHALL provide a search interface that queries the Open Library API at `https://openlibrary.org/search.json` with the user's input. The search SHALL request fields: `key`, `title`, `author_name`, `first_publish_year`, `cover_i`, `number_of_pages_median`. Results SHALL be limited to 10 per query.

#### Scenario: User searches for a book by title
- **WHEN** user types "Thinking Fast and Slow" into the search input
- **THEN** the system queries Open Library and displays matching results with title, author, publish year, and cover thumbnail

#### Scenario: User searches for a book by author
- **WHEN** user types "Daniel Kahneman" into the search input
- **THEN** the system queries Open Library and displays books by that author

#### Scenario: No results found
- **WHEN** user searches for a query with no matching books
- **THEN** the system displays a "No books found" message

#### Scenario: Minimum query length
- **WHEN** user has typed fewer than 3 characters
- **THEN** the system SHALL NOT fire an API request

### Requirement: Display search results with cover images
The system SHALL display each search result as a card showing the book cover, title, first author name, and first publish year. Cover images SHALL be constructed from the Open Library covers API: `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`.

#### Scenario: Book with cover image
- **WHEN** a search result has a `cover_i` value
- **THEN** the system displays the cover image at medium size (-M, ~180px)

#### Scenario: Book without cover image
- **WHEN** a search result has no `cover_i` value
- **THEN** the system displays a placeholder book cover image

### Requirement: Handle Open Library API errors
The system SHALL handle API failures gracefully with user-visible feedback. Requests SHALL timeout after 8 seconds.

#### Scenario: API timeout
- **WHEN** the Open Library API does not respond within 8 seconds
- **THEN** the system displays "Search unavailable, please try again" and allows retry

#### Scenario: API error response
- **WHEN** the Open Library API returns a non-200 status
- **THEN** the system displays an error message and does not crash

#### Scenario: Network failure
- **WHEN** the user has no network connection
- **THEN** the system displays an appropriate error message
