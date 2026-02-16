-- Allow public book creation for Open Library search flow
-- V1: Users can create books during search without auth
-- Future: Consider requiring auth if abuse becomes an issue

DROP POLICY IF EXISTS "Authenticated users can create books" ON books;

CREATE POLICY "Anyone can create books"
  ON books FOR INSERT
  WITH CHECK (true);
