-- Book Pitches V1 Voice-First Schema
-- Drops old read-only schema, creates fresh schema for audio pitch platform

-- Drop old objects
DROP VIEW IF EXISTS book_with_stats CASCADE;
DROP TABLE IF EXISTS book_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Books table (canonical record per book from Open Library)
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  open_library_key TEXT UNIQUE,
  cover_url TEXT,
  published_year INTEGER,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pitches table (audio recordings, one per user per book)
CREATE TABLE pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  audio_url TEXT,
  rating INTEGER CHECK (rating >= 0 AND rating <= 10),
  duration_seconds INTEGER,
  pitch_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Categories table (flat list for filtering)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Book categories junction table (many-to-many)
CREATE TABLE book_categories (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

-- Book with stats view (joins books with pitch aggregates)
CREATE VIEW book_with_stats AS
SELECT
  b.*,
  COALESCE(AVG(p.rating), 0) AS avg_rating,
  COUNT(p.id) AS pitch_count
FROM books b
LEFT JOIN pitches p ON b.id = p.book_id
GROUP BY b.id;

-- Indexes
CREATE INDEX idx_pitches_user_id ON pitches(user_id);
CREATE INDEX idx_pitches_book_id ON pitches(book_id);
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_users_slug ON users(slug);
CREATE INDEX idx_book_categories_category_id ON book_categories(category_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies: Books
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies: Pitches
CREATE POLICY "Pitches are viewable by everyone"
  ON pitches FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create pitches for themselves"
  ON pitches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pitches"
  ON pitches FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies: Categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- RLS Policies: Book Categories
CREATE POLICY "Book categories are viewable by everyone"
  ON book_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can assign categories to books"
  ON book_categories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Auth trigger: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username TEXT;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Extract username from email (part before @)
  username := split_part(NEW.email, '@', 1);
  base_slug := lower(regexp_replace(username, '[^a-z0-9]', '-', 'g'));
  final_slug := base_slug;

  -- Ensure unique slug (explicitly qualify table name)
  WHILE EXISTS (SELECT 1 FROM public.users WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  -- Insert user profile
  INSERT INTO public.users (id, name, slug, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', username),
    final_slug,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Seed categories (AI, Business, Spirituality, Psychology, Fiction, History, Science, Self-Help, Philosophy, Other)
INSERT INTO categories (name, slug, display_order) VALUES
  ('AI', 'ai', 1),
  ('Business', 'business', 2),
  ('Spirituality', 'spirituality', 3),
  ('Psychology', 'psychology', 4),
  ('Fiction', 'fiction', 5),
  ('History', 'history', 6),
  ('Science', 'science', 7),
  ('Self-Help', 'self-help', 8),
  ('Philosophy', 'philosophy', 9),
  ('Other', 'other', 10);
