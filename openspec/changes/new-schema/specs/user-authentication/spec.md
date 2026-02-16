# User Authentication

ADDED: Row-level security policies and authentication integration for multi-user access.

## Requirements

### Requirement: Pitches Table RLS

The `pitches` table SHALL have RLS policies:
- Public SELECT (anyone can read pitches)
- Authenticated INSERT where auth.uid() = user_id
- Authenticated UPDATE where auth.uid() = user_id

#### Scenario: Public reads pitches

WHEN an unauthenticated visitor queries the pitches table
THEN the system SHALL return all pitch records

#### Scenario: Authenticated user creates own pitch

WHEN an authenticated user with id "abc-123" inserts a pitch with user_id "abc-123"
THEN the system SHALL allow the insertion

#### Scenario: User cannot create pitch for another user

WHEN an authenticated user with id "abc-123" attempts to insert a pitch with user_id "xyz-789"
THEN the system SHALL reject the insertion with an RLS policy violation

#### Scenario: User updates own pitch

WHEN an authenticated user with id "abc-123" updates a pitch where user_id = "abc-123"
THEN the system SHALL allow the update

### Requirement: Users Table RLS

The `users` table SHALL have RLS policies:
- Public SELECT (anyone can read user profiles)
- Authenticated UPDATE where auth.uid() = id

#### Scenario: Public reads user profiles

WHEN an unauthenticated visitor queries the users table
THEN the system SHALL return all user profile records

#### Scenario: User updates own profile

WHEN an authenticated user with id "abc-123" updates the users record where id = "abc-123"
THEN the system SHALL allow the update

#### Scenario: User cannot update another user's profile

WHEN an authenticated user with id "abc-123" attempts to update the users record where id = "xyz-789"
THEN the system SHALL reject the update with an RLS policy violation

### Requirement: Books Table RLS

The `books` table SHALL have RLS policies:
- Public SELECT (anyone can read books)
- Authenticated INSERT (any authenticated user can create a book)

#### Scenario: Public reads books

WHEN an unauthenticated visitor queries the books table
THEN the system SHALL return all book records

#### Scenario: Authenticated user creates book

WHEN an authenticated user attempts to insert a book record
THEN the system SHALL allow the insertion

#### Scenario: Unauthenticated user cannot create book

WHEN an unauthenticated visitor attempts to insert a book record
THEN the system SHALL reject the insertion with an RLS policy violation

### Requirement: Categories Table RLS

The `categories` table SHALL have RLS policies:
- Public SELECT only (categories are admin-seeded, no user writes)

#### Scenario: Public reads categories

WHEN an unauthenticated visitor queries the categories table
THEN the system SHALL return all category records

#### Scenario: User cannot insert category

WHEN an authenticated user attempts to insert a category record
THEN the system SHALL reject the insertion with an RLS policy violation

### Requirement: Book Categories Junction Table RLS

The `book_categories` table SHALL have RLS policies:
- Public SELECT (anyone can read category assignments)
- Authenticated INSERT (any authenticated user can assign categories)

#### Scenario: Public reads book-category associations

WHEN an unauthenticated visitor queries the book_categories table
THEN the system SHALL return all book-category associations

#### Scenario: Authenticated user assigns category to book

WHEN an authenticated user inserts a record into book_categories
THEN the system SHALL allow the insertion

### Requirement: User Auto-Creation Trigger

The database SHALL have a trigger that fires on Supabase Auth signup to auto-create a row in the `users` table.

#### Scenario: New user signup

WHEN a user signs up via Supabase Auth with email "alice@example.com"
THEN the system SHALL automatically create a users record with:
- id matching the auth.users.id
- name derived from email (e.g., "alice")
- created_at set to current timestamp

#### Scenario: User record matches auth record

WHEN the trigger creates a users record
THEN the users.id SHALL match the auth.users.id exactly

### Requirement: Pitch Audio Storage Bucket RLS

The `pitch-audio` storage bucket SHALL have policies:
- Authenticated users can upload to `{user_id}/` path only
- Public read for playback

#### Scenario: User uploads audio to own folder

WHEN an authenticated user with id "abc-123" uploads a file to path "abc-123/book-456.webm"
THEN the system SHALL allow the upload

#### Scenario: User cannot upload to another user's folder

WHEN an authenticated user with id "abc-123" attempts to upload to path "xyz-789/book-456.webm"
THEN the system SHALL reject the upload with a storage policy violation

#### Scenario: Public can read audio files

WHEN an unauthenticated visitor requests to read "abc-123/book-456.webm"
THEN the system SHALL return the file for playback
