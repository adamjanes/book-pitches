# User Profiles

MODIFIED: Update user profiles to use pitches with audio instead of text reviews, and add new user metadata fields.

## Requirements

### Requirement: R-USER-01 (Profile route)

MODIFIED: Route uses `/u/[slug]` pattern (was `/users/[slug]`).

#### Scenario: Accessing user profile

WHEN a user navigates to `/u/adam-janes`
THEN the system SHALL fetch the user with slug "adam-janes"
AND the system SHALL display their profile page

#### Scenario: Slug not found

WHEN a user navigates to `/u/nonexistent-user`
THEN the system SHALL return a 404 Not Found page

### Requirement: R-USER-02 (Data fetching)

MODIFIED: Fetches user + all PITCHES (not reviews), each with audio_url and duration.

#### Scenario: Loading user profile data

WHEN a user profile page loads
THEN the system SHALL fetch the user record
AND the system SHALL fetch all pitches by that user
AND each pitch SHALL include audio_url, duration_seconds, rating, book data, and created_at

#### Scenario: User with no pitches

WHEN a user has created no pitches
THEN the system SHALL display "No pitches yet"

### Requirement: R-USER-06 (Pitches section)

MODIFIED: Renamed from "Pitches" section — shows audio pitch players with playback, not text reviews.

#### Scenario: Displaying user pitches

WHEN a user profile page loads for a user with 5 pitches
THEN the system SHALL display a "Pitches" section with 5 audio players
AND each SHALL show the book title, author, rating, and audio player

#### Scenario: Playing pitch audio

WHEN a visitor clicks play on a pitch audio player
THEN the system SHALL stream the audio file from Supabase Storage
AND the system SHALL display playback controls and progress

### Requirement: R-USER-07 (PitchCard component)

MODIFIED: Renamed from ReviewCard to PitchCard. Displays audio player, rating, book title/author link, date. No text content in V1.

#### Scenario: Rendering PitchCard

WHEN a PitchCard is rendered for a pitch
THEN the system SHALL display:
- Book title (linked to book detail page)
- Book author
- Rating (e.g., "9/10")
- Audio player with playback controls
- Date posted
AND the system SHALL NOT display any text content (pitch_text is NULL in V1)

#### Scenario: Pitch without audio (edge case)

WHEN a pitch has no audio_url (NULL)
THEN the PitchCard SHALL display a placeholder message "Audio not available"

### Requirement: User Location Field

ADDED: The `users` table gains a `location` column (text, nullable).

#### Scenario: Displaying user location

WHEN a user profile has location "Sydney, Australia"
THEN the system SHALL display the location on the profile page

#### Scenario: User without location

WHEN a user has not set a location (NULL)
THEN the system SHALL NOT display a location field

### Requirement: User Slug Field

ADDED: The `users` table gains a `slug` column (text, unique, not null) for profile URLs.

#### Scenario: Generating user slug

WHEN a user signs up with name "Adam Janes"
THEN the system SHALL generate slug "adam-janes"
AND the system SHALL ensure the slug is unique

#### Scenario: Slug collision

WHEN a user signs up with name "Adam Janes"
AND a user with slug "adam-janes" already exists
THEN the system SHALL generate slug "adam-janes-2"

### Requirement: User Metadata Fields

ADDED: The `users` table has the following fields:
- `avatar_url` (text, nullable)
- `bio` (text, nullable)
- `name` (text, not null)
- `created_at` (timestamptz, default now())

#### Scenario: Complete user profile

WHEN a user has set all profile fields
THEN the system SHALL display:
- Avatar image from avatar_url
- Name
- Bio text
- Location
- Member since date (from created_at)

#### Scenario: Minimal user profile

WHEN a user has only set their name
THEN the system SHALL display:
- Default avatar placeholder
- Name
- Member since date
AND the system SHALL NOT display empty bio or location fields
