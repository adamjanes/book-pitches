## Why

The current auth flow supports both email/password and magic link, but treats magic link as a secondary option. After requesting a magic link, the user gets no feedback — no "check your email" screen, just a redirect back to the home page. This is confusing and feels broken. We want to simplify auth to magic-link-only (no passwords) and add proper post-submission UX. We also want to customize the Supabase magic link email to match the Book Pitches brand instead of using the generic default.

## What Changes

- **Remove password-based auth entirely** — login and signup forms become email-only (enter email → receive magic link). **BREAKING**: existing password-based accounts will need to use magic link going forward.
- **Add "Check your email" confirmation screen** — after submitting email, show a branded screen confirming the magic link was sent, with instructions and a resend option.
- **Customize Supabase magic link email** — update the email template in Supabase dashboard config (subject line, body copy, sender name) to match Book Pitches branding.
- **Merge login and signup into a single flow** — with magic link, there's no distinction between login and signup. One page: enter email, get link. Supabase handles account creation automatically on first use.

## Capabilities

### New Capabilities
- `magic-link-auth`: Passwordless authentication flow — single email input, "check your email" confirmation screen, custom email template, and unified login/signup experience.

### Modified Capabilities
None — existing specs (book-browsing, category-browsing, data-seeding, user-profiles) are not affected by auth method changes.

## Impact

- **Pages affected**: `/login`, `/signup` — merged into single `/login` page. New `/login/check-email` route added.
- **Components removed**: `SignupForm.tsx` password fields, password toggle in `LoginForm.tsx`
- **Auth callback**: `/auth/callback/route.ts` — unchanged (already handles magic link codes)
- **Middleware**: `middleware.ts` — unchanged (already protects routes and refreshes sessions)
- **Supabase config**: Email template customization via Supabase dashboard (not code)
- **No database changes**
