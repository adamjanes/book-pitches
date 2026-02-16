# Voice Pitch Recording

ADDED: Support for voice-first pitch recording with audio storage and user constraints.

## Requirements

### Requirement: Pitches Table Schema

The system SHALL provide a `pitches` table with the following columns:
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, foreign key to users.id, not null)
- `book_id` (uuid, foreign key to books.id, not null)
- `audio_url` (text, nullable)
- `rating` (integer, not null, check: rating >= 0 AND rating <= 10)
- `duration_seconds` (integer, nullable)
- `pitch_text` (text, nullable)
- `created_at` (timestamptz, default now())
- UNIQUE constraint on (user_id, book_id)

#### Scenario: Creating a pitch record

WHEN a pitch is inserted
THEN the system SHALL enforce that user_id and book_id are not null
AND the system SHALL enforce that rating is between 0 and 10 inclusive
AND the system SHALL set created_at to the current timestamp if not provided

#### Scenario: Duplicate pitch prevention

WHEN a user attempts to create a second pitch for the same book
THEN the system SHALL reject the insertion with a unique constraint violation

### Requirement: One Pitch Per User Per Book

Each user SHALL be able to record exactly one pitch per book. The UNIQUE(user_id, book_id) constraint enforces this at the database level.

#### Scenario: User attempts multiple pitches for same book

WHEN a user with id "user-123" has already created a pitch for book "book-456"
AND the user attempts to insert another pitch for book "book-456"
THEN the system SHALL return a constraint violation error

### Requirement: Audio Storage Bucket

Pitch audio files SHALL be stored in a Supabase Storage bucket named `pitch-audio`.

#### Scenario: Storing pitch audio

WHEN a user uploads pitch audio
THEN the system SHALL store the file in the `pitch-audio` bucket
AND the system SHALL return a public URL for playback

### Requirement: Audio File Path Convention

Audio files SHALL be stored at path `{user_id}/{book_id}.webm` (or `.mp4` depending on browser codec).

#### Scenario: Generating audio file path

WHEN a user with id "a1b2c3d4" records a pitch for book with id "e5f6g7h8"
THEN the system SHALL store the audio file at path "a1b2c3d4/e5f6g7h8.webm" or "a1b2c3d4/e5f6g7h8.mp4"

### Requirement: Row Level Security for Pitches

The `pitches` table SHALL have RLS policies as follows:
- Anyone (authenticated or not) can SELECT pitches
- Only authenticated users can INSERT pitches where auth.uid() = user_id
- Only authenticated users can UPDATE their own pitches where auth.uid() = user_id

#### Scenario: Anonymous user reads pitches

WHEN an unauthenticated user queries the pitches table
THEN the system SHALL return all pitch records

#### Scenario: Authenticated user creates pitch

WHEN an authenticated user with id "user-123" inserts a pitch with user_id "user-123"
THEN the system SHALL allow the insertion

#### Scenario: User attempts to create pitch for another user

WHEN an authenticated user with id "user-123" attempts to insert a pitch with user_id "user-456"
THEN the system SHALL reject the insertion

#### Scenario: User updates own pitch

WHEN an authenticated user with id "user-123" updates a pitch where user_id = "user-123"
THEN the system SHALL allow the update

### Requirement: Pitch Text Reserved for Future

The `pitch_text` column SHALL be nullable and set to NULL in V1. This column is reserved for future transcription functionality.

#### Scenario: Creating pitch without text

WHEN a pitch is created in V1
THEN the system SHALL allow pitch_text to be NULL
AND the system SHALL NOT require pitch_text to be populated

### Requirement: Storage Bucket RLS

The `pitch-audio` storage bucket SHALL have policies as follows:
- Authenticated users can upload files to `{user_id}/` path only
- Anyone (authenticated or not) can read files for playback

#### Scenario: User uploads audio to own folder

WHEN an authenticated user with id "user-123" uploads a file to path "user-123/book-456.webm"
THEN the system SHALL allow the upload

#### Scenario: User attempts to upload to another user's folder

WHEN an authenticated user with id "user-123" attempts to upload a file to path "user-456/book-789.webm"
THEN the system SHALL reject the upload

#### Scenario: Anonymous user plays audio

WHEN an unauthenticated user requests to read a file from the pitch-audio bucket
THEN the system SHALL return the file for playback
