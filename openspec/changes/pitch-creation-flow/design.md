# Pitch Creation Flow — Design

## Context

The pitch creation flow is the central user journey — the page where search, recording, and publishing come together. It depends on three prior changes: auth-setup (user must be logged in), open-library-search (find and select a book), and audio-recorder (record the pitch). The flow takes a user from "I want to pitch a book" to "my pitch is published and playable on the book page." The pitches table uses a UNIQUE(user_id, book_id) constraint — one pitch per user per book. Categories (10 predefined: AI, Business, Spirituality, Psychology, Fiction, History, Science, Self-Help, Philosophy, Other) are assigned at pitch time via a book_categories junction table.

## Goals / Non-Goals

**Goals:**
- Single-page multi-step flow: search → select book → record audio → rate → categorize → publish
- Server Action for atomic publish (create pitch record + upload audio + assign categories)
- "Record a Pitch" CTA accessible from navigation and homepage
- Redirect unauthenticated users to login, then back to recording
- Success state with link to the published pitch on the book page
- One pitch per user per book (edit/re-record overwrites existing)

**Non-Goals:**
- Draft saving or partial pitch persistence — V2
- Scheduling or delayed publishing
- Collaborative pitches (multiple users on one pitch)
- Text-only pitches (audio required in V1)
- Bulk recording (one book at a time)

## Decisions

### Decision 1: Single page with step sections, not multi-route wizard

**Choice:** The pitch recording flow lives on a single page (`/record`) with visually distinct step sections that collapse/expand as the user progresses. No route changes between steps.

**Why:** A single page preserves all form state in component state — no need for URL params, localStorage, or server-side session state. If the user refreshes, they start over (acceptable for V1). Multi-route wizards require state persistence between pages and add complexity with back/forward navigation.

**Steps:**
1. **Search & Select Book** — BookSearch component, collapses after selection showing selected book summary
2. **Record Audio** — AudioRecorder component, appears after book selection
3. **Rate & Categorize** — Rating slider (0-10) + category multi-select pills, appears after recording
4. **Review & Publish** — Summary card with playback, publish button

**Alternative considered:** Multi-route wizard (`/record/search`, `/record/record`, `/record/review`). Better URL-driven state but requires state persistence between routes — overly complex for V1.

### Decision 2: Server Action for publish

**Choice:** Use a Next.js Server Action that receives the form data (book_id, rating, categories, audio blob) and handles the full publish flow atomically.

**Why:** Server Actions are the idiomatic Next.js App Router pattern for form mutations. They run server-side with full access to Supabase service role (if needed), handle revalidation automatically, and don't require a separate API route.

**Publish flow:**
1. Upload audio blob to Supabase Storage (`pitch-audio/{user_id}/{book_id}.{ext}`)
2. Get the public URL of the uploaded file
3. Insert pitch record: `{user_id, book_id, audio_url, rating, duration_seconds}`
4. Insert book_categories rows for selected categories
5. Revalidate book page and user profile
6. Return success with book slug for redirect

**Error handling:** If audio upload fails, don't create the pitch record. If pitch insert fails (e.g., duplicate constraint), return error to client. Audio upload is the most likely failure point.

**Alternative considered:** API route (`POST /api/pitches`). Works but requires manual FormData handling, separate revalidation calls, and doesn't integrate as cleanly with the form component.

### Decision 3: Category selection via multi-select pills

**Choice:** Show all 10 categories as clickable pill/chip buttons. Users select 1-3 categories. Selected pills are highlighted. Enforce min 1, max 3 via client validation.

**Why:** With only 10 categories, all fit on screen without a dropdown or search. Pills are touch-friendly and visually clear. The 1-3 limit prevents over-categorization while ensuring every pitched book has at least one category for discovery filtering.

**Alternative considered:** Dropdown multi-select. Requires more interaction (open, scroll, select, close). Worse for 10 items that fit on one row.

### Decision 4: 0-10 rating with step slider

**Choice:** HTML range input (slider) for rating, 0 to 10 in 0.5 increments. Display the current value prominently next to the slider.

**Why:** The data model uses a 0-10 rating. A slider is intuitive for a continuous range and touch-friendly. Half-point increments (0.5) give enough granularity without overwhelming the user. No star rating — the 0-10 scale is already established in the data model from the original design.

**Alternative considered:** 5-star rating component. More conventional but would require mapping to the 0-10 scale (1 star = 2, etc.) — an unnecessary translation.

### Decision 5: Edit overwrites, no separate edit mode for V1

**Choice:** If a user navigates to `/record` and selects a book they've already pitched, show their existing pitch with an option to re-record. Re-recording overwrites the audio file and updates the pitch record.

**Why:** The UNIQUE(user_id, book_id) constraint means one pitch per user per book. Rather than blocking re-recording, allow users to improve their pitches. The overwrite is simpler than versioning and keeps storage clean.

**Flow for existing pitch:**
1. User selects a book they've already pitched
2. Show: "You already have a pitch for this book. Want to update it?"
3. Pre-fill rating and categories from existing pitch
4. Recording starts fresh (don't load old audio into recorder)
5. On publish: UPDATE pitch record, overwrite audio in Storage

### Decision 6: Auth redirect with return URL

**Choice:** If an unauthenticated user clicks "Record a Pitch", redirect to `/login?redirect=/record`. After login, redirect back to `/record`.

**Why:** Standard auth redirect pattern. The `redirect` query param preserves the user's intent. The login page reads this param and redirects after successful authentication. This is handled by the auth-setup middleware — if middleware detects an unauthenticated user on `/record`, it redirects to login with the return URL.

## Risks / Trade-offs

- **[Risk] Audio blob lost on page refresh** → Users lose their recording if they accidentally refresh. Mitigation: warn on beforeunload event when a recording exists. V2 could persist blobs in IndexedDB.
- **[Risk] Publish fails after audio upload** → Audio is in Storage but pitch record wasn't created. Mitigation: the overwrite path pattern means the orphan will be overwritten on the next attempt. No cleanup needed.
- **[Risk] Race condition on book creation** → User selects a book that doesn't exist in DB yet. The open-library-search create-or-get pattern handles this with a UNIQUE constraint fallback.
- **[Trade-off] No draft persistence** → Users can't save partial pitches. Acceptable for V1 — the flow is short (~2 minutes end to end). V2 could add IndexedDB-based draft saving.
- **[Trade-off] Single-page state management** → All state lives in React component state. If the page is complex enough, this could get unwieldy. Mitigation: each step is a separate component with its own local state; the parent coordinates.

## Open Questions

- Should we pre-select categories if the book already has categories from other users' pitches? **Recommendation: no — let each user choose their own categorization. Categories can differ per perspective.**
- Should the "Record a Pitch" CTA be in the main nav or just on the homepage? **Recommendation: both — nav link for authenticated users, prominent CTA on homepage for everyone.**
