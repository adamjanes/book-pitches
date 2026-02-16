# Auth Setup Tasks

## 1. Supabase Client Helpers
- [x] 1.1. Verify existing browser client at `src/lib/supabase/client.ts` works correctly with cookie-based storage
- [x] 1.2. Create server client helper at `src/lib/supabase/server.ts` with `createServerClient()` that uses Next.js `cookies()` API
- [x] 1.3. Test both clients can read/write session cookies correctly

## 2. Auth Callback
- [x] 2.1. Create `/app/auth/callback/route.ts` route handler
- [x] 2.2. Implement PKCE code exchange via `supabase.auth.exchangeCodeForSession()`
- [x] 2.3. Handle success: redirect to `/` or `redirectTo` param if present
- [x] 2.4. Handle errors: redirect to `/login` with error message
- [x] 2.5. Handle missing code: redirect to `/login`

## 3. Signup Page
- [x] 3.1. Create `/app/(auth)/signup/page.tsx` in (auth) route group
- [x] 3.2. Build signup form with name, email, password fields
- [x] 3.3. Implement client-side validation (email format, password min 6 chars, name required)
- [x] 3.4. Call `supabase.auth.signUp()` with email, password, and `user_metadata: { name }`
- [x] 3.5. Handle success: redirect to `/`
- [x] 3.6. Handle errors: display error messages (email taken, weak password, network errors)
- [x] 3.7. Redirect authenticated users accessing `/signup` to `/`

## 4. Login Page
- [x] 4.1. Create `/app/(auth)/login/page.tsx` in (auth) route group
- [x] 4.2. Build login form with email and password fields
- [x] 4.3. Implement password login via `supabase.auth.signInWithPassword()`
- [x] 4.4. Add "Sign in without password" magic link option
- [x] 4.5. Implement magic link flow via `supabase.auth.signInWithOtp()`
- [x] 4.6. Handle `redirectTo` query param: redirect to original page after login or default to `/`
- [x] 4.7. Handle errors: display error messages (invalid credentials, network errors)
- [x] 4.8. Redirect authenticated users accessing `/login` to `/`

## 5. Middleware
- [x] 5.1. Create `middleware.ts` at project root
- [x] 5.2. Configure matcher to exclude static files, `_next/*`, and `favicon.ico`
- [x] 5.3. Check session on every request using server client
- [x] 5.4. Refresh auth token if needed
- [x] 5.5. Protect `/record/*` routes: redirect unauthenticated users to `/login?redirectTo={path}`
- [x] 5.6. Protect `/settings/*` routes: redirect unauthenticated users to `/login?redirectTo={path}`
- [x] 5.7. Preserve query parameters in redirectTo
- [x] 5.8. Allow authenticated users to access protected routes

## 6. Navigation
- [x] 6.1. Update navigation component to fetch current user session
- [x] 6.2. Show "Login" and "Signup" links when unauthenticated
- [x] 6.3. Show "Logout" button when authenticated
- [x] 6.4. Implement logout action: call `supabase.auth.signOut()`, clear cookies, redirect to `/`
- [x] 6.5. Style navigation based on auth state

## 7. Verify
- [ ] 7.1. Test signup flow: create account, verify profile created in database
- [ ] 7.2. Test password login: sign in with email/password, verify session persists
- [ ] 7.3. Test magic link login: request magic link, verify email sent (check logs or test email)
- [ ] 7.4. Test logout: sign out, verify session cleared and redirected to home
- [ ] 7.5. Test protected routes: access `/record` without auth, verify redirect to login
- [ ] 7.6. Test login redirect: login after being redirected, verify sent to original page
- [ ] 7.7. Test session persistence: refresh page, navigate between pages, verify session remains active
- [ ] 7.8. Test expired session handling: verify graceful redirect to login (manual token expiry test if possible)
