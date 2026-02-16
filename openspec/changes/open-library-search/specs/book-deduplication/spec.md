## ADDED Requirements

### Requirement: Deduplicate books by Open Library work key
The system SHALL check for an existing book record by `open_library_key` before creating a new one. If a book with the same work key exists, the system SHALL return the existing record without modification.

#### Scenario: Book already exists in database
- **WHEN** user selects a search result for a book that already has a record (matching `open_library_key`)
- **THEN** the system returns the existing book record without creating a duplicate

#### Scenario: Book does not exist in database
- **WHEN** user selects a search result for a book with no matching `open_library_key`
- **THEN** the system creates a new book record

#### Scenario: Race condition on simultaneous creation
- **WHEN** two users select the same book at the same time
- **THEN** the UNIQUE constraint on `open_library_key` prevents duplicates and the second insert fails gracefully, returning the existing record

### Requirement: Use work key not edition key
The system SHALL use the Open Library work key (e.g. `/works/OL45883W`) for deduplication, not the edition key. This groups all editions of a book under one record.

#### Scenario: Different editions of same book
- **WHEN** User A pitches the hardcover and User B pitches the paperback of "Thinking, Fast and Slow"
- **THEN** both pitches reference the same book record (same work key)
