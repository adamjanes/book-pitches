# Pitch Creation Flow

## Why
Users need an end-to-end way to discover books and record their own elevator pitches. This flow ties together book search, audio recording, and pitch publishing into a single user journey that drives engagement and content creation.

## What Changes
- Add "Record a Pitch" CTA on homepage and navigation
- Create multi-step pitch recording page with form flow: search → select book → record audio → rate → categorize → publish
- Build pitch publication endpoint that creates DB record + uploads audio to Storage
- Add pitch display on book pages showing all reviews/pitches
- Implement redirect-to-login for unauthenticated users attempting to record
- Add success state with redirect to published pitch on book page

## Capabilities

### New Capabilities
- `record-pitch-page`: Page component with multi-step form (search, audio recording, rating slider, category multi-select)
- `publish-pitch-action`: Server action that creates pitch record in DB and uploads audio file to Storage
- `pitch-form-validation`: Client-side validation (audio required, rating required, book selected, categories selected)
- `book-search-integration`: Embed Open Library search in pitch flow, populate form with selected book data
- `audio-upload-handler`: Handle audio blob → Storage upload with proper naming/metadata
- `pitch-redirect-logic`: Redirect authenticated users to pitch on book page after publish; redirect unauthenticated to login

### Modified Capabilities
- `book-page`: Display all pitches/reviews for a book (currently displays only canonical data)
- `navigation`: Add "Record a Pitch" CTA
- `auth-middleware`: Protect pitch recording page; redirect to login if not authenticated

## Impact
- **New tables/queries:** Pitches must be readable on book pages (SELECT from reviews table with user joins)
- **Storage:** Audio files stored in `pitches/{book_id}/{user_id}/{timestamp}.webm` or similar
- **Dependencies:** Requires auth-setup, open-library-search, and audio-recorder to be complete first
- **Modified files:** app/page.tsx (nav), app/books/[id]/page.tsx (pitch display), app/record/page.tsx (new)
- **API routes:** POST /api/pitches (create + upload), GET /api/books/[id]/pitches (fetch for display)
