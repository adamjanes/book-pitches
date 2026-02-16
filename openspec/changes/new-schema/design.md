## Context

The app has an existing schema (`001_initial_schema.sql`) designed for a read-only display site: users, books, reviews, categories, tags, book_tags, and a book_with_stats view. This schema was never applied to Supabase — the database is empty.

We're pivoting to a voice-first platform. Rather than migrating data, we're writing a fresh migration that replaces the old schema entirely. No data migration needed since nothing was ever seeded.

## Goals / Non-Goals

**Goals:**
- Define the complete V1 schema for the voice-first platform
- Support audio pitches (one per user per book)
- Books created from Open Library data (not bulk-seeded)
- Flat category system (user-assigned at pitch time)
- RLS policies supporting both public reads and authenticated writes
- Supabase Storage bucket for audio files

**Non-Goals:**
- Migrating old data (database is empty, nothing to migrate)
- Keeping backwards compatibility with old schema or queries
- Implementing curated lists (V2)
- Text transcription fields beyond a nullable pitch_text column
- Full-text search indexes (can add later when needed)

## Decisions

### Decision 1: Single fresh migration, not incremental

**Choice:** Write one new migration (`002_voice_first_schema.sql`) that drops all old objects and creates everything fresh.

**Why:** The database is empty — no data to preserve. A single migration is simpler to review, test, and reason about than a chain of ALTER TABLE statements.

**Alternative considered:** Incremental migrations (rename reviews → pitches, add columns, drop tags). More complex, no benefit since there's no data.

### Decision 2: Keep the old migration file, don't delete it

**Choice:** Leave `001_initial_schema.sql` in place. The new `002_voice_first_schema.sql` starts with DROP statements.

**Why:** Preserves history. If the migration has already been applied to any environment, the drop-and-recreate in 002 handles it cleanly. If not, the 001 is harmless (creates tables that 002 immediately drops).

### Decision 3: open_library_key as the book dedup key

**Choice:** `books.open_library_key` is a unique nullable column. When a user pitches a book found via Open Library, we check this key first. If a record exists, reuse it.

**Why:** Open Library's work key (e.g., `/works/OL45883W`) is a stable identifier for a book across editions. ISBN varies by edition; title+author has collision risk.

**Nullable** because in edge cases a book might be added without OL data (future manual entry).

### Decision 4: Flat categories, no tags

**Choice:** Single `categories` table with a `book_categories` junction. No hierarchical tags.

**Why:** Users pick 1-3 categories when publishing a pitch. A flat list (AI, Business, Spirituality, Psychology, Fiction, History, Science, Self-Help, Philosophy, Other) is sufficient for V1 browsing/filtering. Tags add complexity without clear value at this scale.

### Decision 5: RLS with authenticated insert/update

**Choice:**
- All tables: public SELECT (anyone can browse)
- `pitches`: INSERT/UPDATE restricted to `auth.uid() = user_id`
- `users`: UPDATE restricted to `auth.uid() = id`
- `books`: INSERT for any authenticated user (first pitcher creates the record)
- `book_categories`: INSERT for any authenticated user
- `categories`: No user writes (admin-seeded)

**Why:** Pitchers can only modify their own pitches and profiles. Anyone authenticated can create books (since they're shared canonical records). Categories are predefined.

### Decision 6: Audio storage bucket with authenticated uploads

**Choice:** Supabase Storage bucket `pitch-audio` with policy: authenticated users can upload to their own folder (`{user_id}/`), public read access for playback.

**Why:** Folder-per-user keeps storage organized and makes per-user cleanup possible. Public read means audio plays without auth tokens.

**File naming:** `{user_id}/{book_id}.webm` (or .mp4 depending on browser). Simple, predictable, one file per pitch.

## Risks / Trade-offs

- **[Risk] Open Library key format changes** → Low risk. OL keys have been stable for years. Store as text, not parsed.
- **[Risk] Audio format varies by browser** → Store whatever MediaRecorder produces. Supabase Storage is format-agnostic. The `<audio>` element handles both webm and mp4.
- **[Risk] Categories too rigid** → Can always add more categories via a simple INSERT. The flat list is easy to extend without schema changes.
- **[Trade-off] No text search indexes yet** → Keeps migration simple. Add when search performance becomes an issue (unlikely at V1 scale).
- **[Trade-off] Dropping old schema entirely** → Loses the option to reference old code. Acceptable since the old code will be heavily rewritten anyway.

## Migration Plan

1. Write `002_voice_first_schema.sql`
2. Apply via Supabase MCP `apply_migration`
3. Seed the `categories` table with predefined list (10 categories)
4. Create `pitch-audio` storage bucket via Supabase dashboard or MCP
5. Verify: tables exist, RLS policies active, storage bucket accessible
6. Update `src/lib/supabase/types.ts` with new TypeScript types
7. Rollback: if issues, drop all new tables and re-apply 001 (returns to empty-but-valid old schema)

## Open Questions

- Should `books.open_library_key` use the work key (`/works/OL45883W`) or the edition key (`/books/OL7353617M`)? Work key is more canonical (groups all editions), edition key is more specific. **Recommendation: work key.**
- Maximum audio file size for the storage bucket policy? 10MB covers ~10 minutes of compressed audio, well beyond the ~90 second target.
