# Profile Page Design

## Context

Profile pages are the shareable "bookshelf" for each user — the page they send to friends saying "here's what I'm reading and why." The platform uses a parchment/beige aesthetic. The database schema (from new-schema) defines a `users` table (id, name, slug, avatar_url, bio, location, created_at) with a unique slug, and a `pitches` table joined to `books` with audio_url, rating, and duration_seconds. RLS allows public SELECT on all tables and owner-only UPDATE on users.

## Goals / Non-Goals

**Goals:**
- Public profile page at `/u/[slug]` (e.g., `/u/adam-janes`)
- Display user header: avatar, name, bio, location
- List all user's pitches with book covers, titles, authors, ratings, and playable audio
- Show profile stats: total pitches, average rating, top 3 categories
- Owner-only profile editing (bio, location, avatar_url)
- SEO metadata for social sharing (og:title, og:description, og:image)
- Responsive layout matching parchment/beige aesthetic

**Non-Goals:**
- Following or social features between users — V2
- Custom profile themes or layouts
- Pitch ordering/pinning by the user — V2
- Profile analytics (view counts, play counts)
- Avatar upload (use URL input or Gravatar for V1)

## Decisions

### Decision 1: /u/[slug] route for short, shareable URLs

**Choice:** Profile pages live at `/u/[slug]` (e.g., `/u/adam-janes`).

**Why:** Short, memorable URLs are critical for shareability — users will paste these on social media and in messages. The `/u/` prefix clearly namespaces user profiles, avoids collisions with other routes, and is a well-understood convention (GitHub uses it similarly).

**Alternative considered:** `/profile/[slug]`. More verbose, less shareable. `/[slug]` (root level). Conflicts with other routes (`/discover`, `/record`, etc.) and makes routing ambiguous.

### Decision 2: Server Component with single joined query

**Choice:** The profile page is a React Server Component that fetches all data in a single Supabase query: user profile + pitches with book data.

**Query approach:**
```
users (by slug) → pitches (by user_id) → books (via book_id join)
```
Plus a separate aggregation query for stats (pitch count, avg rating, top categories from book_categories).

**Why:** Server Components render on the server with zero client-side JavaScript for the data fetching. A single query avoids waterfall requests. The page is fully rendered with all data before being sent to the client — great for SEO and fast initial load.

**Alternative considered:** Client-side data fetching with `useEffect`. Slower perceived performance, requires loading skeletons, and the page isn't indexable by search engines without additional SSR setup.

### Decision 3: Inline edit mode for profile, not separate page

**Choice:** When the logged-in owner visits their own profile, show an "Edit Profile" button that toggles the header section into an editable form (name, bio, location fields become inputs). Save via Server Action.

**Why:** Inline editing keeps the user on their profile page — they see changes in context. A separate `/settings` page divorces editing from viewing, which is jarring for profile updates. The edit form is simple (3-4 fields), so it doesn't warrant a full page.

**Owner detection:** Compare `auth.uid()` with the profile's user ID. If they match, show the edit button. This check happens server-side in the Server Component.

**Alternative considered:** Separate `/u/[slug]/edit` page or `/settings/profile` page. More separation of concerns but unnecessary for 3-4 fields.

### Decision 4: Lightweight HTML5 audio player on pitch cards

**Choice:** Each pitch card includes a native HTML5 `<audio>` element with minimal custom styling. Controls: play/pause toggle, duration display. No custom audio player library.

**Why:** The native `<audio>` element handles cross-browser playback of both webm and mp4 formats without dependencies. Custom styling is applied via CSS to match the parchment aesthetic. A full-featured audio player (waveform, seek bar, speed control) is overkill for ~90-second pitches.

**Alternative considered:** Custom React audio player component with waveform visualization. Significant implementation effort, requires AudioContext analysis. Can be a V2 enhancement.

### Decision 5: Stats calculated at query time

**Choice:** Profile stats (total pitches, average rating, top 3 categories) are computed via SQL aggregation at request time, not stored in a materialized view or denormalized column.

**Why:** At V1 scale (tens to hundreds of pitches per user), these aggregations are fast — milliseconds even without optimization. Materializing them adds complexity (refresh triggers, staleness). The `book_with_stats` view from the new-schema handles book-level stats; user-level stats are simple enough to compute inline.

**Stats queries:**
- Total pitches: `COUNT(*) FROM pitches WHERE user_id = $1`
- Average rating: `AVG(rating) FROM pitches WHERE user_id = $1`
- Top categories: `SELECT c.name, COUNT(*) FROM book_categories bc JOIN categories c ... GROUP BY c.name ORDER BY count DESC LIMIT 3`

**Alternative considered:** Materialized view or denormalized `users.pitch_count`, `users.avg_rating`. Premature optimization — adds trigger/refresh complexity.

### Decision 6: Slug generation from name on signup

**Choice:** Auto-generate slug from the user's name on signup (e.g., "Adam Janes" → "adam-janes"). The slug is editable later via profile edit. Enforce uniqueness with a database constraint and handle collisions by appending a number.

**Why:** Users shouldn't have to think of a URL slug during signup — that adds friction. Auto-generating from the name is intuitive. The collision handling (append -2, -3, etc.) is simple and covers edge cases.

**Collision resolution:** Application-level check before insert. If "adam-janes" exists, try "adam-janes-2", "adam-janes-3", etc. The database UNIQUE constraint is the final safety net.

**Alternative considered:** Let users choose a username/slug during signup. Better for identity but adds friction to the signup flow. Can offer slug editing on the profile page instead.

## Risks / Trade-offs

- **[Risk] Slug collisions** → Two users with the same name get colliding slugs. Mitigation: append incrementing number. At V1 scale, this is extremely unlikely.
- **[Risk] N+1 queries for pitch audio playback** → Each pitch has an audio file that needs to load. Mitigation: audio only loads when the user clicks play — no preloading. The `<audio>` element handles lazy loading by default.
- **[Trade-off] No avatar upload in V1** → Users provide an avatar URL (e.g., Gravatar, social media link) rather than uploading a file. Keeps implementation simple — adding file upload to a Storage bucket is a V2 enhancement.
- **[Trade-off] No pitch ordering** → Pitches are displayed in reverse chronological order (most recent first). Users can't pin or reorder. Acceptable for V1 — curated list ordering is a V2 feature.
- **[Risk] SEO for empty profiles** → A profile with zero pitches has thin content. Mitigation: show a friendly "No pitches yet" state with a CTA to record the first pitch. Search engines will index once content exists.

## Open Questions

- Should the profile page show a grid or list layout for pitch cards? **Recommendation: grid (2-3 columns on desktop, 1 column on mobile) — more visually engaging and shows more book covers above the fold.**
- Should profile stats be visible to everyone or only the profile owner? **Recommendation: visible to everyone — they're a social proof signal.**
