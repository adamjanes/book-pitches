# Pitch Creation Flow — Tasks

> **PRD:** [PRD.md](./PRD.md)
> **Status:** 0/22 tasks complete

---

## 0. Design System Setup

- [ ] **0.1 Set up parchment design system**
  `src/app/globals.css` + `src/app/layout.tsx`
  Add Lora font via `next/font/google` at top of layout.tsx. In globals.css, add parchment color palette to Tailwind theme:
  ```css
  @layer base {
    :root {
      --parchment-base: #F5F0E8;
      --parchment-cream: #FFFDF7;
      --parchment-border: #E5DDD0;
      --warm-brown: #8B7355;
      --warm-brown-light: #A0845C;
      --warm-brown-medium: #6B5744;
      --warm-brown-dark: #3D2B1F;
    }
  }
  ```
  Update `tailwind.config.ts` to reference these CSS variables. Apply `bg-parchment-cream` to body in layout.tsx.
  VERIFY:
  1. Navigate to any page
  2. Verify parchment cream background visible
  3. Inspect page, verify Lora font loaded
  4. Screenshot: `verification/pitch-creation-flow-0.1.png`

## 1. Server Actions & Data

- [ ] **1.1 Create publishPitch server action**
  `src/app/actions/pitches.ts` — `publishPitch(formData: FormData): Promise<PublishPitchResult>`
  Server action that receives FormData (audioBlob, bookId, rating, categoryIds, audioDuration, optional pitchText). Uploads audio to Supabase Storage at `pitch-audio/{user_id}/{book_id}.{ext}`, upserts pitch record (INSERT ON CONFLICT UPDATE), inserts new book_categories (ON CONFLICT DO NOTHING) — additive, never deletes existing categories, revalidates `/books/[slug]` and `/users/[slug]`. Returns `{ data: { bookSlug }, error }`.

- [ ] **1.2 Create getExistingPitch query**
  `src/lib/supabase/queries.ts` — `getExistingPitch(userId: string, bookId: string): Promise<PitchWithCategories | null>`
  Query pitches table for existing pitch by user_id + book_id. If found, also fetch associated category IDs from book_categories. Used to detect re-records and pre-fill rating/categories.

- [ ] **1.3 Create ensureUserProfile utility**
  `src/lib/ensureUserProfile.ts` — `ensureUserProfile(userId: string, email: string): Promise<User | null>`
  Check if a `users` row exists for the given userId. If not, create one: derive display_name from email (part before @), generate slug from display_name (lowercase, hyphens), INSERT user record. Return the user object. Called from auth callback route to auto-create user profiles on first login.

- [ ] **1.4 Update auth callback to create user profile**
  `src/app/auth/callback/route.ts`
  After successful auth exchange, call `ensureUserProfile(user.id, user.email)` to ensure the user has a profile row. This is a prerequisite for pitch creation (pitches.user_id FK constraint requires users row to exist).

## 2. Audio Recorder

- [ ] **2.1 Create useAudioRecorder hook**
  `src/hooks/useAudioRecorder.ts` — `useAudioRecorder(maxDuration?: number, minDuration?: number): AudioRecorderReturn`
  State machine hook using MediaRecorder API. States: idle → recording → paused → stopped. Handles: getUserMedia permission request with user-friendly error messages ("We need your microphone to record your pitch. Here's how to enable it:" with browser-specific instructions), mime type detection (webm for Chrome/Firefox, mp4 for Safari, mobile Safari-specific handling), mobile support (iOS audio session behavior, touch-friendly controls), dataavailable event to collect chunks, blob assembly on stop, object URL creation for preview, duration tracking via setInterval, enforce minDuration (default 10s) — disable stop button until minimum elapsed, auto-stop at maxDuration (default 180s), cleanup of object URLs and streams on unmount. Expose error state with friendly copy for permission denial and other failures.

