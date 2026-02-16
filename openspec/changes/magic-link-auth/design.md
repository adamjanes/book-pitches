## Context

The app currently supports two auth modes — email/password and magic link — toggled via a button in LoginForm. There's a separate signup page. The magic link flow already works end-to-end (signInWithOtp → email sent → /auth/callback exchanges code for session), but after requesting the link, a basic inline "check your email" state shows within the same component. There's no dedicated confirmation screen and no resend capability.

The Supabase email template is the default generic one — no Book Pitches branding.

## Goals / Non-Goals

**Goals:**
- Remove password auth — magic link is the only sign-in method
- Merge login and signup into a single unified page at `/login`
- Replace the inline magic-link-sent state with a dedicated `/login/check-email` route that persists across page refreshes
- Add a resend magic link button on the check-email screen
- Customize the Supabase magic link email (subject, body, sender name)

**Non-Goals:**
- OAuth providers (Google, GitHub) — not in V1
- Custom SMTP setup — using Supabase's built-in email service
- Rate limiting on resend — Supabase handles this natively (60s cooldown)
- Email verification flow — magic link inherently verifies the email

## Decisions

### 1. Unified `/login` page replaces both `/login` and `/signup`

**Decision**: Single page with one email input. No separate signup route.

**Rationale**: With magic link, there's no password to set, so signup and login are identical flows. Supabase's `signInWithOtp` automatically creates the user on first use. A separate signup page adds confusion. The `/signup` route will redirect to `/login` for backwards compatibility.

**Alternative considered**: Keep separate pages with different copy ("Sign up" vs "Sign in"). Rejected — unnecessary complexity for identical functionality.

### 2. Dedicated `/login/check-email` route instead of inline state

**Decision**: After submitting email, redirect to `/login/check-email?email=<encoded>` rather than toggling component state.

**Rationale**: A dedicated route survives page refreshes, can be bookmarked/shared for support, and keeps the login form component simple. The email address is passed as a query param so the check-email page can display it and enable resend.

**Alternative considered**: Keep as inline component state (current approach). Rejected — state is lost on refresh, which is confusing if the user navigates away and back.

### 3. Resend uses the same `signInWithOtp` call

**Decision**: The resend button calls `signInWithOtp` again with the same email. Supabase enforces a 60-second cooldown between OTP sends.

**Rationale**: No additional API needed. Supabase returns an error if called too soon, which we display as "Please wait before requesting another link."

### 4. Email template customization via Supabase dashboard

**Decision**: Configure the magic link email template in the Supabase dashboard (Auth > Email Templates), not via code.

**Rationale**: Supabase doesn't expose email template configuration via API or MCP. This is a one-time manual configuration. We'll document the exact template content in the tasks.

### 5. Remove signup page, redirect for compatibility

**Decision**: Delete the signup page components. Add a redirect from `/signup` to `/login` so any existing links or bookmarks still work.

**Rationale**: Clean removal avoids dead code. Redirect prevents 404s.

## Risks / Trade-offs

- **Existing password-only users can't sign in with password** → They use magic link instead. No migration needed — Supabase resolves by email address. Low risk since this is a new app with minimal users.
- **Email deliverability** → Magic link depends on emails arriving. Supabase's built-in email is fine for low-volume. If deliverability becomes an issue, custom SMTP can be added later.
- **60-second resend cooldown** → Users might click resend immediately and see an error. Mitigated by showing the cooldown in the UI copy ("You can resend in 60 seconds").
