# Data Seeding

## Purpose

The data-seeding capability reads 264 curated book records from Adam's Obsidian brain vault (`/Users/adamjanes/code/brain/reading/books/`), extracts metadata and descriptions from YAML frontmatter, normalizes tags into predefined categories, and seeds a Supabase PostgreSQL database with users, books, reviews, tags, and book-tag associations. This is an idempotent, re-runnable operation that clears existing data before each seed cycle.

## Requirements

### Requirement: R-SEED-01 - Obsidian Vault Reading and Markdown Parsing

The system SHALL read all markdown files from a configured books directory, parse YAML frontmatter and markdown body content, and skip files that are not books.

#### Scenario: Read all markdown files from the books directory
- **WHEN** the seed script starts
- **THEN** it shall read `/Users/adamjanes/code/brain/reading/books/` recursively and filter for `.md` files
- **AND** files shall be sorted alphabetically for consistent processing order
- **AND** non-markdown files shall be silently skipped

#### Scenario: Parse YAML frontmatter with gray-matter
- **WHEN** a markdown file is read
- **THEN** the YAML frontmatter shall be extracted using gray-matter library
- **AND** the markdown body content shall be preserved separately for pitch extraction
- **AND** files without valid frontmatter shall be logged as warnings but not fail the seed

#### Scenario: Filter for book-type files
- **WHEN** frontmatter is parsed
- **THEN** only files with `type: "book"` (exact match) shall be processed
- **AND** files with other type values (e.g., `type: "article"`) shall be silently skipped
- **AND** the count of skipped non-book files shall be reported in summary output

#### Scenario: Require title and author fields
- **WHEN** a book file is parsed
- **THEN** both `title` and `author` fields must be present and non-empty strings
- **AND** if either field is missing or empty, a warning shall be logged: `Skipping {filename}: missing title or author`
- **AND** the file shall be skipped (not added to books list)

---

### Requirement: R-SEED-02 - YAML Frontmatter Field Extraction

The system SHALL extract all frontmatter fields with appropriate type coercion and null-safety checks.

#### Scenario: Extract title and author
- **WHEN** a book file is parsed
- **THEN** `title` and `author` shall be extracted as strings
- **AND** whitespace shall be trimmed but case shall be preserved
- **AND** these are required fields (filtered earlier in R-SEED-01)

#### Scenario: Extract and validate rating
- **WHEN** frontmatter is parsed
- **THEN** the `rating` field shall be coerced to a number
- **AND** null/undefined/empty string values shall result in `rating: null`
- **AND** numeric values shall be validated: >= 0 and <= 10
- **AND** invalid numbers (e.g., 11, NaN) shall be treated as null and not fail the seed
- **AND** typical values shall range from 4 to 10, with most books rated 7-8

#### Scenario: Extract ISBN and publisher
- **WHEN** frontmatter is parsed
- **THEN** the `isbn` field (if present) shall be stored as a string
- **AND** the `publisher` field (if present) shall be stored as a string
- **AND** both fields are optional; missing fields shall result in null values
- **AND** approximately 22% of books (58 of 264) have ISBN data
- **AND** these fields may be sparse across the dataset

#### Scenario: Extract published year
- **WHEN** frontmatter is parsed
- **THEN** the `published` field shall be coerced to an integer (if numeric)
- **AND** non-numeric or missing values shall result in `published_year: null`
- **AND** the extracted year shall be stored in the database for filtering/sorting

#### Scenario: Extract and parse cover URL
- **WHEN** frontmatter is parsed and has a `cover` field
- **THEN** the path shall be normalized to extract the filename only
- **AND** the normalized cover URL shall be formatted as `covers/{filename}`
- **AND** original paths like `covers/book-title.jpg` or relative paths shall all resolve to `covers/{basename}`
- **AND** null/missing cover field shall result in `cover_url: null`
- **AND** approximately 90.5% of books (239 of 264) have cover data

---

### Requirement: R-SEED-03 - Tag Normalization and Deduplication

The system SHALL normalize tags from frontmatter and deduplicate book slugs to ensure data integrity.

#### Scenario: Normalize tag format
- **WHEN** the `tags` array from frontmatter is processed
- **THEN** all tags shall be converted to lowercase
- **AND** whitespace shall be trimmed from each tag
- **AND** wiki-link style tags (starting with `[[`) shall be filtered out and discarded
- **AND** empty tags shall be filtered out
- **AND** the result shall be an array of normalized, non-empty tag strings
- **AND** 61 unique tags shall be found across the 264 books