- [ ] **2.2 Create AudioRecorder component**
  `src/components/AudioRecorder.tsx` — `AudioRecorder({ onRecordingComplete, maxDuration?, minDuration? })`
  Client component wrapping useAudioRecorder. Shows: "Start Recording" button (idle state), recording controls with timer MM:SS (recording state), pause/resume toggle, stop button (disabled until minDuration elapsed, with tooltip "Minimum 10 seconds"), countdown warning in final 30s. On stop: shows audio preview with `<audio>` element, "Re-record" and "Continue" buttons. Calls `onRecordingComplete(blob, duration)` when user confirms. Display user-friendly error messages from hook. Clean, minimal UI with Tailwind, mobile-optimized controls.
  VERIFY:
  1. Navigate to `/record` (must be logged in)
  2. Select a book from search
  3. Click "Start Recording", verify timer appears and stop button disabled
  4. Wait 10 seconds, verify stop button becomes enabled
  5. Click "Pause", verify timer freezes, click "Resume"
  6. Click "Stop", verify audio preview plays
  7. Screenshot: `verification/pitch-creation-flow-2.2.png`

## 3. Form Components

- [ ] **3.1 Create RatingSlider component**
  `src/components/RatingSlider.tsx` — `RatingSlider({ value, onChange })`
  Client component. HTML range input, min=0, max=10, step=1. Large numeric display of current value. Color-coded: 0-3 red, 4-6 amber, 7-10 green (matching existing Rating component colors). Accessible with aria-label.
  VERIFY:
  1. Navigate to `/record`, select book, complete recording
  2. Verify slider appears with 0-10 range
  3. Drag to different values, verify display updates
  4. Screenshot: `verification/pitch-creation-flow-3.1.png`

- [ ] **3.2 Create CategoryPills component**
  `src/components/CategoryPills.tsx` — `CategoryPills({ categories, selected, onChange, min?, max? })`
  Client component. Renders category names as clickable pill buttons. Selected pills get accent background. Enforces min (default 1) and max (default 3) selection. Shows validation message if constraints not met. Props: categories array, selected IDs, onChange callback.
  VERIFY:
  1. Navigate to `/record`, progress to rate step
  2. Verify all 10 categories displayed as pills
  3. Select 1 pill — verify highlighted
  4. Select 4th pill — verify it's blocked (max 3)
  5. Screenshot: `verification/pitch-creation-flow-3.2.png`

- [ ] **3.3 Create BookSummary component**
  `src/components/BookSummary.tsx` — `BookSummary({ book, onChangeBook? })`
  Client component. Compact display of selected book: cover image (64px), title, author, published year. Optional "Change" button that calls onChangeBook to return to search step.

## 4. Record Page

- [ ] **4.1 Create RecordPage layout and step orchestration**
  `src/app/record/page.tsx` — server component wrapper + `RecordForm` client component
  Server component fetches categories (for step 3) and current user. Renders `RecordForm` client component that manages PitchFormState with 4 steps: search, record, rate, review. Step indicators at top showing progress. Only the active step is expanded; completed steps show collapsed summaries. beforeunload handler when audioBlob exists.

- [ ] **4.2 Implement Step 1: Book Search & Selection**
  `src/app/record/page.tsx` — within `RecordForm`
  Mount existing BookSearch component with onBookSelected callback. When book selected: store in state, call checkExistingPitch server action, if exists show re-record notice and pre-fill rating + categories. Collapse into BookSummary. Advance to step 2.
  VERIFY:
  1. Navigate to `/record` while logged in
  2. Search for a book, click a result
  3. Verify BookSearch collapses to BookSummary
  4. Verify step 2 (recording) activates
  5. Screenshot: `verification/pitch-creation-flow-4.2.png`

- [ ] **4.3 Implement Step 2: Audio Recording**
  `src/app/record/page.tsx` — within `RecordForm`
  Mount AudioRecorder component. When recording complete (user clicks "Continue"): store audioBlob and duration in state. Advance to step 3.
  VERIFY:
  1. At step 2, click "Start Recording"
  2. Record for a few seconds, click "Stop"
  3. Verify preview plays audio
  4. Click "Continue", verify step 3 activates
  5. Screenshot: `verification/pitch-creation-flow-4.3.png`

- [ ] **4.4 Implement Step 3: Rate & Categorize**
  `src/app/record/page.tsx` — within `RecordForm`
  Mount RatingSlider and CategoryPills. Validate: rating selected (no default — slider starts unset, Continue disabled until rating explicitly selected), 1-3 categories selected. "Continue" button disabled until valid. On continue: advance to step 4.
  VERIFY:
  1. At step 3, adjust rating slider
  2. Select 2 categories
  3. Click "Continue", verify step 4 activates
  4. Screenshot: `verification/pitch-creation-flow-4.4.png`

