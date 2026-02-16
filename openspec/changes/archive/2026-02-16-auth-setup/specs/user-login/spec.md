# User Login

## Overview
Users can authenticate via email/password or magic link. The login page supports both methods and redirects users back to their intended destination after successful authentication.

## Requirements

### Requirement: Login Page Route
The application SHALL provide a login page at `/login`.

#### Scenario: Access Login Page
**WHEN** an unauthenticated user navigates to `/login`
**THEN** the login form SHALL be displayed with fields for email and password.

#### Scenario: Redirect Authenticated Users
**WHEN** an authenticated user navigates to `/login`
**THEN** the user SHALL be redirected to `/` (home page).

### Requirement: Password Login
The login page SHALL support authentication via email and password.

#### Scenario: Successful Password Login
**WHEN** a user submits valid email and password credentials
**THEN** the system SHALL call `supabase.auth.signInWithPassword()`
**AND** on success SHALL redirect to `/` or the original requested page.

#### Scenario: Invalid Credentials
**WHEN** a user submits incorrect email or password
**THEN** the system SHALL display an error message indicating invalid credentials.

#### Scenario: Network Error
**WHEN** the login request fails due to network issues
**THEN** the system SHALL display a user-friendly error message.

### Requirement: Magic Link Login
The login page SHALL provide a passwordless login option via magic link.

#### Scenario: Magic Link Option Visibility
**WHEN** the login page is displayed
**THEN** a "Sign in without password" link SHALL be visible.

#### Scenario: Send Magic Link
**WHEN** a user clicks "Sign in without password" and enters their email
**THEN** the system SHALL call `supabase.auth.signInWithOtp()` with their email address
**AND** SHALL display a success message instructing them to check their email.

#### Scenario: Magic Link Sent Error
**WHEN** sending the magic link fails
**THEN** the system SHALL display an error message.

### Requirement: Redirect After Login
The login flow SHALL support redirecting users to their originally requested page.

#### Scenario: Redirect to Original Page
**WHEN** a user is redirected to `/login?redirectTo=/record`
**THEN** after successful login the user SHALL be redirected to `/record`.

#### Scenario: Default Redirect
**WHEN** a user logs in without a `redirectTo` parameter
**THEN** after successful login the user SHALL be redirected to `/` (home page).

### Requirement: Form Validation
The login form SHALL validate input before submission.

#### Scenario: Email Format Validation
**WHEN** the user enters an email address
**THEN** the form SHALL validate that it is properly formatted.

#### Scenario: Required Fields
**WHEN** the user submits the form
**THEN** both email and password fields SHALL be required for password login.

#### Scenario: Display Validation Errors
**WHEN** validation fails
**THEN** the form SHALL display specific error messages for each invalid field.
