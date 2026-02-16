# Category Browsing

MODIFIED: Replace tags system with flat categories table and junction table for category assignments.

## Requirements

### Requirement: R-CAT-01 (Category listing)

MODIFIED: Categories come from flat `categories` table (not aggregated from tags).

#### Scenario: Loading category list

WHEN the discovery page loads
THEN the system SHALL fetch categories from the categories table
AND the system SHALL order them by display_order
AND the system SHALL display category filter buttons

#### Scenario: Category count

WHEN the system displays category filters
THEN each category SHALL show the count of books in that category
(calculated from book_categories junction table)

### Requirement: R-CAT-02 (Category links)

MODIFIED: Links use category slug from `categories.slug` column.

#### Scenario: Filtering by category

WHEN a user clicks the "Psychology" category button
THEN the system SHALL filter books to show only those with a book_categories record linking to the "Psychology" category

#### Scenario: Category in URL

WHEN a user navigates to `/books?category=psychology`
THEN the system SHALL load books associated with the category with slug "psychology"

### Requirement: R-CAT-03 (Category detail)

MODIFIED: Books in category come from `book_categories` junction table (not `book_tags`).

#### Scenario: Querying books by category

WHEN the system fetches books for category "AI"
THEN the system SHALL join books with book_categories where category_id matches the "AI" category
AND the system SHALL return only books with that association

#### Scenario: Book in multiple categories

WHEN a book is associated with categories "Business" and "Psychology"
THEN the book SHALL appear in results for both category filters

### Requirement: Categories Table Schema

ADDED: The `categories` table has the following columns:
- `id` (uuid, primary key, default gen_random_uuid())
- `name` (text, unique, not null)
- `slug` (text, unique, not null)
- `display_order` (integer, not null)

#### Scenario: Category record structure

WHEN a category "Artificial Intelligence" is created
THEN the system SHALL store:
- name = "Artificial Intelligence"
- slug = "ai"
- display_order = 1 (or next available order)

### Requirement: Book Categories Junction Table Schema

ADDED: The `book_categories` junction table has the following columns:
- `book_id` (uuid, foreign key to books.id, not null)
- `category_id` (uuid, foreign key to categories.id, not null)
- PRIMARY KEY (book_id, category_id)

#### Scenario: Assigning category to book

WHEN a user assigns the "AI" category to a book
THEN the system SHALL insert a record into book_categories with:
- book_id = <book uuid>
- category_id = <AI category uuid>

#### Scenario: Preventing duplicate assignments

WHEN a book is already associated with category "AI"
AND a user attempts to assign "AI" again
THEN the system SHALL reject the insertion with a primary key violation

### Requirement: Predefined Category Seeding

ADDED: The system SHALL seed the following predefined categories:
- AI
- Business
- Spirituality
- Psychology
- Fiction
- History
- Science
- Self-Help
- Philosophy
- Other

#### Scenario: Initial category setup

WHEN the database is initialized
THEN the system SHALL create category records for all 10 predefined categories
AND each SHALL have a unique slug (e.g., "ai", "business", "spirituality")
AND each SHALL have a display_order from 1 to 10

### Requirement: User Category Assignment

ADDED: Users assign 1-3 categories per book when publishing a pitch.

#### Scenario: Assigning one category

WHEN a user publishes a pitch for a book and selects category "Psychology"
THEN the system SHALL create one book_categories record linking the book to "Psychology"

#### Scenario: Assigning multiple categories

WHEN a user publishes a pitch and selects categories "Business", "Psychology", and "Self-Help"
THEN the system SHALL create three book_categories records

#### Scenario: Enforcing maximum categories

WHEN a user attempts to assign 4 categories to a book
THEN the system SHALL reject the assignment with a validation error

### Requirement: R-CAT-05 (CategoryCard with tags)

REMOVED: Tags system removed entirely.

Reason: Tags replaced by simpler flat categories for V1. Tags provided too much flexibility and complexity for the initial use case.

Migration: Use `categories` + `book_categories` instead of `tags` + `book_tags`. Existing tag data can be mapped to the closest predefined category during migration.

### Requirement: R-CAT-06 (TagBadge component)

REMOVED: Tags system removed entirely.

Reason: Tags replaced by simpler flat categories. The TagBadge component is no longer needed in V1.

Migration: Replace TagBadge with CategoryBadge component that displays category name and links to category filter.
