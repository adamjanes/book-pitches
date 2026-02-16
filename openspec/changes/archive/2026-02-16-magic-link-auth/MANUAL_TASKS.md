# Manual Tasks for Magic Link Auth

## Task 4.1: Configure Supabase Email Template

This requires accessing the Supabase dashboard UI.

### Steps:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the **Book Pitches** project
3. Navigate to **Authentication** → **Email Templates** in the left sidebar
4. Find the **Magic Link** template
5. Configure the following:

#### Sender Name:
```
Book Pitches
```

#### Subject Line:
```
Your Book Pitches sign-in link
```

#### Email Body (suggested):
```html
<h2>Welcome to Book Pitches</h2>

<p>Click the button below to sign in to your account:</p>

<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #8B6F47; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
  Sign in to Book Pitches
</a>

<p style="color: #666; font-size: 14px; margin-top: 24px;">
  This link expires in 1 hour. If you didn't request this email, you can safely ignore it.
</p>

<p style="color: #999; font-size: 12px; margin-top: 16px;">
  Or copy and paste this link into your browser:<br>
  <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 3px; font-size: 11px;">{{ .ConfirmationURL }}</code>
</p>
```

**Note:** The template uses Go template syntax. `{{ .ConfirmationURL }}` will be replaced with the actual magic link by Supabase.

#### Design Notes:
- The `#8B6F47` color matches the parchment/warm tone of the app
- Keep the copy warm and friendly to match the overall aesthetic
- The fallback text link ensures accessibility if HTML rendering fails

6. Click **Save** to apply the template

### Verification:
After saving, trigger a test magic link by:
1. Going to `/login` in the app
2. Entering an email address
3. Checking the email to confirm it uses the new template

---

## Task 5.3: Test Full Magic Link Flow

### Test Scenario 1: New User Sign-up
1. Open the app in an incognito window
2. Navigate to `/login`
3. Enter a **new email address** (one that hasn't been used before)
4. Click "Send Magic Link"
5. **Expected:** Redirected to `/login/check-email?email=<encoded-email>`
6. Check email inbox
7. **Expected:** Email arrives with custom Book Pitches branding
8. Click the magic link in the email
9. **Expected:** Redirected to `/` and authenticated (check for user session)

### Test Scenario 2: Existing User Sign-in
1. Repeat the flow with an email that already has an account
2. **Expected:** Same flow as new user (magic link works for both)

### Test Scenario 3: Resend Magic Link
1. Go to `/login`, submit email
2. On the `/login/check-email` page, click "Resend magic link"
3. **Expected:** Success message appears
4. Immediately click "Resend" again
5. **Expected:** Error message about 60-second cooldown

### Test Scenario 4: Invalid Email
1. Go to `/login`
2. Enter an invalid email (e.g., "notanemail")
3. Click "Send Magic Link"
4. **Expected:** Validation error appears

### Test Scenario 5: Empty Email
1. Go to `/login`
2. Click "Send Magic Link" without entering an email
3. **Expected:** "Email is required" error appears

### Test Scenario 6: Direct Navigation to Check-Email
1. Navigate directly to `/login/check-email` (without email param)
2. **Expected:** Redirected to `/login`

### Test Scenario 7: Old Signup Route
1. Navigate to `/signup`
2. **Expected:** Redirected to `/login`

### Test Scenario 8: Expired Magic Link
1. Request a magic link
2. Wait for the link to expire (default: 1 hour)
3. Click the expired link
4. **Expected:** Redirected to `/login` with an error message

### Test Scenario 9: RedirectTo Parameter
1. Navigate to `/login?redirectTo=/books`
2. Submit email and complete magic link flow
3. **Expected:** After authentication, redirected to `/books` instead of `/`

---

## Completion Checklist

- [ ] Task 4.1: Supabase email template configured and verified
- [ ] Task 5.3: All 9 test scenarios passed

Once complete, run:
```bash
cd /Users/adamjanes/code/projects/book-pitches/app
git add .
git commit -m "Complete magic-link-auth change"
```

Then archive the change:
```bash
# In Claude Code
/opsx:archive
```
