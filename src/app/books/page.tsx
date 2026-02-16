import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getBooks, searchBooks } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'
import BookGrid from '@/components/BookGrid'
import SearchBar from '@/components/SearchBar'

export const metadata: Metadata = {
  title: 'Browse Books | Book Pitches',
  description: 'Browse all curated book reviews and elevator pitches',
}

interface BooksPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams
  const query = params.q

  const books = query ? await searchBooks(query) : await getBooks()

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          {query ? 'Search Results' : 'All Books'}
        </h1>
        {query && (
          <p className="text-muted text-sm">
            {books.length} {books.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
          </p>
        )}
        <Suspense fallback={null}>
          <SearchBar basePath="/books" />
        </Suspense>
      </div>
      <BookGrid books={books} />
    </div>
  )
}
