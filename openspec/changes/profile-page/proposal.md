# Profile Page

## Why
Users need a shareable public profile page that showcases their personal book list—their avatar, bio, location, and all their pitches. This is the page they share with friends to say "here's what I'm reading and why I love these books."

## What Changes
- Add `/u/[slug]` dynamic route for user profiles (e.g., `/u/adam-janes`)
- Display user header: avatar, name, bio, location
- List all user's pitches with book covers, titles, authors, ratings, and playable audio
- Show profile stats: total pitches count, average rating, top 3 categories
- Style with parchment/beige aesthetic consistent with site branding
- Implement profile editing UI (owner-only, visible when logged in): update avatar, bio, location
- Add SEO metadata (og:title, og:description, og:image) for social sharing
- Ensure fully responsive layout for mobile and desktop
- Secure editing capability with auth check (only logged-in owner can edit)

## Capabilities

### New Capabilities
- `fetch-user-by-slug`: Query user by slug, returning profile data (name, bio, location, avatar)
- `fetch-user-pitches`: Fetch all reviews for a user with book metadata (cover, title, author, rating, audio_url)
- `calculate-profile-stats`: Compute user stats (pitch count, average rating, top categories)
- `render-user-profile-header`: Display user avatar, name, bio, location with consistent branding
- `render-pitch-list`: Grid layout for user's pitches showing book card + rating + audio player
- `edit-profile`: Update user bio, avatar, location (owner-only, requires auth)
- `secure-profile-edit`: Verify user is logged in and owns the profile before allowing edits
- `social-share-metadata`: Generate og:title, og:description, og:image for each profile URL
- `responsive-profile-layout`: Layout adapts to mobile (single column pitch list) and desktop (multi-column grid)

### Modified Capabilities
- `fetch-user-by-slug`: Existing users table now used for public profile queries

## Impact
- **Database queries**: Query `users` table by slug; fetch `reviews` with joined `books` data; aggregate category stats from `book_tags`
- **UI components**: User profile header, pitch card with audio player, edit profile modal/form, stat badge components
- **Routes**: Add `/u/[slug]` page (public read), `/u/[slug]/edit` page or modal (authenticated edit)
- **API endpoints**: `/api/users/[slug]` (GET public profile), `/api/users/[slug]` (PUT/PATCH edit, owner-only)
- **Auth**: Supabase Auth session check in edit flow; row-level security on users table for update operations
- **Styling**: Ensure parchment/beige palette extends to profile page; consistent spacing and typography
- **SEO**: Server-render profile pages with dynamic og:meta tags for social sharing; ensure slug is human-readable and unique
- **Performance**: Index `users.slug` for fast profile lookups; cache user profile data with short TTL
