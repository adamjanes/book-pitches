# Book Pitches — Project Overview

> **Generated:** 2026-02-12
> **Method:** /baseline brownfield analysis
> **Capabilities:** 4 (see openspec/specs/)

---

## 1. Purpose

**Problem:** Book recommendations are scattered across platforms (Goodreads, social media, blogs). Discovering curated lists from trusted voices requires navigating multiple sites. Existing platforms lack concise "elevator pitch" summaries that capture why a book matters.

**Core Promise:** A focused platform for curated book lists with ratings and ~90-second elevator pitches. Users can browse collections organized by category, discover what influential people are reading, and quickly understand a book's value proposition.

**Design Philosophy:**
- **Curation over scale** — Quality lists from real people, not algorithmic feeds
- **Conciseness** — Every book gets a pitch (max 90 seconds to read)
- **Simplicity** — No social features (V1), no gamification, just books and insights
- **Multi-user ready** — V1 is single-user (Adam), but data model supports community from day one

**V1 Scope:** Single curator (Adam), 264 books seeded from Obsidian vault, 61 tags grouped into ~10 categories. No authentication, but schema ready for multi-user expansion.

---

## 2. Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  Next.js 16.1.6 App Router (React Server Components)        │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Homepage  │  │   Books    │  │ Categories │            │
│  │   (SSR)    │  │   (SSR)    │  │   (SSR)    │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │                │                │                   │
│        └────────────────┴────────────────┘                   │
│                         │                                    │
│                         ▼                                    │
│              ┌──────────────────────┐                        │
│              │   queries.ts         │                        │
│              │  (6 query functions) │                        │
│              └──────────┬───────────┘                        │
│                         │                                    │
│              ┌──────────▼───────────┐                        │
│              │   Supabase Client    │                        │
│              │   (@supabase/ssr)    │                        │
│              └──────────┬───────────┘                        │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ HTTPS (anon key)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE (PostgreSQL)                      │
│                                                              │
│  ┌──────┐  ┌──────┐  ┌─────────┐  ┌────────────┐          │
│  │users │  │books │  │reviews  │  │categories  │          │
│  └──┬───┘  └──┬───┘  └────┬────┘  └─────┬──────┘          │
│     │         │           │              │                  │
│     │         │    ┌──────▼──────┐       │                 │
│     │         │    │book_with_   │       │                 │
│     │         │    │stats (VIEW) │       │                 │
│     │         │    └─────────────┘       │                 │
│     │         │                          │                 │
│     │    ┌────▼────┐                ┌────▼────┐           │
│     │    │book_tags│                │  tags   │           │
│     │    │(M:M)    │                └─────────┘           │
│     │    └─────────┘                                       │
│     │                                                      │
│     │    RLS: public SELECT on all tables                 │
│     │                                                      │
└─────┼──────────────────────────────────────────────────────┘
      │
      │ Service role key
      │
      ▼
