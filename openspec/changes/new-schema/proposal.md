# New Schema Proposal

## Why

The app is pivoting from a static curated book display site to a voice-first audio pitch platform. The old schema (reviews with text pitches) doesn't support audio storage, duration tracking, or Open Library integration. Multi-user audio pitches require a cleaner data model with proper foreign key constraints and RLS policies for authenticated access.

## What Changes

### Schema Changes
- `reviews` table renamed to `pitches` with new columns: `audio_url`, `duration_seconds`
- `pitch_text` becomes optional (NULL in V1, generated later)
- `books` gains `open_library_key`, `description` fields from Open Library API
- `books.slug` added for cleaner URLs
- `users` gains `location` field
- `tags` and `book_tags` tables removed — replaced with simpler flat `categories` + `book_categories` junction table
- `categories.display_order` added for custom sorting

### Table Adjustments
- `pitches` UNIQUE constraint: `(user_id, book_id)` — one pitch per user per book
- `users.slug` added for profile URLs
- `books.created_at` added for sorting

### Views & Functions
- `book_with_stats` view updated to query `pitches` table instead of `reviews`
- Aggregate functions refactored to count pitches, avg rating

### RLS Policies
- `pitches`: SELECT all, INSERT/UPDATE only authenticated users (own pitches)
- `users`: SELECT all, UPDATE authenticated users (own profile)
- `books` and `categories`: SELECT all (public read)

### Storage
- New Supabase Storage bucket: `audio-pitches` for audio file uploads

## Capabilities

### New Capabilities
- `voice-pitch-recording`: Users record audio pitches; app stores via Supabase Storage and tracks duration
- `open-library-search`: Search and import books from Open Library API; auto-populate cover_url, description, published_year
- `user-authentication`: Sign up, log in, manage profile (name, location, avatar_url, bio)
- `audio-metadata-tracking`: Store pitch duration and audio URL; enables future playback, analytics

### Modified Capabilities
- `book-discovery`: Users can now assign books to multiple categories while recording pitches (not pre-categorized)
- `user-profiles`: Extended with location, slug-based URLs, timestamps
- `book-records`: Enhanced with Open Library metadata; books created on-demand during pitch recording
- `rating-and-review`: Pitches now carry audio_url and duration; pitch_text optional

## Impact

### Affected Code
- Database migrations: 7 new migration files (drop old tables, create new schema)
- API routes: `/api/pitches`, `/api/books`, `/api/users` — updated for new tables
- React components: `PitchForm`, `BookSearch`, `BookCard`, `UserProfile` — refactored for audio recording, Open Library integration
- Supabase client hooks: `usePitches`, `useBooks`, `useUser` — updated queries
- Storage: New bucket policy for authenticated audio uploads

### Dependencies
- OpenAI Whisper (future) — for speech-to-text transcription
- Open Library API client (new)
- Audio recording library (e.g., `react-recorder` or `waveform-audio`)

### Data Migration
- Existing reviews data: backfill as pitches with audio_url = NULL, duration_seconds = NULL
- Books: auto-tag with existing categories (manual one-time mapping)
- Users: inherit from reviews.author_id, populate slug from name

## Breaking Changes
- Old `reviews` table no longer exists
- `tags` and `book_tags` removed — client queries must use `categories` + `book_categories`
- `books` table now requires `open_library_key` for new records (old records: NULL allowed)
