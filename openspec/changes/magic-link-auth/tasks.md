## 1. Unified Login Page

- [x] 1.1 Rewrite `LoginForm.tsx` to remove password mode — single email input + "Send Magic Link" button, calls `signInWithOtp`, redirects to `/login/check-email?email=<encoded>`
- [x] 1.2 Update `/login/page.tsx` heading and copy to reflect unified auth ("Sign in or create an account")
- [x] 1.3 Remove the signup link from the login page

## 2. Check Your Email Screen

- [x] 2.1 Create `/login/check-email/page.tsx` — reads `email` query param, displays confirmation message with email address, instructions, and resend button
- [x] 2.2 Implement resend logic — calls `signInWithOtp` again, shows success/error feedback, handles 60-second cooldown error from Supabase
- [x] 2.3 Redirect to `/login` if no `email` query param is present

## 3. Remove Signup Page

- [x] 3.1 Delete `src/app/(auth)/signup/` directory (page.tsx + SignupForm.tsx)
- [ ] 3.2 Add redirect from `/signup` to `/login` (Next.js redirect in `next.config.ts`)

## 4. Supabase Email Template

- [ ] 4.1 Configure magic link email template in Supabase dashboard — subject: "Your Book Pitches sign-in link", sender name: "Book Pitches", branded body copy matching parchment/warm tone

## 5. Cleanup

- [ ] 5.1 Remove unused password-related types, state, and imports from auth components
- [ ] 5.2 Verify auth callback (`/auth/callback/route.ts`) still works correctly with magic-link-only flow
- [ ] 5.3 Test full flow: enter email → check-email screen → click link in email → authenticated and redirected
