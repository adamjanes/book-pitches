# Book Pitches

Voice-first platform where readers record ~90-second audio pitches for books they love. Built with Next.js 16 (App Router), Supabase, Tailwind CSS 4.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, `--webpack` mode) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (Postgres + Auth + Storage) |
| Auth | Supabase Auth (email/password, OAuth) |
| Hosting | Vercel (planned) |

## Project Structure

```
src/
  app/              # Next.js App Router pages
    (auth)/          # Auth routes (login, signup, callback)
    actions/         # Server Actions (books.ts)
    books/           # Book browsing pages
    categories/      # Category pages
  components/       # Shared components (BookSearch, SearchBar, etc.)
  lib/              # Utilities (supabase clients, openlibrary API)
  proxy.ts          # Auth middleware (Next.js 16 convention)
```

## Key Patterns

- **Server Actions** in `src/app/actions/` for mutations
- **Supabase SSR** via `@supabase/ssr` — server/client helpers in `src/lib/supabase/`
- **Proxy** (not middleware) for auth session refresh — Next.js 16 renamed this
- **Open Library API** for book search and metadata (`src/lib/openlibrary.ts`)

## Development

```bash
npm run dev          # Start dev server (webpack mode, NOT turbopack)
npm run build        # Production build
npm run lint         # ESLint
```

**Important:** Turbopack crashes on this project. Always use `npm run dev` which runs `next dev --webpack`.

## V1 Features (Planned)

1. ~~Open Library Search~~ (done)
2. Audio Recorder
3. Pitch Creation Flow
4. Discovery Page
5. User Profile
6. Landing Page

## Conventions

### Browser Verification

UI tasks include `VERIFY:` blocks in `tasks.md`. These use **Playwright MCP** to verify changes in a real browser.

- Screenshots saved to `verification/` directory
- Dev server must be running at `http://localhost:3000`
- Verify BEFORE marking a task complete

### Commits

- One commit per task
- Descriptive messages: "Add AudioRecorder component with record/stop controls"
- Mark the task `[x]` in `tasks.md` in the same commit

### Supabase

- Migrations via Supabase MCP tools (not local CLI)
- Project is in the "Adam Projects" organization (Pro tier)
- Storage buckets: `pitch-audio` (for audio files)
