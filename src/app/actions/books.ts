'use server'

import { createClient } from '@/lib/supabase/server'
import { fetchBookDescription } from '@/lib/openlibrary'
import type { Book } from '@/lib/supabase/types'

/**
 * Create or get a book from the database
 *
 * Deduplicates by open_library_key. If the book exists, returns it.
 * If not, fetches description from Open Library and creates a new record.
 *
 * @param metadata - Book metadata from Open Library search result
 * @returns The created or existing book record
 */
export async function createOrGetBook(metadata: {
  title: string
  author: string
  openLibraryKey: string
  coverUrl: string | null
  publishedYear: number | null
}): Promise<{ data: Book | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // Check if book already exists by open_library_key
    const { data: existingBook, error: fetchError } = await supabase
      .from('books')
      .select('*')
      .eq('open_library_key', metadata.openLibraryKey)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected), other errors are real problems
      return { data: null, error: `Database query failed: ${fetchError.message}` }
    }

    if (existingBook) {
      // Book already exists, return it
      return { data: existingBook, error: null }
    }

    // Book doesn't exist, fetch description from Open Library work detail endpoint
    const description = await fetchBookDescription(metadata.openLibraryKey)

    // Generate slug from title (lowercase, replace non-alphanumeric with hyphens)
    const slug = metadata.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

    // Create new book record
    const { data: newBook, error: insertError } = await supabase
      .from('books')
      .insert({
        title: metadata.title,
        author: metadata.author,
        open_library_key: metadata.openLibraryKey,
        cover_url: metadata.coverUrl,
        published_year: metadata.publishedYear,
        description,
        slug,
      })
      .select()
      .single()

    if (insertError) {
      // Handle race condition: unique constraint violation on open_library_key
      if (insertError.code === '23505') {
        // Another user just created this book, fetch and return it
        const { data: raceBook, error: raceFetchError } = await supabase
          .from('books')
          .select('*')
          .eq('open_library_key', metadata.openLibraryKey)
          .single()

        if (raceFetchError) {
          return { data: null, error: `Race condition recovery failed: ${raceFetchError.message}` }
        }

        return { data: raceBook, error: null }
      }

      // Other insert errors
      return { data: null, error: `Failed to create book: ${insertError.message}` }
    }

    return { data: newBook, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
