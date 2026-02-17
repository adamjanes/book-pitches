# Profile Page Enhancements — PRD

> **Feature:** profile-page
> **Status:** draft
> **Generated:** 2026-02-17
> **Project:** Book Pitches (Next.js 16 / Supabase / Tailwind 4)

---

## 1. Problem

A basic user profile page exists at `/users/[slug]` showing avatar (initial letter), name, bio, pitch count, average rating, and a list of pitches via ReviewCard. However, it lacks key functionality: profile owners cannot edit their profiles, pitches don't include audio playback, there are no top category stats to showcase user reading preferences, and SEO metadata is minimal. Users need a fully-featured, shareable profile page that showcases their personal book list with rich metadata and interactive elements.

## 2. Solution

Enhance the existing profile page with: (1) inline edit mode for profile owners to update name, bio, and location without leaving the page, (2) audio playback on pitch cards so visitors can listen to voice pitches, (3) top 3 category stats to highlight the user's reading interests, and (4) improved SEO metadata (og:title, og:description, og:image) for social sharing. The page remains a Server Component with data fetched server-side, but edit mode and audio player are client components for interactivity.

## 3. Capabilities

| Capability | Type | Description |
|------------|------|-------------|
| `edit-profile` | New | Toggle inline edit mode for profile owner; update name, bio, location via Server Action |
| `play-pitch-audio` | New | HTML5 audio player on pitch cards with play/pause, duration display |
| `fetch-top-categories` | New | Query top 3 categories for user's pitched books, display as stat badges |
| `generate-social-metadata` | New | Dynamic og:title, og:description, og:image for each profile page |
| `detect-profile-owner` | New | Server-side check if logged-in user is the profile owner (show edit button) |
| `render-pitch-audio` | Modified | ReviewCard already includes audio player (implemented in pitch-creation-flow) — verify it works on profile page |

## 4. Scope

**In scope:**
- Inline edit mode for profile header (name, bio, location) — visible only to profile owner
- Server Action `updateProfile` for persisting edits (RLS enforces owner-only updates)
- Audio player on ReviewCard component (HTML5 `<audio>` element, styled with parchment design — already implemented in pitch-creation-flow, verify it works on profile page)
- Top 3 categories query and display as stat badges in profile header
- Enhanced `generateMetadata` with og:title, og:description, og:image for social sharing
- Owner detection via server-side session check (`auth.uid()` vs `user.id`)

**Out of scope:**
- Avatar upload (initial-letter avatars only; file/URL upload is V2)
- Slug editing (slug is auto-generated from name, not user-editable in V1)
- Profile analytics (view counts, audio play counts) — V2
- Custom audio player UI (waveform, seek bar, speed control) — V2
- Following/social features between users — V2
- Pitch ordering or pinning by user — V2

## 5. Technical Design

### Architecture

The `/users/[slug]` page remains a Server Component. Enhancement architecture:
1. **Server Component** fetches user + pitches + top categories in parallel via `getUserBySlug` and new `getUserTopCategories` query
2. **Owner detection** happens server-side by comparing session user ID with profile user ID
3. **ProfileHeader** client component handles edit mode toggle and form submission via Server Action
4. **ReviewCard** enhanced with audio player (client component or use client directive for audio element)
5. **SEO metadata** generated in `generateMetadata` function with user-specific og:tags

### Key Decisions

| Decision | Choice | Why | Alternative Considered |
|----------|--------|-----|------------------------|
| Edit UI pattern | Inline edit mode (toggle header to form) | Keeps user on profile page; edits are contextual; simple 3-field form | Separate `/settings/profile` page — unnecessary for 3 fields |
| Audio player | Use existing ReviewCard audio player from pitch-creation-flow | Already implemented with parchment styling; consistent UX across app | Custom audio player — unnecessary duplication |
| Top categories query | SQL aggregation at request time | Fast at V1 scale (tens of pitches); no denormalization complexity | Materialized view or cached stats — premature optimization |
| Owner detection | Server-side session check in Server Component | Secure; no client-side auth checks; works with SSR | Client-side check with useEffect — slower, insecure |

### Data Model

**No schema changes required.** Existing tables support all functionality:
- `users` table has `name`, `bio`, `location`, `slug` fields
- `pitches` table has `audio_url` field
- `book_categories` join table enables top category aggregation
- RLS policies already allow owner-only UPDATE on `users` table

**New query: `getUserTopCategories`**
```sql
SELECT c.name, COUNT(*) as count
FROM book_categories bc
JOIN categories c ON bc.category_id = c.id
JOIN books b ON bc.book_id = b.id
JOIN pitches p ON p.book_id = b.id
WHERE p.user_id = $1
GROUP BY c.id, c.name
ORDER BY count DESC
LIMIT 3
```

### Key Interfaces

```typescript
// Server Action for profile updates (name, bio, location only — no avatar)
export async function updateProfile(data: {
  name: string
  bio: string | null
  location: string | null
}): Promise<{ success: boolean; error?: string }>

// New query function
export async function getUserTopCategories(userId: string): Promise<{
  name: string
  count: number
}[]>

// Enhanced ReviewCard props
interface ReviewCardProps {
  review: Pitch & { user?: User; book?: Book }
  showBook?: boolean
  showAudio?: boolean  // NEW: control audio player visibility
}

// ProfileHeader client component
interface ProfileHeaderProps {
  user: User
  isOwner: boolean
  pitchCount: number
  avgRating: number | null
  topCategories: { name: string; count: number }[]
}
```

## 6. UX Flow

