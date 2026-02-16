# Auth Setup Design

## Context

The book-pitches app is pivoting to a voice-first platform where users record ~90-second audio elevator pitches for books. V1 requires authentication so users can record and manage their own pitches while browsing remains public. The database schema (from the new-schema change) already defines a `users` table (id referencing auth.users, name, email, slug, avatar_url, bio, location, created_at) with RLS policies for public SELECT and owner-only UPDATE. Supabase Auth is the identity provider. The `@supabase/ssr` package is already in package.json.

## Goals / Non-Goals

**Goals:**
- Email/password signup and login
- Magic link (passwordless) login as alternative
- Automatic user profile creation on signup
- Route protection for pitch recording and profile editing
- SSR-safe session management that works with Next.js App Router
- Logout functionality

**Non-Goals:**
- OAuth providers (Google, GitHub, etc.) — V2
- Email verification flow beyond Supabase defaults
- Password reset UI — V2 (Supabase handles the basics)
- Admin roles or permission tiers
- Rate limiting on auth endpoints (Supabase handles this)

## Decisions

### Decision 1: Email/password + magic link, no OAuth for V1

**Choice:** Support email/password signup and magic link login. No OAuth providers.

**Why:** Email/password is the simplest auth flow to implement and test. Magic link adds a passwordless option with minimal extra work (Supabase supports it natively). OAuth requires configuring provider credentials, handling redirect URIs across environments, and more UI states — unnecessary complexity for V1 where the user base is small.

**Alternative considered:** OAuth-first (Google). Better UX for signups, but adds provider configuration, consent screen setup, and environment-specific redirect URIs. Can add later as an enhancement.

### Decision 2: @supabase/ssr with Next.js middleware for session management

**Choice:** Use `@supabase/ssr` package to create Supabase clients that work in Server Components, Route Handlers, Server Actions, and Middleware. Session tokens stored in cookies (not localStorage).

**Why:** Next.js App Router requires cookie-based sessions for server-side rendering. The `@supabase/ssr` package provides `createServerClient` and `createBrowserClient` helpers that handle cookie management correctly across all Next.js contexts. localStorage-based auth breaks SSR — the server can't read localStorage, so protected pages would flash or fail on initial load.

**Alternative considered:** Client-only auth with `@supabase/supabase-js`. Simpler setup but breaks SSR — pages requiring auth data would need client-side hydration, causing layout shifts and flash of unauthenticated content.

### Decision 3: Database trigger for user profile creation on signup

**Choice:** Create a PostgreSQL trigger on `auth.users` that automatically inserts a row into `public.users` when a new auth user is created.

**Why:** A database trigger guarantees the user profile record exists the moment signup completes, regardless of whether the application code runs correctly. This eliminates race conditions where the user is authenticated but their profile doesn't exist yet. It also works for any signup method (email, magic link, future OAuth).

**Alternative considered:** Application-code user creation (call Supabase insert after signup). Simpler to understand but fragile — if the insert fails or the user navigates away before it completes, you have an auth user with no profile. Requires defensive coding everywhere that reads user profiles.

### Decision 4: Next.js middleware for route protection

**Choice:** Use a single Next.js `middleware.ts` file that refreshes the session on every request and redirects unauthenticated users away from protected routes (`/record/*`, `/settings/*`).

**Why:** Middleware runs before the page renders, so unauthenticated users never see protected content (no flash). It's a single place to define all route protection rules. The session refresh in middleware also keeps tokens fresh, preventing unexpected logouts.

**Protected routes:** `/record/*` (pitch recording), `/settings/*` (profile editing)
**Public routes:** Everything else — `/`, `/discover`, `/u/*`, `/book/*`

**Alternative considered:** Per-route auth checks in each Server Component. More granular but repetitive, and the user briefly sees the page layout before being redirected.

### Decision 5: PKCE flow for auth callbacks

**Choice:** Use Supabase's PKCE (Proof Key for Code Exchange) flow with an `/auth/callback` route handler that exchanges the code for a session.

**Why:** PKCE is the recommended auth flow for server-rendered apps. Magic link emails and OAuth (future) redirect to `/auth/callback` with a code parameter. The route handler exchanges this code for a session cookie. This is more secure than the implicit flow and works correctly with SSR.

**Implementation:** `/auth/callback/route.ts` — a Route Handler that calls `supabase.auth.exchangeCodeForSession(code)`.

### Decision 6: Auth route group structure

**Choice:** Create an `(auth)` route group with `/login` and `/signup` pages. These pages are public but redirect to `/` if the user is already authenticated.

**Why:** Route groups keep auth-related pages organized without affecting the URL structure. The redirect prevents authenticated users from seeing login/signup forms. Pages are simple forms with Supabase client calls — no complex state management needed.

**Routes:**
- `/login` — email/password form + magic link option
- `/signup` — email/password form with name field
- `/auth/callback` — PKCE code exchange (route handler, not a page)

## Risks / Trade-offs

- **[Risk] Email deliverability for magic links** → Supabase handles email sending via their infrastructure. For V1 scale (tens of users) this is fine. At scale, configure a custom SMTP provider.
- **[Risk] Cookie size limits** → Supabase stores JWT in cookies. JWTs with custom claims can exceed cookie size limits (4KB). Mitigation: keep custom claims minimal — the users table stores profile data, not the JWT.
- **[Trade-off] No email verification flow** → Supabase sends a confirmation email by default, but we don't enforce it in the UI. Users can start recording immediately. Acceptable for V1 — can add enforcement later.
- **[Trade-off] Database trigger vs application code** → Trigger is harder to debug and test than application code. Acceptable trade-off for the reliability guarantee.
- **[Risk] Middleware on every request** → Middleware runs on all routes, including static assets. Mitigation: use the `matcher` config to exclude static files and API routes that don't need auth.

## Open Questions

- Should the signup form collect name and location immediately, or just email/password with a separate onboarding step? **Recommendation: collect name on signup, location on profile edit later.**
- Should magic link be the primary login method (with password as fallback) or the other way around? **Recommendation: password primary, magic link as "sign in without password" link below.**
