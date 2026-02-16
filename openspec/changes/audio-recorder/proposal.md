# Audio Recorder

## Why

Voice-first pitch recording is the core UX differentiator for book-pitches. Users need a polished, reliable audio recording experience to capture ~90-second elevator pitches for their books with visual feedback and easy playback.

## What Changes

- Add browser MediaRecorder API integration for cross-browser audio capture (webm/opus for Chrome, mp4/aac for Safari)
- Create reusable AudioRecorder component with record, pause, resume, stop, playback, and re-record controls
- Implement microphone permission handling with request, denied, and error states
- Add visual recording indicators (waveform or timer), duration display, and recording status feedback
- Configure Supabase Storage bucket (`book-pitches-audio`) for audio file uploads
- Enforce max duration limit (3 minutes) with visual countdown
- Integrate audio upload/publish workflow into pitch editor
- Store audio metadata in reviews table (audio_url, audio_duration, audio_format)

## Capabilities

### New Capabilities

- `useAudioRecorder()`: Hook managing recording state (idle, recording, paused, playing), duration tracking, and blob management
- `<AudioRecorderUI>`: Component providing record/pause/resume/stop/playback/re-record controls with visual feedback
- `uploadAudioToStorage()`: Async function uploading recorded audio to Supabase Storage with progress tracking
- `AudioWaveform`: Component visualizing recording progress (animated waveform or timer display)
- `handleMicrophonePermission()`: Utility requesting and managing microphone access with error states
- `AudioPreview`: Component for playback of recorded audio before publishing

### Modified Capabilities

- `ReviewEditor`: Now includes AudioRecorder component and audio publish workflow
- `reviews` table schema: Add `audio_url` (string), `audio_duration` (integer, seconds), `audio_format` (string, e.g. "webm", "mp4")

## Impact

**Affected code:**
- New: `app/components/AudioRecorder/`, `app/hooks/useAudioRecorder.ts`, `app/lib/audio-storage.ts`
- Modified: `app/components/ReviewEditor/`, `app/lib/supabase-types.ts` (schema), Supabase migrations
- Storage: New bucket `book-pitches-audio` in Supabase (public read, authenticated write)

**Dependencies:**
- Browser APIs: MediaRecorder, getUserMedia, AudioContext (all standard)
- Supabase Storage client (already in use)

**Permissions:**
- Microphone access required at runtime (browser permission flow)
