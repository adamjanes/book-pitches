# Open Library Search

ADDED: Support for Open Library API integration and book deduplication.

## Requirements

### Requirement: Open Library Key Column

The `books` table SHALL include an `open_library_key` column (text, unique, nullable) for deduplication.

#### Scenario: Book record with Open Library key

WHEN a book is created from Open Library data
THEN the system SHALL store the Open Library work key in the open_library_key column
AND the system SHALL enforce uniqueness on this column

#### Scenario: Two books cannot share the same Open Library key

WHEN a book with open_library_key "/works/OL45883W" already exists
AND a second book is inserted with the same open_library_key
THEN the system SHALL reject the insertion with a unique constraint violation

### Requirement: Deduplication Check

When creating a book from Open Library data, the system SHALL check for an existing record by `open_library_key` first before inserting.

#### Scenario: Avoiding duplicate book creation

WHEN a user attempts to create a book for Open Library work "/works/OL45883W"
AND a book with open_library_key "/works/OL45883W" already exists
THEN the system SHALL return the existing book record
AND the system SHALL NOT create a new book record

#### Scenario: Creating new book from Open Library

WHEN a user attempts to create a book for Open Library work "/works/OL12345W"
AND no book with open_library_key "/works/OL12345W" exists
THEN the system SHALL create a new book record with that open_library_key

### Requirement: Open Library Work Key Format

Open Library work keys SHALL follow the format `/works/OL<digits>W` and be used as the canonical identifier.

#### Scenario: Storing work key

WHEN a book is created from Open Library work "OL45883W"
THEN the system SHALL store the key as "/works/OL45883W" in the open_library_key column

### Requirement: Book Description Column

The `books` table SHALL include a `description` column (text, nullable) populated from Open Library data.

#### Scenario: Storing book description

WHEN a book is created from Open Library data that includes a description
THEN the system SHALL store the description in the description column

#### Scenario: Book without description

WHEN a book is created from Open Library data that has no description
THEN the system SHALL allow the description column to be NULL

### Requirement: Book Slug Column

The `books` table SHALL include a `slug` column (text, unique, not null) for URL-friendly book identification.

#### Scenario: Generating book slug

WHEN a book titled "The Lean Startup" by "Eric Ries" is created
THEN the system SHALL generate a slug like "the-lean-startup-eric-ries"
AND the system SHALL ensure the slug is unique

#### Scenario: Slug uniqueness enforcement

WHEN two books would generate the same slug
THEN the system SHALL append a suffix to make the second slug unique

### Requirement: Cover URL from Open Library

The `cover_url` column SHALL be populated from the Open Library Covers API.

#### Scenario: Storing cover URL

WHEN a book is created from Open Library data with cover ID "12345678"
THEN the system SHALL construct the cover URL as "https://covers.openlibrary.org/b/id/12345678-L.jpg"
AND the system SHALL store this URL in the cover_url column

#### Scenario: Book without cover

WHEN a book is created from Open Library data that has no cover
THEN the system SHALL allow the cover_url column to be NULL