┌─────────────────┐
│  seed.ts        │  (702 lines, Obsidian parser)
│  (script)       │
└─────────────────┘
```

**Rendering Strategy:** 100% Server-Side Rendering (force-dynamic on all pages). Client interactivity limited to SearchBar component (debounced input).

**Data Flow:** Page components → queries.ts → Supabase client → PostgreSQL → typed response → presentation components (BookCard, ReviewCard, etc.)

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 (alpha) |
| Database | Supabase (PostgreSQL) | - |
| Supabase SDK | @supabase/supabase-js | 2.95.3 |
| Supabase SSR | @supabase/ssr | 0.8.0 |
| Seed Parser | gray-matter | 4.0.3 |
| Script Runner | tsx | 4.21.0 |
| Linter | ESLint | 9.x |
| Hosting | Vercel | - |

### Directory Structure

```
app/
├── src/
│   ├── app/                    # Next.js App Router pages (force-dynamic SSR)
│   │   ├── layout.tsx          # Root layout (Geist fonts, Navigation, footer)
│   │   ├── page.tsx            # Homepage (top 8 books, categories grid, search)
│   │   ├── globals.css         # Tailwind v4 theme (warm palette, #722F37 accent)
│   │   ├── books/              # Book browsing routes
│   │   ├── categories/         # Category browsing routes
│   │   └── users/              # User profile routes
│   ├── components/             # 8 presentation components (BookCard, Navigation, etc.)
│   └── lib/
│       ├── utils.ts            # Utilities (slugify, formatRating, getBookCoverUrl, truncateText)
│       └── supabase/
│           ├── client.ts       # Supabase client factory (createClient wrapper)
│           ├── types.ts        # TypeScript types from DB schema
│           └── queries.ts      # 6 query functions (server-side data fetching)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full schema (6 tables, 1 view, RLS policies)
├── scripts/
│   └── seed.ts                 # 702-line Obsidian vault parser (264 books)
├── public/                     # Static assets (covers/, fonts/)
└── openspec/                   # Specs (this file + capability specs)
```

---

## 3. Capabilities

| Capability | Spec | Reqs | Gaps | Description |
|------------|------|------|------|-------------|
| book-browsing | [spec](specs/book-browsing/spec.md) | 12 | 8 | Browse books on homepage, /books page, individual book detail pages. Search by title/author. View ratings, pitches, tags. |
| category-browsing | [spec](specs/category-browsing/spec.md) | 9 | 6 | Browse all categories, view category detail pages with filtered books. Navigate via tag badges. |
| user-profiles | [spec](specs/user-profiles/spec.md) | 12 | 10 | View user profile pages showing all reviews/pitches by that user. Display user bio, avatar, stats. |
| data-seeding | [spec](specs/data-seeding/spec.md) | 14 | 11 | Seed database from Obsidian markdown files. Parse YAML frontmatter, map tags to categories, batch import. |

**Total:** 47 requirements, 35 known gaps

---

## 4. Data Model

### Database Schema (SQL)

```sql
-- Users (ready for multi-user, V1 has one user)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Canonical book records (one per book, shared across users)
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  cover_url TEXT,
  published_year INTEGER,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User reviews of books (many users can review the same book)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 10),
  pitch_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)  -- One review per user per book
);

-- Categories (top-level groupings: Business, Psychology, etc.)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Tags (granular labels, belong to categories)
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

-- Many-to-many: books can have multiple tags
CREATE TABLE book_tags (
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id)
);

-- View: books with aggregated stats
CREATE VIEW book_with_stats AS
  SELECT
    b.*,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.id) AS review_count
  FROM books b
  LEFT JOIN reviews r ON b.id = r.book_id
  GROUP BY b.id;
```

### TypeScript Interfaces (from `src/lib/supabase/types.ts`)

```typescript
export interface User {
  id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  cover_url: string | null;
  published_year: number | null;
  slug: string;
  created_at: string;
}

