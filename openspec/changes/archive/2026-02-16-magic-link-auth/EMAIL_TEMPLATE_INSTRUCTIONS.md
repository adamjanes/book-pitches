# Magic Link Email Template Configuration

## Task
Configure the magic link email template in Supabase dashboard with Book Pitches branding.

## Steps

1. **Navigate to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select the Book Pitches project

2. **Open Email Templates**
   - In the left sidebar, click **Authentication**
   - Click **Email Templates**
   - Find the **Magic Link** template

3. **Configure Template**

   **Subject Line:**
   ```
   Your Book Pitches sign-in link
   ```

   **Sender Name:**
   ```
   Book Pitches
   ```

   **Email Body:**
   ```html
   <h2>Sign in to Book Pitches</h2>

   <p>Hello!</p>

   <p>Click the link below to sign in to your Book Pitches account:</p>

   <p><a href="{{ .ConfirmationURL }}">Sign in to Book Pitches</a></p>

   <p>Or copy and paste this URL into your browser:</p>
   <p>{{ .ConfirmationURL }}</p>

   <p>This link will expire in 60 minutes.</p>

   <p>If you didn't request this email, you can safely ignore it.</p>

   <p style="margin-top: 30px; color: #666; font-size: 14px;">
   Warmly,<br>
   The Book Pitches Team
   </p>
   ```

4. **Save Changes**
   - Click **Save** to apply the template

## Design Notes

The email copy uses a warm, friendly tone that matches the parchment/beige aesthetic of the Book Pitches platform. The language is clear and instructional without being overly formal.

Key elements:
- Clear subject line indicating it's a sign-in link
- Branded sender name
- Simple, direct copy
- Both clickable link and plain URL for accessibility
- Expiration notice (60 minutes is Supabase default)
- Reassurance for accidental requests
- Warm sign-off matching the app's tone

## Verification

After configuring:
1. Go to `/login` in the app
2. Enter a test email address
3. Check that email inbox
4. Verify the email matches the template above
5. Click the magic link and verify authentication works

## Once Complete

When this configuration is complete, mark task 4.1 as done in `tasks.md` and proceed to task 5.3 (end-to-end testing).