#### Scenario: Collect all unique tags across dataset
- **WHEN** all books are parsed
- **THEN** a set of unique tags shall be maintained
- **AND** the set shall include all tags from all book records
- **AND** this set is later used to create tag records in the database
- **AND** approximately 61-64 unique tags are expected (from data inventory)

#### Scenario: Deduplicate book slugs
- **WHEN** all books have been parsed with generated slugs
- **THEN** slugs shall be deduplicated by appending a numeric suffix to duplicates
- **AND** the first occurrence keeps the original slug
- **AND** the second occurrence becomes `{slug}-2`
- **AND** the third becomes `{slug}-3`, and so on
- **AND** the deduplication shall be applied globally across all books to ensure slug uniqueness

---

### Requirement: R-SEED-04 - Slug Generation

The system SHALL generate URL-friendly slugs from book titles deterministically.

#### Scenario: Generate slugs from titles
- **WHEN** a book title is parsed
- **THEN** the slug shall be derived by:
  - Converting to lowercase
  - Replacing all non-alphanumeric characters with hyphens
  - Collapsing consecutive hyphens to a single hyphen
  - Removing leading/trailing hyphens
- **AND** examples: "21 Lessons for the 21st Century" → "21-lessons-for-the-21st-century"
- **AND** the slug shall be used as a primary key for deduplication and book lookups during seeding

---

### Requirement: R-SEED-05 - Pitch Text Extraction from Markdown Body

The system SHALL extract elevator pitch text from the markdown body using a multi-strategy approach.

#### Scenario: Extract pitch from Description section blockquote
- **WHEN** the markdown body contains a `## Description` or `## Overview` section
- **THEN** the system shall look for blockquote lines (starting with `>`) within that section
- **AND** consecutive blockquote lines shall be joined with spaces
- **AND** markdown formatting artifacts (asterisks) shall be cleaned up
- **AND** the first contiguous blockquote block shall be returned as pitch_text
- **AND** this is the primary strategy and covers ~61% of books

#### Scenario: Fall back to first paragraph in Description section
- **WHEN** a Description section exists but contains no blockquotes
- **THEN** the system shall extract the first non-empty paragraph from that section
- **AND** an empty line marks the end of the paragraph
- **AND** heading lines and image references shall be skipped
- **AND** the paragraph text shall be returned as pitch_text

#### Scenario: Search for blockquote anywhere in body if no section found
- **WHEN** no Description or Overview section is found
- **THEN** the system shall scan the entire markdown body for blockquote lines
- **AND** the first contiguous blockquote block shall be extracted
- **AND** blockquotes starting with `Full text available` or `[[` (wiki-links) shall be rejected
- **AND** this fallback strategy handles books with non-standard content structure

#### Scenario: Return null if no pitch text is found
- **WHEN** none of the extraction strategies yield text
- **THEN** `pitch_text` shall be set to `null`
- **AND** this is expected for ~100% of books initially (current data has zero pitches)
- **AND** affected books can be manually reviewed or pitch-generated via LLM in a future phase

---

### Requirement: R-SEED-06 - Database Clearing (Idempotent)

The system SHALL clear all existing data from the database in dependency order before seeding, enabling safe re-runs.

#### Scenario: Clear database in reverse foreign-key order
- **WHEN** the clearDatabase function is called
- **THEN** tables shall be cleared in this order: `book_tags`, `reviews`, `tags`, `categories`, `books`, `users`
- **AND** this order respects foreign key constraints (children before parents)
- **AND** clearing shall be idempotent (re-running produces the same result)

#### Scenario: Use robust deletion strategy
- **WHEN** clearing a table with a `created_at` column
- **THEN** a delete WHERE `created_at >= '1970-01-01'` (all records) shall be used
- **AND** if this fails (e.g., table lacks `created_at`), a fallback strategy shall apply:
  - For `book_tags` (no `created_at`): delete WHERE `book_id IS NOT NULL`
  - For other tables: attempt the default strategy and warn if it fails
- **AND** warnings shall be logged but shall not stop the seed process

---

### Requirement: R-SEED-07 - Category Mapping and Insertion

The system SHALL create a hardcoded set of 10 categories and map all tags to exactly one category each.

