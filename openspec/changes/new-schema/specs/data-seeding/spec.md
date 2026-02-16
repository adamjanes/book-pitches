# Data Seeding

REMOVED: Entire Obsidian vault seeding pipeline removed. Books are now created on-demand from Open Library API.

## Requirements

### Requirement: R-SEED-01 (Seed script entry point)

REMOVED: Seed script entry point is no longer needed.

Reason: Books are now created on-demand when users record pitches, sourced from the Open Library API. The Obsidian vault seeding pipeline is not needed for the voice-first multi-user approach.

Migration: Remove `scripts/seed.ts` and all related seed pipeline code. Books will be populated organically as users search Open Library and record pitches.

### Requirement: R-SEED-02 (Read book notes directory)

REMOVED: Reading Obsidian vault book notes is no longer needed.

Reason: Books are created from Open Library API data on-demand, not from Adam's Obsidian vault.

Migration: N/A — this was a one-time seeding operation that is no longer part of the system.

### Requirement: R-SEED-03 (Parse YAML frontmatter)

REMOVED: YAML frontmatter parsing is no longer needed.

Reason: Book metadata now comes from Open Library API, not Obsidian note frontmatter.

Migration: N/A — book data structure changes to match Open Library schema.

### Requirement: R-SEED-04 (Parse book content)

REMOVED: Parsing Obsidian note content is no longer needed.

Reason: Pitches are recorded as audio, not extracted from markdown text.

Migration: N/A — text pitches replaced by audio recordings.

### Requirement: R-SEED-05 (Generate slugs)

REMOVED: Slug generation from Obsidian note filenames is no longer needed.

Reason: Slugs are now generated from Open Library book titles and authors.

Migration: Slug generation logic moves to the book creation flow when pitching a book.

### Requirement: R-SEED-06 (Insert books)

REMOVED: Bulk book insertion is no longer needed.

Reason: Books are created one at a time when users record pitches.

Migration: Replace bulk insert with on-demand book creation in the pitch recording flow.

### Requirement: R-SEED-07 (Insert reviews)

REMOVED: Review insertion from Obsidian notes is no longer needed.

Reason: Reviews replaced by audio pitches recorded via browser MediaRecorder API.

Migration: N/A — pitches are created through the web UI, not seeded from files.

### Requirement: R-SEED-08 (Handle tags)

REMOVED: Tag handling from Obsidian frontmatter is no longer needed.

Reason: Tags replaced by flat categories selected via UI when publishing a pitch.

Migration: Categories are seeded via migration SQL (10 predefined categories), then assigned by users through the pitch creation flow.

### Requirement: R-SEED-09 (Upsert operations)

REMOVED: Upsert logic for re-running seed script is no longer needed.

Reason: No seed script in the new architecture.

Migration: N/A — books and pitches are created through normal application flow with database constraints.

### Requirement: R-SEED-10 (Transaction handling)

REMOVED: Seed transaction handling is no longer needed.

Reason: No bulk seeding operations.

Migration: N/A — individual book and pitch creations use normal database transactions.

### Requirement: R-SEED-11 (Validation)

REMOVED: Seed validation logic is no longer needed.

Reason: Validation moves to API route handlers and database constraints.

Migration: Add validation to pitch creation API routes (e.g., rating 0-10, max audio duration 180s).

### Requirement: R-SEED-12 (Error handling)

REMOVED: Seed error handling is no longer needed.

Reason: No seed script.

Migration: API routes handle errors with proper HTTP status codes.

### Requirement: R-SEED-13 (npm script)

REMOVED: `npm run seed` script is no longer needed.

Reason: No seeding operation.

Migration: Remove from package.json. Categories are seeded via one-time migration SQL.

### Requirement: R-SEED-14 (Development workflow)

REMOVED: Seed script in development workflow is no longer needed.

Reason: Development databases are populated by manually recording pitches through the UI.

Migration: For local development, developers can record a few test pitches or run a minimal SQL insert for test data. Categories are seeded automatically via migration.

## Notes

The removal of the entire seeding pipeline simplifies the codebase significantly:
- No file I/O or Obsidian vault dependencies
- No markdown parsing or YAML frontmatter handling
- Books populated naturally through user interaction
- Categories seeded once via migration (10 predefined categories)
- Test data created through UI or minimal SQL fixtures
