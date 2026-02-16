# Audio Recorder Design

## Context

Audio recording is the core UX differentiator for book-pitches. Users record ~90-second elevator pitches for books they love. The browser's MediaRecorder API provides cross-browser audio capture without external dependencies. Recorded audio is uploaded to Supabase Storage in a `pitch-audio` bucket (defined in the new-schema change). The pitches table stores `audio_url` and `duration_seconds`.

## Goals / Non-Goals

**Goals:**
- Cross-browser audio recording (Chrome, Safari, Firefox, Edge)
- Clean recording UX: record, pause, resume, stop, preview, re-record
- Microphone permission handling with clear user feedback
- Duration tracking with visual timer display
- Max recording duration of 3 minutes with countdown
- Supabase Storage upload with progress feedback
- Reusable hook and component for the pitch creation flow

**Non-Goals:**
- Audio editing (trim, splice) — V2
- Waveform visualization during recording — V2 (timer is sufficient for V1)
- Audio compression or transcoding — accept browser-native formats
- Background recording or recording while navigating away
- Offline recording support
- Real-time streaming upload

## Decisions

### Decision 1: Native MediaRecorder API, no third-party library

**Choice:** Use the browser's built-in MediaRecorder API directly. No npm dependencies for recording.

**Why:** MediaRecorder is well-supported across modern browsers (Chrome 49+, Firefox 25+, Safari 14.1+, Edge 79+). Third-party libraries (RecordRTC, react-media-recorder) wrap the same API with extra abstraction that adds bundle size without adding capability we need. A custom `useAudioRecorder` hook gives us full control over the recording lifecycle.

**Alternative considered:** `react-media-recorder` package. Easier initial setup but less control over state transitions and harder to customize for our specific UX (max duration, pause/resume, re-record).

### Decision 2: Accept whatever audio format the browser produces

**Choice:** Don't specify a preferred MIME type. Let the browser use its default: `audio/webm;codecs=opus` (Chrome/Firefox) or `audio/mp4` (Safari). Store the MIME type alongside the audio URL.

**Why:** Forcing a specific format causes cross-browser issues. Chrome doesn't support MP4 recording natively, and Safari doesn't support WebM recording. Both formats play back fine in the HTML5 `<audio>` element across browsers. Supabase Storage is format-agnostic.

**Alternative considered:** Force `audio/webm` everywhere. Would require a polyfill or transcoding for Safari — unnecessary complexity.

**File extension logic:** Check `MediaRecorder.isTypeSupported('audio/webm')` — if true, use `.webm`; else use `.mp4`.

### Decision 3: State machine for recording lifecycle

**Choice:** Model the recorder as a state machine with explicit states: `idle` → `recording` → `paused` → `stopped` → `previewing`. The `useAudioRecorder` hook manages all transitions.

**States:**
- `idle`: No recording. Show "Start Recording" button.
- `recording`: MediaRecorder active. Show timer, pause button, stop button.
- `paused`: MediaRecorder paused. Show resume button, stop button.
- `stopped`: Recording complete, blob available. Show playback, re-record, and "use this recording" buttons.
- `previewing`: Playing back the recording. Show audio controls.

**Why:** Explicit states prevent invalid transitions (e.g., trying to pause when not recording) and make the UI logic predictable. Each state maps to a specific set of visible controls.

**Alternative considered:** Boolean flags (`isRecording`, `isPaused`, `hasRecording`). Leads to impossible combinations and messy conditional rendering.

### Decision 4: Upload on publish, not on stop

**Choice:** Keep the recorded audio as a Blob in memory until the user publishes their pitch. Only upload to Supabase Storage at publish time.

**Why:** Users often re-record before they're satisfied. Uploading on every stop would create orphaned files in Storage. By uploading only on publish, we ensure every file in Storage corresponds to a published pitch.

**Storage path:** `{user_id}/{book_id}.webm` (or `.mp4`). One file per pitch — overwriting on re-record/re-publish.

**Alternative considered:** Upload immediately on stop, delete orphans later. Simpler upload flow but creates storage management overhead and potential orphan cleanup issues.

### Decision 5: Simple timer display, not waveform

**Choice:** Show a numeric timer (MM:SS) during recording with a pulsing red dot indicator. No waveform visualization for V1.

**Why:** Waveform visualization requires an AudioContext analyzer and canvas rendering — significant implementation effort for a visual nicety. A clear timer with a recording indicator is sufficient for users to know they're recording and how long they have left. The 3-minute max is shown as a countdown.

**Alternative considered:** Real-time waveform using AudioContext + Canvas. Polished but complex. Can add in V2 as a progressive enhancement.

### Decision 6: Storage path pattern with user/book structure

**Choice:** Audio files stored at `pitch-audio/{user_id}/{book_id}.{ext}`. One file per user per book. Re-recording overwrites the previous file.

**Why:** Matches the UNIQUE(user_id, book_id) constraint on the pitches table. Simple, predictable paths. Overwrite on re-record keeps storage clean — no orphan files, no need for cleanup jobs.

**Public URL:** `{SUPABASE_URL}/storage/v1/object/public/pitch-audio/{user_id}/{book_id}.{ext}` — this URL is stored in `pitches.audio_url`.

**Alternative considered:** Timestamp-based paths (`{user_id}/{book_id}/{timestamp}.webm`). Preserves history but creates orphans when users re-record. Not worth the complexity for V1.

## Risks / Trade-offs

- **[Risk] Safari MediaRecorder support** → Safari 14.1+ supports MediaRecorder but with quirks (MP4 only, some events behave differently). Mitigation: test on Safari explicitly; the state machine approach isolates browser differences.
- **[Risk] Microphone permission denied** → Users may deny mic access or be on a device without a microphone. Mitigation: clear permission request UI with explanation of why mic access is needed; graceful fallback showing "microphone access required" message.
- **[Risk] Large audio files** → 3 minutes of audio at default bitrate can be 2-5MB. Mitigation: the 10MB storage limit (from new-schema design) covers this with room to spare. Monitor average file sizes.
- **[Trade-off] No audio compression** → Files are larger than they could be with server-side transcoding. Acceptable for V1 — modern codecs (Opus, AAC) are already efficient.
- **[Trade-off] Blob in memory until publish** → Large recordings consume browser memory. At 3 minutes max (~5MB), this is negligible on modern devices.
- **[Risk] Upload failure during publish** → Network issues could cause upload to fail. Mitigation: show error state with retry button; the blob remains in memory so the user doesn't lose their recording.

## Open Questions

- Should we show a "time remaining" countdown or a "time elapsed" counter? **Recommendation: elapsed time with a subtle indicator at 2:30 showing "30 seconds remaining."**
- Should re-recording require explicit confirmation ("Are you sure? This will discard your current recording")? **Recommendation: yes, a simple confirm dialog to prevent accidental loss.**