#### Scenario: Insert predefined categories
- **WHEN** the seed starts (after clearing database)
- **THEN** these 10 categories shall be inserted (in order):
  1. Business & Entrepreneurship
  2. Psychology & Self-Help
  3. Spirituality & Meditation
  4. Buddhism
  5. Tibetan Studies
  6. Science & Technology
  7. Philosophy
  8. Productivity & Creativity
  9. History & Politics
  10. Fiction & Memoir
  11. Sociology
  12. Other
- **AND** each category shall have a `slug` derived from its name
- **AND** categories shall have a `display_order` field for UI rendering
- **AND** the "Other" category shall be the catchall for unmapped tags
- **AND** a `category_id -> category_name` map shall be built for later tag insertion

#### Scenario: Map tags to categories
- **WHEN** tags are being inserted
- **THEN** each tag shall be assigned to exactly one category using the TAG_CATEGORIES mapping
- **AND** the mapping is hardcoded in the seed script with 80+ tags pre-mapped to 10 categories
- **AND** tags not in the mapping (unmapped outliers) shall default to the "Other" category
- **AND** all 61 unique tags found in the dataset shall be covered by this mapping

---

### Requirement: R-SEED-08 - Tag Insertion with Batch Strategy

The system SHALL insert all tags with category associations in batches to handle large datasets efficiently.

#### Scenario: Build tag rows with category assignment
- **WHEN** tags are being prepared for insertion
- **THEN** each tag row shall include: `name`, `slug`, and `category_id`
- **AND** the slug shall be generated from the tag name
- **AND** the category_id shall be looked up from the TAG_CATEGORIES mapping
- **AND** 61 unique tags shall be processed

#### Scenario: Batch insert tags
- **WHEN** tag rows are ready
- **THEN** rows shall be inserted in batches of 500 (Supabase limit is 1000, using conservative batch size)
- **AND** each batch shall be a single `.insert()` call
- **AND** the insert shall include `.select("id, name")` to retrieve generated IDs
- **AND** a `tag_name -> tag_id` map shall be built from the returned data
- **AND** if any batch fails, an error shall be raised with the batch error message
- **AND** progress shall be logged for each batch (total tags inserted)

---

### Requirement: R-SEED-09 - User Creation (Hardcoded)

The system SHALL create a single hardcoded user record for Adam Janes.

#### Scenario: Insert single user
- **WHEN** the user insertion step runs
- **THEN** exactly one user record shall be created with:
  - `name`: "Adam Janes"
  - `slug`: "adam-janes"
  - `bio`: "Voracious reader. Building a personal library of elevator pitches for every book worth reading."
- **AND** the `id` shall be returned and stored for use in review creation
- **AND** this is a temporary hardcoded user; multi-user support (auth) is deferred to V2+

---

### Requirement: R-SEED-10 - Book Record Creation with Slug Mapping

The system SHALL insert all parsed book records with batch processing and build a slug->id map for later associations.

#### Scenario: Prepare book rows for insertion
- **WHEN** all books have been parsed and slugs deduplicated
- **THEN** book rows shall include: `title`, `author`, `isbn`, `cover_url`, `published_year`, `slug`
- **AND** each row maps to a single book record (canonical, one per book)

#### Scenario: Batch insert books
- **WHEN** book rows are ready
- **THEN** books shall be inserted in batches of 500 rows per request
- **AND** each batch shall call `.insert()` with `.select("id, slug")`
- **AND** the returned `id` and `slug` shall be stored in a `slug -> book_id` map
- **AND** if any batch fails, an error shall be raised
- **AND** progress shall be logged: "Inserted batch N (M books)"
- **AND** total count shall be logged at completion: "Total: X books inserted"
- **AND** approximately 264 books are expected to be inserted

---

### Requirement: R-SEED-11 - Review Record Creation

The system SHALL create review records only for books with ratings, linking each book to the seeded user.

#### Scenario: Filter books with ratings
- **WHEN** reviews are being created
- **THEN** only books where `rating !== null` shall have a review record
- **AND** books without ratings shall be skipped (unrated books have no review record initially)
- **AND** approximately 243 of 264 books (91.7%) have ratings
- **AND** approximately 21 books (8.3%) are unrated and will have no review

#### Scenario: Create review rows
- **WHEN** rated books are being processed
- **THEN** each review row shall include: `user_id`, `book_id`, `rating`, `pitch_text`
- **AND** `user_id` shall be the Adam Janes user ID from R-SEED-09
- **AND** `book_id` shall be looked up from the slug->id map
- **AND** `rating` shall be the numeric rating (4-10)
- **AND** `pitch_text` shall be the extracted or null value from R-SEED-05

