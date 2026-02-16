# Protected Routes

## Overview
Certain routes require authentication. Next.js middleware intercepts requests to protected routes and redirects unauthenticated users to the login page.

## Requirements

### Requirement: Middleware Implementation
The application SHALL implement Next.js middleware to protect authenticated-only routes.

#### Scenario: Middleware File Location
**WHEN** the application starts
**THEN** a `middleware.ts` file SHALL exist at the project root.

#### Scenario: Session Check on Every Request
**WHEN** middleware processes a request
**THEN** it SHALL check for a valid session
**AND** SHALL refresh the auth token if needed.

### Requirement: Protected Route Patterns
The middleware SHALL protect specific route patterns from unauthenticated access.

#### Scenario: Protect Record Routes
**WHEN** a request is made to any route matching `/record/*`
**THEN** the middleware SHALL require authentication.

#### Scenario: Protect Settings Routes
**WHEN** a request is made to any route matching `/settings/*`
**THEN** the middleware SHALL require authentication.

#### Scenario: Allow Public Routes
**WHEN** a request is made to a route not matching protected patterns
**THEN** the middleware SHALL allow the request without authentication.

### Requirement: Unauthenticated Access Handling
The middleware SHALL redirect unauthenticated users attempting to access protected routes.

#### Scenario: Redirect to Login with Original Path
**WHEN** an unauthenticated user requests a protected route like `/record/new`
**THEN** the middleware SHALL redirect to `/login?redirectTo=/record/new`.

#### Scenario: Preserve Query Parameters
**WHEN** an unauthenticated user requests `/record/new?book=123`
**THEN** the middleware SHALL redirect to `/login?redirectTo=/record/new?book=123`.

### Requirement: Post-Login Redirect
After successful login, the user SHALL be redirected back to their original destination.

#### Scenario: Redirect to Original Protected Route
**WHEN** a user logs in after being redirected from `/record/new`
**THEN** the system SHALL redirect them to `/record/new`.

#### Scenario: No Redirect Parameter
**WHEN** a user logs in without a `redirectTo` parameter
**THEN** the system SHALL redirect to `/` (home page).

### Requirement: Middleware Matcher Configuration
The middleware SHALL exclude static assets and Next.js internal routes.

#### Scenario: Exclude Static Files
**WHEN** a request is made to static files
**THEN** the middleware SHALL NOT run.

#### Scenario: Exclude Next.js Internals
**WHEN** a request is made to `_next/*` paths
**THEN** the middleware SHALL NOT run.

#### Scenario: Exclude Favicon
**WHEN** a request is made to `/favicon.ico`
**THEN** the middleware SHALL NOT run.

### Requirement: Authenticated Access
The middleware SHALL allow authenticated users to access protected routes.

#### Scenario: Valid Session Access
**WHEN** an authenticated user requests a protected route
**THEN** the middleware SHALL allow the request to proceed
**AND** SHALL NOT redirect to login.
