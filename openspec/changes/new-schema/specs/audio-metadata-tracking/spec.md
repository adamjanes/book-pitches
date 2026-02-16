# Audio Metadata Tracking

ADDED: Metadata tracking for audio pitches including URL and duration.

## Requirements

### Requirement: Audio URL Storage

The `pitches.audio_url` column SHALL store the Supabase Storage public URL of the audio file.

#### Scenario: Storing audio URL

WHEN a pitch audio file is uploaded to Supabase Storage
THEN the system SHALL generate a public URL for the file
AND the system SHALL store this URL in the pitches.audio_url column

#### Scenario: Pitch without audio

WHEN a pitch is created without audio (edge case)
THEN the system SHALL allow audio_url to be NULL

### Requirement: Duration Tracking

The `pitches.duration_seconds` column SHALL store the recording duration as an integer (nullable).

#### Scenario: Storing duration

WHEN a pitch audio file has a duration of 87.3 seconds
THEN the system SHALL store 87 in the duration_seconds column

#### Scenario: Pitch without audio has no duration

WHEN a pitch is created without audio
THEN the system SHALL allow duration_seconds to be NULL

### Requirement: Maximum Audio Duration

The system SHALL enforce a maximum audio duration of 3 minutes (180 seconds).

#### Scenario: Valid duration

WHEN a user uploads a pitch audio file with duration 120 seconds
THEN the system SHALL accept the upload and store duration_seconds as 120

#### Scenario: Duration exceeds maximum

WHEN a user attempts to upload a pitch audio file with duration 240 seconds
THEN the system SHALL reject the upload with a validation error

#### Scenario: Duration at boundary

WHEN a user uploads a pitch audio file with duration exactly 180 seconds
THEN the system SHALL accept the upload and store duration_seconds as 180

### Requirement: Audio Format Flexibility

The system SHALL accept audio in webm/opus format (Chrome) or mp4/aac format (Safari). Storage is format-agnostic.

#### Scenario: Chrome WebM upload

WHEN a Chrome user uploads a webm/opus audio file
THEN the system SHALL store the file with .webm extension
AND the system SHALL store the public URL in audio_url

#### Scenario: Safari MP4 upload

WHEN a Safari user uploads an mp4/aac audio file
THEN the system SHALL store the file with .mp4 extension
AND the system SHALL store the public URL in audio_url

#### Scenario: Format in file path

WHEN audio is stored at path "user-123/book-456.webm"
THEN the system SHALL recognize and serve the file correctly for playback
