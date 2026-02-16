## 1. Write Migration SQL

- [x] 1.1 Create `002_voice_first_schema.sql` migration file that drops all old tables (book_tags, tags, reviews, books, categories, users) and the book_with_stats view
- [x] 1.2 Define `users` table: id (uuid PK default gen_random_uuid()), name (text not null), slug (text unique not null), avatar_url (text), bio (text), location (text), created_at (timestamptz default now())
- [x] 1.3 Define `books` table: id (uuid PK), title (text not null), author (text not null), open_library_key (text unique), cover_url (text), published_year (integer), description (text), slug (text unique not null), created_at (timestamptz default now())
- [x] 1.4 Define `pitches` table: id (uuid PK), user_id (uuid FK users on delete cascade), book_id (uuid FK books on delete cascade), audio_url (text), rating (integer check 0-10), duration_seconds (integer), pitch_text (text), created_at (timestamptz default now()), UNIQUE(user_id, book_id)
- [x] 1.5 Define `categories` table: id (uuid PK), name (text unique not null), slug (text unique not null), display_order (integer not null default 0)
- [x] 1.6 Define `book_categories` junction table: book_id (uuid FK books on delete cascade), category_id (uuid FK categories on delete cascade), PRIMARY KEY (book_id, category_id)
- [x] 1.7 Create `book_with_stats` view joining books with avg_rating and pitch_count from pitches table
- [x] 1.8 Create indexes on: pitches(user_id), pitches(book_id), books(slug), books(author), users(slug), book_categories(category_id)

## 2. RLS Policies

- [x] 2.1 Enable RLS on all tables (users, books, pitches, categories, book_categories)
- [x] 2.2 Add pitches policies: public SELECT, authenticated INSERT (auth.uid() = user_id), authenticated UPDATE (auth.uid() = user_id)
- [x] 2.3 Add users policies: public SELECT, authenticated UPDATE (auth.uid() = id)
- [x] 2.4 Add books policies: public SELECT, authenticated INSERT (any authenticated user)
- [x] 2.5 Add categories policy: public SELECT only
- [x] 2.6 Add book_categories policies: public SELECT, authenticated INSERT (any authenticated user)

## 3. Auth Trigger

- [x] 3.1 Create database function `handle_new_user()` that inserts a row into `users` when a new auth.users record is created, deriving name from email and generating a slug
- [x] 3.2 Create trigger `on_auth_user_created` on auth.users AFTER INSERT that calls `handle_new_user()`

## 4. Storage Bucket

- [x] 4.1 Create Supabase Storage bucket `pitch-audio` with public read access
- [x] 4.2 Add storage policy: authenticated users can upload to their own `{user_id}/` folder
- [x] 4.3 Add storage policy: public read access for all files in the bucket

## 5. Seed Categories

- [x] 5.1 Insert predefined categories via migration: AI, Business, Spirituality, Psychology, Fiction, History, Science, Self-Help, Philosophy, Other — with sequential display_order values

## 6. Apply Migration & Verify

- [x] 6.1 Apply migration to Supabase via MCP `apply_migration`
- [x] 6.2 Verify all tables exist with correct columns using `list_tables`
- [x] 6.3 Verify RLS policies are active by checking `execute_sql` with policy queries
- [x] 6.4 Verify storage bucket exists and policies are set

## 7. Update TypeScript Types

- [x] 7.1 Generate fresh TypeScript types from Supabase using `generate_typescript_types` MCP tool
- [x] 7.2 Update `src/lib/supabase/types.ts` with generated types
- [x] 7.3 Update `src/lib/supabase/queries.ts` to use new table names (pitches instead of reviews, categories instead of tags, book_categories instead of book_tags)

## 8. Cleanup Old Code

- [x] 8.1 Remove `scripts/seed.ts` (Obsidian seeding script no longer needed)
- [x] 8.2 Remove `gray-matter` from package.json dependencies
- [x] 8.3 Remove the `seed` script from package.json scripts