#### Scenario: Batch insert reviews
- **WHEN** review rows are prepared
- **THEN** reviews shall be inserted in batches of 500
- **AND** each batch is a single `.insert()` call
- **AND** if any batch fails, an error shall be raised
- **AND** the count of reviews created shall be reported (same as rated book count)

---

### Requirement: R-SEED-12 - Book-Tag Association Creation

The system SHALL create junction records linking each book to all its tags.

#### Scenario: Build book-tag rows
- **WHEN** book-tag associations are being prepared
- **THEN** for each book and each of its tags:
  - Look up the book_id from the slug->id map
  - Look up the tag_id from the tag_name->id map
  - Create a row: `{ book_id, tag_id }`
- **AND** if a book or tag lookup fails, that association shall be skipped (logged as warning)
- **AND** multiple associations per book are expected (books have multiple tags)

#### Scenario: Batch insert book-tag associations
- **WHEN** association rows are prepared
- **THEN** rows shall be inserted in batches of 500
- **AND** each batch is a single `.insert()` call
- **AND** if any batch fails, an error shall be raised
- **AND** the total count of associations created shall be reported

---

### Requirement: R-SEED-13 - Environment Configuration and Service Role Key

The system SHALL require Supabase credentials and load them from `.env.local` or environment variables.

#### Scenario: Load .env.local file
- **WHEN** the seed script starts
- **THEN** it shall attempt to read `.env.local` from the project root (relative to script directory)
- **AND** if the file exists, all KEY=VALUE pairs (excluding comments and empty lines) shall be parsed
- **AND** parsed values shall be set as environment variables (if not already set)
- **AND** if `.env.local` does not exist, no error shall be raised (env vars may already be set)

#### Scenario: Require Supabase URL and service role key
- **WHEN** the seed script starts
- **THEN** both `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` must be available
- **AND** if either is missing, an error shall be logged and the process shall exit with code 1
- **AND** the service role key allows bypassing RLS policies for safe seeding

