# Auth Setup

## Why
V1 requires users to sign up and log in to record pitches. This establishes the identity layer and protects recording routes while keeping browsing public.

## What Changes
- Add Supabase Auth email/password + magic link flow
- Create `(auth)` route group with login and signup pages
- Protect pitch recording routes with middleware auth checks
- Create `users` table record on signup (name, email, avatar_url)
- Implement session management via `@supabase/ssr` SSR helpers
- Add logout functionality and user profile menu

## Capabilities
### New Capabilities
- `user-signup`: Email/password signup with user profile creation
- `user-login`: Email/password and magic link login
- `user-logout`: Session termination
- `protected-routes`: Middleware guards for recording and user-only endpoints
- `session-management`: SSR-safe session state via @supabase/ssr

### Modified Capabilities
(none)

## Impact
- **New tables:** `users` (id, email, user_metadata, created_at)
- **New pages:** `/auth/login`, `/auth/signup`, `/auth/callback`
- **New middleware:** Route protection for `/pitch/record`, `/user/*`
- **Dependencies:** `@supabase/ssr` (already in package.json)
- **Environment:** Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Breaking changes:** None — public routes unaffected
