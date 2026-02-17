# Profile Page Enhancements — Tasks

> **PRD:** [PRD.md](./PRD.md)
> **Status:** 0/11 tasks complete

---

## 1. Server Layer: Queries & Actions

- [ ] **1.1 Add getUserTopCategories query function**
  `src/lib/supabase/queries.ts` — new export
  Add `getUserTopCategories(userId: string)` query that joins book_categories → categories → books → pitches, filters by user_id, groups by category name, orders by count DESC, limits to 3. Returns `{ name: string; count: number }[]`.

- [ ] **1.2 Create updateProfile Server Action**
  `src/app/actions/users.ts` — new file
  Create Server Action `updateProfile({ name, bio, location })` that: (1) gets current session via `createClient().auth.getUser()`, (2) validates inputs (name 1-100 chars, bio optional max 500, location optional max 100), (3) updates `users` table WHERE id = session.user.id (RLS enforces owner-only), (4) revalidates `/users/[slug]`, (5) returns `{ success: boolean; error?: string }`.

## 2. Component Layer: ProfileHeader with Edit Mode

- [ ] **2.1 Create ProfileHeader client component**
  `src/components/ProfileHeader.tsx` — new file
  Client component accepting `{ user, isOwner, pitchCount, avgRating, topCategories }`. Renders avatar (initial letter circle), name, bio, location, stats (pitch count, avg rating, top 3 categories as badges). If `isOwner` is true, shows "Edit Profile" button.

- [ ] **2.2 Implement edit mode toggle in ProfileHeader**
  `src/components/ProfileHeader.tsx` — modify
  Add state `isEditing` (boolean). When "Edit Profile" clicked, toggle `isEditing` to true. When true, replace static text with input fields for name (text input), bio (textarea), location (text input). Add "Save" and "Cancel" buttons.

- [ ] **2.3 Wire up Save button to updateProfile action**
  `src/components/ProfileHeader.tsx` — modify
  On "Save" click, call `updateProfile({ name, bio, location })` with current form values. On success, set `isEditing` to false and show success toast. On error, display error message below form. Use `useTransition` for pending state.

## 3. Component Layer: Audio Player in ReviewCard

- [ ] **3.1 Verify audio player works on profile page**
  `src/components/ReviewCard.tsx` — verification only
  Audio player already implemented in pitch-creation-flow. Verify it renders correctly on profile page.

  VERIFY:
  1. Navigate to a user profile with pitches that have audio_url (seed test data if needed)
  2. Verify audio player renders below pitch text with parchment styling
  3. Click play button, verify audio plays
  4. Screenshot: `verification/profile-page-3.1.png`

## 4. Page Layer: Enhanced Profile Page

- [ ] **4.1 Add owner detection to profile page**
  `src/app/users/[slug]/page.tsx` — modify
  In the Server Component, call `createClient().auth.getUser()` to get session. Compare `session?.user?.id` with `user.id` from query result. Set `isOwner = (session?.user?.id === user.id)`. Pass `isOwner` to ProfileHeader.

- [ ] **4.2 Fetch top categories in profile page**
  `src/app/users/[slug]/page.tsx` — modify
  After fetching user and pitches, call `getUserTopCategories(user.id)` to get top 3 categories. Pass `topCategories` to ProfileHeader.

- [ ] **4.3 Replace profile header with ProfileHeader component**
  `src/app/users/[slug]/page.tsx` — modify
  Remove the existing header JSX (avatar, name, bio, stats). Replace with `<ProfileHeader user={user} isOwner={isOwner} pitchCount={pitches.length} avgRating={avgRating} topCategories={topCategories} />`.

- [ ] **4.4 Enhance generateMetadata for social sharing**
  `src/app/users/[slug]/page.tsx` — modify
  In `generateMetadata`, add openGraph: { title: `${user.name} | Book Pitches`, description: user.bio?.substring(0, 200) || `Check out ${user.name}'s book pitches`, images: [user.avatar_url || '/default-og-image.png'] }. Also add twitter: { card: 'summary', title: ..., description: ..., images: ... }.

  VERIFY:
  1. Run dev server, navigate to `/users/[slug]`
  2. View page source, verify og:title, og:description, og:image meta tags exist
  3. Screenshot: `verification/profile-page-4.4.png`

## 5. Integration & E2E Verification

- [ ] **5.1 Verify edit mode (owner only)**
  Playwright test
  VERIFY:
  1. Create test user via Supabase Auth API
  2. Log in as that user
  3. Navigate to `/users/{test-user-slug}`
  4. Verify "Edit Profile" button is visible
  5. Click "Edit Profile", verify form appears with name, bio, location inputs
  6. Update bio to "Test bio update", click "Save"
  7. Wait for page revalidation, verify bio displays "Test bio update"
  8. Screenshot: `verification/profile-page-5.1.png`

- [ ] **5.2 Verify top categories display**
  Playwright test
  VERIFY:
  1. Navigate to `/users/[slug]` with pitches in multiple categories
  2. Verify top 3 category badges render in profile header
  3. Verify badge text format is "{Category Name} ({count})"
  4. Screenshot: `verification/profile-page-5.2.png`
