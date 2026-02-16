# User Signup

## Overview
Users can create accounts via email and password. The signup flow captures name, email, and password, creates an auth user, and triggers automatic profile creation via database trigger.

## Requirements

### Requirement: Signup Page Route
The application SHALL provide a signup page at `/signup`.

#### Scenario: Access Signup Page
**WHEN** an unauthenticated user navigates to `/signup`
**THEN** the signup form SHALL be displayed with fields for name, email, and password.

#### Scenario: Redirect Authenticated Users
**WHEN** an authenticated user navigates to `/signup`
**THEN** the user SHALL be redirected to `/` (home page).

### Requirement: Signup Form Validation
The signup form SHALL validate all input fields before submission.

#### Scenario: Valid Email Format
**WHEN** the user enters an email address
**THEN** the form SHALL validate that it is a properly formatted email address.

#### Scenario: Minimum Password Length
**WHEN** the user enters a password
**THEN** the form SHALL validate that it is at least 6 characters long.

#### Scenario: Required Name Field
**WHEN** the user submits the form
**THEN** the name field SHALL be required and non-empty.

#### Scenario: Display Validation Errors
**WHEN** validation fails on any field
**THEN** the form SHALL display specific error messages for each invalid field.

### Requirement: Account Creation
The signup form SHALL create a new user account when submitted with valid data.

#### Scenario: Successful Signup
**WHEN** a user submits valid name, email, and password
**THEN** the system SHALL call `supabase.auth.signUp()` with email, password, and name in `user_metadata`
**AND** on success SHALL redirect the user to `/` (home page).

#### Scenario: Duplicate Email
**WHEN** a user attempts to sign up with an email that already exists
**THEN** the system SHALL display an error message indicating the email is already taken.

#### Scenario: Weak Password
**WHEN** Supabase rejects a password as too weak
**THEN** the system SHALL display the error message from Supabase.

#### Scenario: Network Error
**WHEN** the signup request fails due to network issues
**THEN** the system SHALL display a user-friendly error message.

### Requirement: User Metadata
The signup process SHALL include the user's name in the auth user metadata.

#### Scenario: Name in Metadata
**WHEN** creating a new user account
**THEN** the system SHALL pass the name field as `user_metadata.name` to `supabase.auth.signUp()`.

### Requirement: Profile Creation
A database trigger SHALL automatically create a user profile when a new auth user is created.

#### Scenario: Automatic Profile Trigger
**WHEN** a new auth user is created via signup
**THEN** the `handle_new_user()` database trigger SHALL create a corresponding record in the `users` table
**AND** SHALL populate it with id, name, and slug derived from the name.
