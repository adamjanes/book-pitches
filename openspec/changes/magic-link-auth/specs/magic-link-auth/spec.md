## ADDED Requirements

### Requirement: Unified magic link sign-in page
The system SHALL provide a single authentication page at `/login` with an email input field and a submit button. The page SHALL send a magic link via Supabase `signInWithOtp` when the user submits their email. There SHALL be no password fields, no password-based authentication, and no separate signup page.

#### Scenario: User submits valid email
- **WHEN** user enters a valid email address and clicks the submit button
- **THEN** the system sends a magic link to the provided email address and redirects to `/login/check-email?email=<encoded-email>`

#### Scenario: User submits invalid email
- **WHEN** user enters an invalid email address and clicks the submit button
- **THEN** the system displays a validation error and does not send any email

#### Scenario: User submits empty email
- **WHEN** user clicks the submit button without entering an email
- **THEN** the system displays "Email is required" validation error

#### Scenario: New user signs in for the first time
- **WHEN** user enters an email that has no existing account and clicks submit
- **THEN** the system sends a magic link (Supabase creates the account automatically on first use)

### Requirement: Check your email confirmation screen
The system SHALL display a dedicated confirmation screen at `/login/check-email` after a magic link has been requested. The screen SHALL display the email address the link was sent to, instructions to check their inbox, and a resend button.

#### Scenario: User arrives at check-email page
- **WHEN** user is redirected to `/login/check-email?email=user@example.com`
- **THEN** the system displays a confirmation message showing the email address, with instructions and a resend option

#### Scenario: User resends magic link
- **WHEN** user clicks the "Resend" button on the check-email page
- **THEN** the system sends another magic link to the same email address

#### Scenario: User resends too quickly
- **WHEN** user clicks "Resend" within 60 seconds of the previous send
- **THEN** the system displays a message indicating they must wait before resending

#### Scenario: User navigates directly to check-email without email param
- **WHEN** user navigates to `/login/check-email` without an email query parameter
- **THEN** the system redirects to `/login`

### Requirement: Magic link callback authentication
The system SHALL exchange the magic link code for a session when the user clicks the link in their email. The auth callback at `/auth/callback` SHALL redirect the user to their original destination (via `redirectTo` param) or to `/` on success.

#### Scenario: Valid magic link clicked
- **WHEN** user clicks a valid magic link in their email
- **THEN** the system exchanges the code for a session and redirects to the `redirectTo` URL or `/`

#### Scenario: Expired or invalid magic link clicked
- **WHEN** user clicks an expired or invalid magic link
- **THEN** the system redirects to `/login` with an error message

### Requirement: Signup route redirect
The system SHALL redirect `/signup` to `/login` for backwards compatibility. The signup page and its components SHALL be removed.

#### Scenario: User navigates to /signup
- **WHEN** user navigates to `/signup`
- **THEN** the system redirects to `/login`

### Requirement: Custom magic link email template
The Supabase magic link email SHALL use Book Pitches branding including: a custom subject line ("Your Book Pitches sign-in link"), branded body copy that matches the parchment/warm tone of the app, and "Book Pitches" as the sender name.

#### Scenario: User receives magic link email
- **WHEN** a magic link email is sent to the user
- **THEN** the email uses the Book Pitches branded template with custom subject line and body copy