- [ ] **4.5 Implement Step 4: Review & Publish**
  `src/app/record/page.tsx` — within `RecordForm`
  Show PitchReview component: BookSummary, audio player, rating badge, category pills. "Publish" button calls publishPitch server action via FormData. Show loading spinner during publish. On success: redirect to `/books/{slug}`. On error: show error, keep state.
  VERIFY:
  1. At step 4, verify all pitch details displayed
  2. Verify audio playback works
  3. Click "Publish", verify loading state
  4. Verify redirect to book page with new pitch visible
  5. Screenshot: `verification/pitch-creation-flow-4.5.png`

## 5. Navigation & CTA

- [ ] **5.1 Add "Record a Pitch" to Navigation**
  `src/components/Navigation.tsx`
  Add a "Record a Pitch" link inside the `{user ? (...)` block, before the logout form. Style as an OUTLINED button: border in accent color, accent text, no fill, rounded. This is logged-in only (already inside user check).
  VERIFY:
  1. Navigate to homepage while logged in
  2. Verify "Record a Pitch" outlined button in nav bar
  3. Log out, verify button disappears
  4. Screenshot: `verification/pitch-creation-flow-5.1.png`

- [ ] **5.2 Add "Record a Pitch" CTA to homepage**
  `src/app/page.tsx`
  Add a CTA button in the hero section. Requires auth check: fetch user in the server component. If logged in: show "Record a Pitch" button linking to `/record`. If not: show "Sign up to pitch" linking to `/login`.
  VERIFY:
  1. Visit homepage while logged in — verify "Record a Pitch" button
  2. Visit homepage while logged out — verify "Sign up to pitch" button
  3. Screenshot: `verification/pitch-creation-flow-5.2.png`

## 6. Edge Cases & Polish

- [ ] **6.1 Handle existing pitch (re-record flow)**
  `src/app/record/page.tsx` + `src/app/actions/pitches.ts`
  When user selects a book they've already pitched: show notice banner ("You already pitched this book. Recording will replace your existing pitch."). Pre-fill rating slider and category pills with existing values. publishPitch action uses upsert (ON CONFLICT UPDATE) to overwrite pitch audio/metadata. Categories are additive (new ones added, existing kept).
  VERIFY:
  1. Create a pitch for a book
  2. Navigate to `/record`, search for same book
  3. Verify notice appears with existing rating/categories pre-filled
  4. Record new audio, publish
  5. Verify book page shows updated pitch (not duplicate)
  6. Screenshot: `verification/pitch-creation-flow-6.1.png`

- [ ] **6.2 Create PitchReview component**
  `src/components/PitchReview.tsx` — `PitchReview({ book, audioUrl, rating, categories })`
  Summary display for the review step. Shows BookSummary, `<audio>` element with controls, Rating badge, category TagBadges. "Back" button and "Publish" button (passed as props/callbacks). Clean card layout.

- [ ] **6.3 Create ReviewCard component with inline audio**
  `src/components/ReviewCard.tsx` — `ReviewCard({ pitch, book, user })`
  Card component for displaying a pitch in lists (profile page, book page, discovery feed). Shows user info (avatar, name), rating badge, pitch text excerpt, categories. NEW: when `pitch.audio_url` is present, display an inline `<audio>` element with browser controls for playback. This makes pitch audio accessible on profile pages and book pages without waiting for a dedicated audio player feature.

## 7. Integration & E2E Verification

- [ ] **7.1 Full flow verification — new pitch**
  VERIFY:
  1. Log in via magic link
  2. Click "Record a Pitch" in nav
  3. Search for "Thinking, Fast and Slow"
  4. Select the book, verify BookSummary appears
  5. Record audio (5+ seconds)
  6. Rate 8/10, select "Psychology" and "Science"
  7. Review, click "Publish"
  8. Verify redirect to book page with pitch visible
  9. Screenshot: `verification/pitch-creation-flow-e2e-new.png`

- [ ] **7.2 Full flow verification — re-record existing pitch**
  VERIFY:
  1. Navigate to `/record`
  2. Select same book from 7.1
  3. Verify re-record notice and pre-filled rating/categories
  4. Record new audio, change rating to 9
  5. Publish
  6. Verify book page shows updated pitch (1 pitch total, not 2)
  7. Screenshot: `verification/pitch-creation-flow-e2e-rerecord.png`