**Owner viewing their own profile:**
1. Navigate to `/users/[own-slug]`
2. Page renders with "Edit Profile" button in header (server detects ownership)
3. Click "Edit Profile" → header toggles to edit mode (name, bio, location become input fields)
4. Modify fields, click "Save" → Server Action updates `users` table, page revalidates
5. Edit mode closes, updated profile displays

**Visitor viewing another user's profile:**
1. Navigate to `/users/[slug]`
2. Page renders with user info, stats (pitch count, avg rating, top 3 categories), and pitch list
3. Each pitch card shows book cover, title, rating, and audio player (if `audio_url` exists)
4. Click play on a pitch → audio plays in native HTML5 player

**Social sharing:**
1. User shares profile URL (e.g., `/users/adam-janes`) on Twitter/LinkedIn
2. Social platform scrapes og:tags (title: "Adam Janes | Book Pitches", description: bio excerpt, image: avatar or default)
3. Rich preview displays in social feed

## 7. Requirements

**Profile Editing:**
- **REQ-01:** The profile page SHALL display an "Edit Profile" button in the header WHEN the logged-in user is the profile owner (detected via server-side session check)
- **REQ-02:** The "Edit Profile" button SHALL toggle the profile header into edit mode WHEN clicked, replacing static text with input fields for name, bio, and location
- **REQ-03:** The edit form SHALL validate that name is non-empty (1-100 chars), bio is optional (max 500 chars), location is optional (max 100 chars) BEFORE submitting
- **REQ-04:** The "Save" button SHALL call the `updateProfile` Server Action WHEN clicked, passing updated field values
- **REQ-05:** The `updateProfile` Server Action SHALL verify the logged-in user owns the profile (RLS enforces this) BEFORE updating the `users` table
- **REQ-06:** The profile page SHALL revalidate and display updated data WHEN the Server Action succeeds
- **REQ-07:** The edit form SHALL display an error message WHEN the Server Action fails (e.g., validation error, database error)

**Audio Playback:**
- **REQ-08:** The ReviewCard component SHALL display the existing audio player (implemented in pitch-creation-flow) WHEN the pitch has a non-null `audio_url`
- **REQ-09:** The audio player SHALL function correctly on the profile page with play/pause controls and duration display (inherited from pitch-creation-flow implementation)
- **REQ-10:** The audio player SHALL use the parchment styling already applied globally from pitch-creation-flow
- **REQ-11:** The audio player SHALL NOT preload audio files (only load WHEN user clicks play)

**Top Categories:**
- **REQ-12:** The profile page SHALL query the user's top 3 categories via `getUserTopCategories` WHEN rendering
- **REQ-13:** The profile header SHALL display top 3 categories as stat badges with category name and pitch count (e.g., "Science Fiction (5)")
- **REQ-14:** Category badges SHALL be hidden WHEN the user has zero pitches or zero categorized books

**SEO Metadata:**
- **REQ-15:** The `generateMetadata` function SHALL return og:title as "{user.name} | Book Pitches" WHEN profile exists
- **REQ-16:** The `generateMetadata` function SHALL return og:description as the user's bio (truncated to 200 chars) or default text "Check out {user.name}'s book pitches" WHEN bio is null
- **REQ-17:** The `generateMetadata` function SHALL return og:image as the user's `avatar_url` or a default site logo WHEN `avatar_url` is null

**Responsive Design:**
- **REQ-18:** The profile header SHALL stack vertically on mobile (<640px) with avatar centered, stats below
- **REQ-19:** The pitch list SHALL display as a single column on mobile and multi-column grid on desktop (>=768px)

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RLS policy fails to prevent unauthorized edits | Low | High | Server Action double-checks session user ID; rely on Supabase RLS as primary safeguard; add integration test for unauthorized update attempt |
| Audio files fail to load (broken URLs, CORS, format issues) | Medium | Medium | Display fallback "Audio unavailable" message when `<audio>` errors; validate `audio_url` format in pitch creation flow |
| Top categories query is slow for users with many pitches | Low | Low | At V1 scale (tens of pitches), query is fast; add SQL EXPLAIN ANALYZE if performance issues arise; consider materialized view in V2 |
| Edit form validation doesn't prevent SQL injection or XSS | Low | High | Server Action sanitizes inputs; Supabase parameterized queries prevent SQL injection; React escapes JSX by default |
| Social platforms don't display og:image correctly | Medium | Low | Test og:tags with Twitter Card Validator and Facebook Debugger; ensure image URL is absolute and accessible |

## 9. Success Criteria

- [ ] Profile owners can click "Edit Profile" and update name, bio, location via inline form
- [ ] Profile updates persist to `users` table and revalidate the page to show new data
- [ ] Unauthorized users (non-owners) do NOT see "Edit Profile" button
- [ ] Pitch cards display audio player when `audio_url` is present; player plays audio on click
- [ ] Top 3 categories display in profile header with accurate counts
- [ ] Social share links (Twitter, LinkedIn) show rich preview with og:title, og:description, og:image
- [ ] Profile page is fully responsive (mobile and desktop layouts render correctly)
- [ ] Playwright verification confirms: edit mode works, audio player renders, categories display, social metadata exists

## 10. Impact

### New Files

| File | Purpose |
|------|---------|
| `src/components/ProfileHeader.tsx` | Client component for profile header with inline edit mode |
| `src/app/actions/users.ts` | Server Actions: `updateProfile` |
| `src/lib/supabase/queries.ts` (modified) | Add `getUserTopCategories` query function |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/users/[slug]/page.tsx` | Add owner detection logic; fetch top categories; pass data to ProfileHeader; enhance generateMetadata with og:tags |
| `src/components/ReviewCard.tsx` | Verify existing audio player (from pitch-creation-flow) works on profile page; no new implementation needed |
| `src/lib/supabase/queries.ts` | Add `getUserTopCategories` query function |
