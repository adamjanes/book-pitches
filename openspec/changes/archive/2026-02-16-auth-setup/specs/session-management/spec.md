# Session Management

## Overview
The application uses cookie-based sessions via @supabase/ssr for SSR-safe authentication. Sessions persist across page navigations and are automatically refreshed when needed.

## Requirements

### Requirement: Browser Client Helper
The application SHALL provide a Supabase client for client components.

#### Scenario: Browser Client Creation
**WHEN** a client component needs to access Supabase
**THEN** it SHALL use `createBrowserClient()` from `src/lib/supabase/client.ts`.

#### Scenario: Cookie-Based Storage
**WHEN** the browser client is created
**THEN** it SHALL use cookie-based session storage.

#### Scenario: Client File Exists
**WHEN** checking for the browser client helper
**THEN** the file `src/lib/supabase/client.ts` SHALL exist and export a working `createBrowserClient()` function.

### Requirement: Server Client Helper
The application SHALL provide a Supabase client for server components and route handlers.

#### Scenario: Server Client Creation
**WHEN** a server component or route handler needs to access Supabase
**THEN** it SHALL use `createServerClient()` from `src/lib/supabase/server.ts`.

#### Scenario: Server-Side Cookie Handling
**WHEN** the server client is created
**THEN** it SHALL read and write auth cookies via Next.js cookies() API.

#### Scenario: Server File Creation
**WHEN** implementing session management
**THEN** the file `src/lib/supabase/server.ts` SHALL be created with a `createServerClient()` export.

### Requirement: PKCE Code Exchange
The application SHALL handle OAuth callback flow via PKCE code exchange.

#### Scenario: Auth Callback Route
**WHEN** the authentication provider redirects to `/auth/callback?code=xxx`
**THEN** a route handler at `/auth/callback/route.ts` SHALL handle the request.

#### Scenario: Exchange Code for Session
**WHEN** the callback route receives a code parameter
**THEN** it SHALL call `supabase.auth.exchangeCodeForSession(code)`
**AND** on success SHALL redirect to `/`.

#### Scenario: Missing Code Parameter
**WHEN** the callback route is accessed without a code parameter
**THEN** it SHALL redirect to `/login` with an error message.

#### Scenario: Exchange Failure
**WHEN** the code exchange fails
**THEN** the route SHALL redirect to `/login` with an error message.

### Requirement: Session Persistence
Sessions SHALL persist across page navigations and browser refreshes.

#### Scenario: Cross-Page Session
**WHEN** a user navigates from one page to another
**THEN** their session SHALL remain active without re-authentication.

#### Scenario: Browser Refresh
**WHEN** a user refreshes the page
**THEN** their session SHALL remain active
**AND** they SHALL NOT be logged out.

#### Scenario: Cookie Lifetime
**WHEN** a session is created
**THEN** the session cookie SHALL persist based on Supabase's default expiration (typically 1 hour with refresh tokens).

### Requirement: Token Refresh
The application SHALL automatically refresh expired access tokens.

#### Scenario: Automatic Refresh
**WHEN** a request is made with an expired access token
**THEN** the Supabase client SHALL automatically refresh it using the refresh token.

#### Scenario: Refresh in Middleware
**WHEN** middleware checks the session
**THEN** it SHALL refresh the token if needed
**AND** SHALL update the session cookie.

### Requirement: Session Expiration Handling
The application SHALL handle expired sessions gracefully.

#### Scenario: Expired Refresh Token
**WHEN** both access and refresh tokens are expired
**THEN** the user SHALL be redirected to `/login`.

#### Scenario: Invalid Session
**WHEN** a session is invalid or corrupted
**THEN** the system SHALL clear the session
**AND** SHALL redirect to `/login` for protected routes.

### Requirement: SSR Compatibility
Session management SHALL work correctly with Next.js server-side rendering.

#### Scenario: Server Component Session Access
**WHEN** a server component checks auth state
**THEN** it SHALL use the server client helper
**AND** SHALL have access to the current session.

#### Scenario: Client Component Session Access
**WHEN** a client component checks auth state
**THEN** it SHALL use the browser client helper
**AND** SHALL have access to the current session.