#### Scenario: Create Supabase client
- **WHEN** credentials are loaded
- **THEN** a Supabase client shall be created with:
  - URL from `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
  - Service role key for authentication
  - `auth: { persistSession: false }` configuration
- **AND** this client is used for all database operations

---

### Requirement: R-SEED-14 - Summary and Progress Reporting

The system SHALL log progress and summary statistics throughout the seed process.

#### Scenario: Report parsing results
- **WHEN** file parsing is complete
- **THEN** the script shall log:
  - `Parsed {count} books (skipped {count} non-book files)`
  - `Found {count} unique tags`

#### Scenario: Report each step completion
- **WHEN** each database operation completes
- **THEN** relevant stats shall be logged:
  - Categories inserted: count and list
  - Tags inserted: count
  - Books inserted: batch progress + total
  - User created: name and ID
  - Reviews inserted: count (vs. unrated books skipped)
  - Book-tag associations: total count

#### Scenario: Report final summary
- **WHEN** all seeding is complete
- **THEN** a final summary box shall be printed with:
  - `Books: {total count}`
  - `Reviews: {count of books with ratings}`
  - `With pitch: {count of books with non-null pitch_text}`
  - `Tags: {count of unique tags}`
  - `Categories: {count of categories}`

---

## Known Gaps

### Hardcoded Paths and Values

- **Books directory path:** Hardcoded to `/Users/adamjanes/code/brain/reading/books` (R-SEED-01). Cannot be overridden via command-line arguments or environment variables. This ties the seed to Adam's local machine setup and will fail on other machines.
- **Hardcoded user:** "Adam Janes" is created with a fixed name, slug, and bio (R-SEED-09). Multi-user support is deferred to V2; this is intentional for V1 scope but limits reusability.
- **TAG_CATEGORIES mapping:** Hardcoded in the seed script (80+ tags mapped to 10 categories). If new tags appear in future book additions, the mapping must be manually updated in the source code.

### Cover URLs Not Web-Accessible

- Cover URLs are normalized to `covers/{filename}` (R-SEED-04) but the actual image files exist at relative paths in the Obsidian vault (`/Users/adamjanes/code/brain/reading/books/covers/`). These are **not accessible via HTTP** and will fail when rendered on the live website unless:
  - Images are copied to the app's `public/covers/` directory and served as static assets, OR
  - A CDN or image storage service (e.g., Supabase Storage) is configured
  - Current seed stores local relative paths; no deployment pipeline for image assets exists yet.

### Zero Elevator Pitches

- The `pitch_text` field is extracted from descriptions or blockquotes in the markdown body (R-SEED-05). Currently **0 of 264 books have actual elevator pitches** (the DATA_INVENTORY.md confirms this). Only ~61% of books have a Description section; even those are publisher summaries, not 90-second elevator pitches.
- **Gap:** Books with extracted descriptions work (161 books). Books without descriptions (102 books) will have `pitch_text: null` and will appear incomplete on the website.
- **Recommendation:** Generate pitches via LLM (Claude API or similar) in a future step before launching V1, targeting ~90-120 word summaries.

### Weak Error Handling in clearDatabase

- The `clearDatabase` function attempts to delete by `created_at >= '1970-01-01'` but falls back to error-message matching (checking if error includes "created_at") to detect missing columns.
- **Gap:** Error handling is fragile and relies on string matching. If Supabase changes error message format, the fallback may not trigger correctly.
- **Gap:** No retry logic; if a delete fails, the warning is logged but the seed continues. This could leave orphaned data or cause foreign key conflicts in subsequent inserts.

### No Data Validation Beyond Basic Type Checking

- Ratings are validated for range (0-10) but no other constraints are checked (e.g., author name non-empty, title uniqueness beyond slug deduplication).
- ISBN format is not validated (any string is accepted).
- Cover file existence is not verified; the database will accept any cover path regardless of whether the file actually exists.
- **Gap:** Invalid data can be inserted silently; validation happens only at the database layer (if constraints are defined).

### No Retry Logic for Failed Inserts

- If a batch insert fails (network error, database constraint violation, timeout), the error is raised immediately and the seed stops.
- **Gap:** Partial data may be committed; re-running the seed clears old data but re-processing from a failed batch is manual.
- **Recommendation:** Add retry logic (exponential backoff) for transient failures or implement idempotent batch processing.

### No Test Coverage

- The seed script has no unit tests for parsing, slug generation, pitch extraction, or batch logic.
- **Gap:** Changes to tag mapping, frontmatter parsing, or extraction logic are not validated before running in production.
- **Recommendation:** Add test suite covering edge cases (missing fields, malformed frontmatter, slug deduplication, pitch extraction strategies).

### Missing Logging/Audit Trail

- Progress is logged to console but not to a file or persistent log.
- **Gap:** If seeding fails mid-process, there's no audit trail of which books were inserted before the failure.
- **Recommendation:** Add file-based logging with timestamps and status per batch for debugging and recovery.

### Unrated Books Handling

- 21 books (8.3%) have no rating. These are read from the vault but no review record is created (R-SEED-11).
- **Gap:** Unrated books appear in the `books` table but have no entry in `reviews`. The website must handle books without reviews gracefully.
- **Recommendation:** Decide if unrated books should be visible at all in V1 or if missing ratings should be auto-filled with a default (e.g., 5/10 "Not yet rated").

### Batch Size Hard-Coded

- Batch size is set to 500 rows (R-SEED-08, R-SEED-10, R-SEED-11, R-SEED-12). Supabase allows up to 1000, but 500 is conservative.
- **Gap:** If the script times out on slower connections, batch size cannot be adjusted without code changes.
- **Recommendation:** Add command-line flag or environment variable to customize batch size.

### No Support for Incremental Seeding

- Each run clears the entire database (R-SEED-06). There's no mode to add/update individual books or tags without full reset.
- **Gap:** Adding a new book to the Obsidian vault requires re-running the full seed, which recreates all records (though the final state is identical).
- **Recommendation:** Add `--mode incremental` flag to only insert new/modified books in future releases.

### Cover Image Path Mismatch

- The parseCoverUrl function extracts the filename and formats it as `covers/{filename}`, but the actual images in the Obsidian vault are at `/Users/adamjanes/code/brain/reading/books/covers/`.
- **Gap:** The cover_url stored in the database is a relative path (e.g., `covers/book-title.jpg`). On the live website, these URLs will be interpreted relative to the domain root and will fail unless:
  - Images are served from a static directory at `/public/covers/`, OR
  - The URL is rewritten to a CDN or Supabase Storage URL during seeding
  - Current implementation stores the path as-is; deployment step to copy/serve images is missing.

