-- Book Pitches - Initial Schema Migration
-- V1: Public read-only access, single curator (Adam)
-- All tables have RLS enabled with public SELECT policies

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (curators who write book reviews)
-- V1: Single user (Adam), but designed for future multi-curator support
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE users IS 'Curators who write book reviews and pitches';
COMMENT ON COLUMN users.slug IS 'URL-friendly identifier for curator profile pages';

-- Books table (core entity)
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

COMMENT ON TABLE books IS 'Books that have been reviewed and pitched';
COMMENT ON COLUMN books.slug IS 'URL-friendly identifier for book detail pages';
COMMENT ON COLUMN books.isbn IS 'ISBN-10 or ISBN-13 for book cover lookups';

-- Reviews table (one review per user per book)
-- Contains the rating and elevator pitch
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 10),
    pitch_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, book_id)
);

COMMENT ON TABLE reviews IS 'Book reviews with ratings (0-10) and ~90-second elevator pitches';
COMMENT ON COLUMN reviews.rating IS 'Rating out of 10 (allows one decimal place)';
COMMENT ON COLUMN reviews.pitch_text IS 'Elevator pitch explaining why someone should read this book';

-- Categories table (top-level tag groupings)
-- Examples: "Buddhism", "AI", "Self-Improvement"
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0
);

COMMENT ON TABLE categories IS 'Top-level groupings for tags (e.g., Buddhism, AI, Self-Improvement)';
COMMENT ON COLUMN categories.display_order IS 'Controls sort order in UI (lower numbers first)';

-- Tags table (specific topics within categories)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

COMMENT ON TABLE tags IS 'Specific topics/themes that can be applied to books';
COMMENT ON COLUMN tags.category_id IS 'Optional parent category for tag organization';

-- Book-Tag junction table (many-to-many)
CREATE TABLE book_tags (
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, tag_id)
);

COMMENT ON TABLE book_tags IS 'Associates books with tags (many-to-many relationship)';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Books indexes
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_author ON books(author);

-- Reviews indexes
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Tags indexes
CREATE INDEX idx_tags_category_id ON tags(category_id);
CREATE INDEX idx_tags_slug ON tags(slug);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Book stats view: Books with average rating and review count
-- Useful for browse pages and sorting
CREATE VIEW book_with_stats AS
SELECT
    b.id,
    b.title,
    b.author,
    b.isbn,
    b.cover_url,
    b.published_year,
    b.slug,
    b.created_at,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.id) AS review_count
FROM books b
LEFT JOIN reviews r ON r.book_id = b.id
GROUP BY b.id, b.title, b.author, b.isbn, b.cover_url, b.published_year, b.slug, b.created_at;

COMMENT ON VIEW book_with_stats IS 'Books with computed average rating and review count';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies (V1: read-only public access)
CREATE POLICY "Public read access for users"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Public read access for books"
    ON books FOR SELECT
    USING (true);

CREATE POLICY "Public read access for reviews"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Public read access for categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Public read access for tags"
    ON tags FOR SELECT
    USING (true);

CREATE POLICY "Public read access for book_tags"
    ON book_tags FOR SELECT
    USING (true);

-- ============================================================================
-- NOTES
-- ============================================================================

-- V1 Scope:
-- - No INSERT/UPDATE/DELETE policies (will be added in future migrations)
-- - Single curator (Adam) — data seeded from Obsidian brain
-- - Public read-only access for all tables
-- - Future: Add authenticated curator policies for content management
