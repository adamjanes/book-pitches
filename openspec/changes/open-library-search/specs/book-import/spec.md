## ADDED Requirements

### Requirement: Import book from Open Library to Supabase
The system SHALL create a book record in the Supabase `books` table when a user selects a search result. The record SHALL be populated with: title, author (first author from `author_name` array), `open_library_key` (work key, e.g. `/works/OL45883W`), `cover_url` (constructed from `cover_i`), `published_year` (from `first_publish_year`), and `description`. A slug SHALL be generated from the title.

#### Scenario: User selects a new book
- **WHEN** user selects a search result for a book not yet in the database
- **THEN** the system creates a new book record with metadata from Open Library and returns it

#### Scenario: Book creation populates all fields
- **WHEN** a new book record is created from Open Library data
- **THEN** the record includes title, author, open_library_key, cover_url (medium size), published_year, slug, and description (if available)

### Requirement: Fetch book description from work detail endpoint
The system SHALL fetch the book description from `https://openlibrary.org/works/{key}.json` when creating a new book record. The description field may be a string or an object with a `value` property.

#### Scenario: Description available as string
- **WHEN** the work detail endpoint returns a string `description`
- **THEN** the system stores it in the book record's `description` field

#### Scenario: Description available as object
- **WHEN** the work detail endpoint returns `description.value`
- **THEN** the system extracts and stores the `value` string

#### Scenario: Description unavailable
- **WHEN** the work detail endpoint has no description or the fetch fails
- **THEN** the system creates the book record with NULL description

### Requirement: Book import uses Server Action
The system SHALL perform book creation via a Next.js Server Action, not a client-side Supabase insert. This keeps database logic server-side.

#### Scenario: Server Action creates book
- **WHEN** user selects a search result
- **THEN** a Server Action receives the Open Library metadata and performs the database operation