export interface BookWithStats extends Book {
  avg_rating: number;
  review_count: number;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  pitch_text: string | null;
  created_at: string;
  user?: User;
  book?: Book;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  book_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  category?: Category;
}
```

---

## 5. Component Map

### Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `src/app/page.tsx` | Homepage — top 8 featured books (sorted by rating), categories grid, search bar |
| `/books` | `src/app/books/page.tsx` | Browse all books, search by title/author, sort by rating/title/recent |
| `/books/[slug]` | `src/app/books/[slug]/page.tsx` | Book detail — cover, metadata, all reviews/pitches, tags |
| `/categories` | `src/app/categories/page.tsx` | Browse all categories (sorted by display_order) |
| `/categories/[slug]` | `src/app/categories/[slug]/page.tsx` | Category detail — all books with that category's tags |
| `/users/[slug]` | `src/app/users/[slug]/page.tsx` | User profile — bio, avatar, all reviews/pitches by that user |

### Core Libraries

| Module | Purpose |
|--------|---------|
| `src/lib/supabase/client.ts` | Supabase client factory (cookies-based SSR client) |
| `src/lib/supabase/queries.ts` | 6 server-side query functions (getBooks, getBookBySlug, getCategories, getCategoryBySlug, getUserBySlug, searchBooks) |
| `src/lib/supabase/types.ts` | TypeScript types matching DB schema |
| `src/lib/utils.ts` | Utilities (slugify, formatRating, getBookCoverUrl, truncateText) |
| `src/components/Navigation.tsx` | Sticky header with site nav |
| `src/components/SearchBar.tsx` | Client-side search input (300ms debounce, router.push to /books?q=) |
| `src/components/BookCard.tsx` | Book preview card (cover, title, author, rating) |
| `src/components/BookGrid.tsx` | Responsive grid wrapper (1-4 columns based on viewport) |
| `src/components/CategoryCard.tsx` | Category card with book count |
| `src/components/ReviewCard.tsx` | Review/pitch display (user, rating, pitch text) |
| `src/components/Rating.tsx` | Color-coded rating badge (red 0-5, yellow 5-7.5, green 7.5-10) |
| `src/components/TagBadge.tsx` | Tag pill linking to category page |
| `scripts/seed.ts` | 702-line seed script (parses Obsidian vault, bulk inserts to Supabase) |

---

## 6. External Dependencies & Configuration

### Services

| Service | Purpose | Auth |
|---------|---------|------|
| Supabase | PostgreSQL database, RLS, REST API | Anon key (client), Service role key (seed script) |
| Vercel | Hosting, CDN, serverless functions | OAuth (GitHub) |

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (client-side, public SELECT via RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only, used by seed script for bulk writes) |

**Configuration Files:**
- `.env.local` — Local environment variables (gitignored)
- `next.config.ts` — Next.js config (currently default setup)
- `tailwind.config.ts` — Tailwind v4 config
- `tsconfig.json` — TypeScript config (strict mode, path aliases)

---

## 7. Known Gaps & Blockers

### Blockers

| Priority | Blocker | Impact |
|----------|---------|--------|
| HIGH | Pitch text missing for all 264 books | Cannot launch — pitches are core value prop |
| HIGH | No test coverage (0 test files) | Cannot verify behavior, regression risk |
| MEDIUM | Error handling gaps (8+ query call sites throw without try-catch) | Poor UX on failures, no error boundaries |
| MEDIUM | N+1 query in getCategories (per-category sub-query for book counts) | Performance bottleneck at scale |

### Quality Gaps

| Gap | Severity |
|-----|----------|
| No test framework configured | HIGH |
| force-dynamic on all pages (disables caching) | MEDIUM |
| No pagination (all books loaded at once) | MEDIUM |
| No loading states | MEDIUM |
| No error display UI | MEDIUM |
| Hardcoded values (books dir path, debounce 300ms, featured limit 8) | LOW |
| Missing verify.sh script | LOW |

### Pending Decisions

- **Pitch generation method:** LLM-generated from book descriptions? Manual curation? Hybrid?
- **Caching strategy:** ISR? On-demand revalidation? Per-route tuning?
- **Pagination approach:** Cursor-based? Offset-based? Infinite scroll vs pages?
- **Test framework:** Vitest? Jest? Playwright for E2E?
- **Image optimization:** Next.js Image component? Supabase Storage CDN? Keep static public/?
- **Error boundaries:** Root-level? Per-route? Per-component?
- **V2 auth:** Supabase Auth Email/Password? OAuth providers? Magic links?

---

## 8. Development

### Commands

```bash
# Install dependencies
npm install

# Run development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint codebase
npm run lint

# Seed database (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
npm run seed

# Run migrations (via Supabase CLI)
# TODO: Add supabase CLI setup instructions

# Type-check (no npm script yet)
npx tsc --noEmit

# Full verification (TODO: create verify.sh)
# ./verify.sh
```

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-12 | Next.js App Router with 100% SSR (force-dynamic) | Simplicity for V1, avoid client-side complexity. Can optimize caching later. |
| 2026-02-12 | Tailwind CSS v4 (alpha) | Warm color palette with #722F37 accent matches book aesthetic. V4 has improved DX. |
| 2026-02-12 | Supabase for backend | Managed PostgreSQL, built-in RLS, fast setup. Multi-user ready with Auth. |
| 2026-02-12 | Single-user V1, multi-user schema | Get to launch faster, avoid auth complexity. Schema ready for expansion. |
| 2026-02-12 | Seed from Obsidian vault (264 books) | Adam's existing curated list. No manual entry needed. |
| 2026-02-12 | Book ratings 0-10 scale | Matches Obsidian frontmatter format (existing data uses 4-10 range). |
| 2026-02-12 | Tag → Category grouping | 61 tags too granular for nav. Categories provide browsable hierarchy. |
| 2026-02-12 | SearchBar client component | Only interactive element. 300ms debounce reduces API calls. |
| 2026-02-12 | Vercel hosting | Zero-config deployment, optimal Next.js support, free tier sufficient for V1. |
