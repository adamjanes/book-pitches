# User Logout

## Overview
Authenticated users can log out via a logout button in the navigation. Logout clears the session and redirects to the home page.

## Requirements

### Requirement: Logout Button Visibility
The navigation SHALL display a logout button only when a user is authenticated.

#### Scenario: Show Logout When Authenticated
**WHEN** a user is authenticated
**THEN** a "Logout" button SHALL be visible in the navigation.

#### Scenario: Hide Logout When Unauthenticated
**WHEN** no user is authenticated
**THEN** the "Logout" button SHALL NOT be visible in the navigation.

### Requirement: Logout Action
The logout button SHALL terminate the user's session when clicked.

#### Scenario: Successful Logout
**WHEN** a user clicks the "Logout" button
**THEN** the system SHALL call `supabase.auth.signOut()`
**AND** SHALL clear all session cookies
**AND** SHALL redirect the user to `/` (home page).

#### Scenario: Logout Error Handling
**WHEN** the logout operation fails
**THEN** the system SHALL still clear local session state
**AND** SHALL redirect to `/`.

### Requirement: Session Cleanup
The logout process SHALL completely clear the user's session.

#### Scenario: Clear Session Cookies
**WHEN** a user logs out
**THEN** all Supabase auth cookies SHALL be removed.

#### Scenario: Clear Client State
**WHEN** a user logs out
**THEN** the client-side auth state SHALL be cleared
**AND** the navigation SHALL update to show login/signup options instead of logout.

### Requirement: Post-Logout Redirect
After logout, the user SHALL be redirected to a public page.

#### Scenario: Redirect to Home
**WHEN** a user completes logout
**THEN** the system SHALL redirect to `/` (home page).
