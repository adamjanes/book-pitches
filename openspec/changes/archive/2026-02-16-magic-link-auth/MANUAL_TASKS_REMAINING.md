# Magic Link Auth - Manual Tasks Remaining

## Status

The magic link authentication implementation is **complete** from a code perspective. Two manual tasks remain:

### Task 4.1: Configure Email Template ⚠️ AWAITING ACTION

**What:** Configure the magic link email template in the Supabase dashboard UI.

**Why:** The default Supabase email template is generic. We need to brand it with Book Pitches styling and warm, parchment-aesthetic copy.

**Instructions:** See `EMAIL_TEMPLATE_INSTRUCTIONS.md` for detailed steps and exact template content.

**Time estimate:** 5-10 minutes

### Task 5.3: End-to-End Testing ⚠️ DEPENDS ON 4.1

**What:** Test the complete authentication flow from login to authenticated redirect.

**Why:** Verify that the email template is correctly configured and the magic link works end-to-end.

**Steps:**
1. Navigate to `/login` in the deployed or local app
2. Enter your email address
3. Click "Send Magic Link"
4. Verify redirect to `/login/check-email` with your email displayed
5. Check your email inbox
6. Verify the email matches the branded template from task 4.1
7. Click the magic link in the email
8. Verify authentication succeeds and you're redirected to the home page
9. Verify you can access protected routes (profile, recording, etc.)
10. Test the resend button on the check-email page

**Time estimate:** 10-15 minutes

## What Was Automated

All code changes are complete:
- ✅ Unified login page (no separate signup)
- ✅ Magic link only (password auth removed)
- ✅ Dedicated `/login/check-email` confirmation page
- ✅ Resend functionality with 60-second cooldown handling
- ✅ Redirect from `/signup` to `/login` for backwards compatibility
- ✅ Auth callback properly configured for magic link PKCE flow
- ✅ All password-related code removed from codebase

## Next Steps for Adam

1. **Complete task 4.1** — Follow `EMAIL_TEMPLATE_INSTRUCTIONS.md` to configure the Supabase email template
2. **Complete task 5.3** — Test the full flow and verify everything works
3. **Mark tasks complete** — Update `tasks.md` to mark `[x]` on tasks 4.1 and 5.3
4. **Run verification** — Execute `/opsx:verify` to confirm implementation matches spec
5. **Archive the change** — Run `/opsx:archive` to sync delta specs back to main specs

## Book Pitches Project Reference

- Supabase project: "Book Pitches" (ID: `acbrvjpggtnptcmqdcbw`)
- Region: us-east-1
- Status: ACTIVE_HEALTHY

## Questions?

If you encounter any issues during manual testing, check:
- Supabase logs via dashboard (Authentication > Logs)
- Browser console for client-side errors
- `/auth/callback/route.ts` for server-side auth errors
