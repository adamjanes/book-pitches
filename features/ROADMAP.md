# Book Pitches — Feature Roadmap

> Updated: 2026-02-17
> Status: 4 features planned, 3 built

## Build Order

### 1. Pitch Creation Flow (includes Audio Recorder)
**Status:** spec'd — PRD + tasks ready
**Directory:** `features/pitch-creation-flow/`
The main user journey: search for a book, record an audio pitch (MediaRecorder API, 3-min max), rate it, select categories, and publish. Single-page multi-step flow. Audio is required from day 1 — the originally separate audio-recorder feature has been merged in. Nav + homepage CTA for authenticated users.

### 2. Discovery Page
**Status:** spec'd — PRD + tasks ready
**Directory:** `features/discovery-page/`
Public `/discover` route for browsing pitches. Category filter pills, sorting (recent, top-rated, most-pitched), text search, cursor-based pagination. Uses the existing `book_with_stats` view. This is the main content consumption page once pitches exist.

### 3. Landing Page
**Status:** spec'd — PRD + tasks ready
**Directory:** `features/landing-page/`
Marketing homepage explaining the pitch concept. Hero section, featured pitches (high-rated, recent), inline audio player preview, category shortcuts. Parchment/literary aesthetic. Only makes sense after there's content to showcase. ISR with 60-min revalidation.

### 4. Profile Page Enhancements
**Status:** spec'd — PRD + tasks ready
**Directory:** `features/profile-page/`
Enhance the existing `/users/[slug]` page with inline edit mode for the profile owner, audio playback on pitches, top category stats, and improved SEO metadata. The basic profile page (avatar, name, bio, pitch list) already works.

## Completed Features

### Open Library Search
BookSearch component with 300ms debounce, AbortController, book deduplication by `open_library_key`, cover images, and create-or-get server action. Fully verified.

### Magic Link Auth
Email-based magic link login (no passwords). Login, check-email confirmation, PKCE callback, session refresh via proxy, email template configured.

### Database Schema
5 tables (books, pitches, users, categories, book_categories), `book_with_stats` view, `pitch-audio` storage bucket, RLS policies. Foundation for all features.

## Notes

- **Audio recorder merged into pitch-creation-flow**: Audio is required from day 1, so the separate audio-recorder feature was folded into the creation flow PRD.
- **Waveform visualization**: Deferred to V2. Timer display is sufficient for V1.
- **Database seeding**: Not a feature — will be a one-off script run after pitch creation flow is built (264 books from brain vault).
- **AI pitch generation**: Deferred. Will bootstrap content once the creation flow is working.
- **RLS policies**: INSERT/UPDATE policies on pitches already require `auth.uid() = user_id`. Verified correct.
- **Project dashboard**: Removed from roadmap — will be built as a separate meta-project.
