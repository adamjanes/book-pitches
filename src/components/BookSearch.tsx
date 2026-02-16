'use client'

import { useState, useEffect } from 'react'
import { searchBooks, getBookCoverUrl, type OLSearchResult } from '@/lib/openlibrary'
import { createOrGetBook } from '@/app/actions/books'

interface BookSearchProps {
  onBookSelected?: (book: any) => void
}

export default function BookSearch({ onBookSelected }: BookSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OLSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectingKey, setSelectingKey] = useState<string | null>(null)

  // Handle book selection
  const handleBookClick = async (book: OLSearchResult) => {
    setSelectingKey(book.key)

    try {
      const { data, error } = await createOrGetBook({
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        openLibraryKey: book.key,
        coverUrl: getBookCoverUrl(book.cover_i, 'L'),
        publishedYear: book.first_publish_year ?? null,
      })

      if (error) {
        console.error('Failed to create/get book:', error)
        setError(error)
        setSelectingKey(null)
        return
      }

      if (data && onBookSelected) {
        onBookSelected(data)
      }
    } catch (err) {
      console.error('Unexpected error selecting book:', err)
      setError('Failed to select book. Please try again.')
    } finally {
      setSelectingKey(null)
    }
  }

  // Debounced search with 300ms delay and 3-character minimum
  useEffect(() => {
    // Clear results if query is too short
    if (query.trim().length < 3) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    // Create AbortController for this search request
    const abortController = new AbortController()

    // Set up debounce timer
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError(null)

      // Set up timeout for the search request (8 seconds)
      const timeoutTimer = setTimeout(() => {
        abortController.abort()
      }, 8000)

      try {
        const response = await searchBooks(query.trim(), abortController.signal)
        clearTimeout(timeoutTimer)
        setResults(response.docs)
        setLoading(false)
      } catch (error) {
        clearTimeout(timeoutTimer)

        // Ignore abort errors (they're expected when user types)
        if (error instanceof Error && error.name === 'AbortError') {
          // Check if this was a timeout or user-initiated abort
          // If still loading, it was likely a timeout
          if (loading) {
            setError('Search unavailable, please try again')
            setLoading(false)
            setResults([])
          }
          return
        }

        // Handle other API failures
        console.error('Search failed:', error)
        setError('Search unavailable, please try again')
        setResults([])
        setLoading(false)
      }
    }, 300)

    // Cleanup: cancel pending search and abort in-flight request when query changes
    return () => {
      clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [query])

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book by title or author..."
          className="w-full px-4 py-3 border border-accent/20 rounded-lg bg-white/50 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-colors"
        />
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Empty Results Message */}
      {!loading && !error && query.trim().length >= 3 && results.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted">No books found</p>
        </div>
      )}

      {/* Results Area */}
      <div className="grid gap-3">
        {results.map((book) => {
          const coverUrl = getBookCoverUrl(book.cover_i, 'M')
          const author = book.author_name?.[0] || 'Unknown Author'
          const year = book.first_publish_year || 'Year unknown'

          const isSelecting = selectingKey === book.key

          return (
            <div
              key={book.key}
              onClick={() => handleBookClick(book)}
              className={`flex gap-3 p-3 border border-accent/20 rounded-lg transition-all cursor-pointer ${
                isSelecting
                  ? 'bg-accent/10 border-accent/50 opacity-50'
                  : 'bg-white/50 hover:bg-white/80 hover:border-accent/40'
              }`}
            >
              {/* Cover Thumbnail */}
              <div className="flex-shrink-0 w-16 h-24 bg-muted/30 rounded overflow-hidden border border-accent/10">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                    No cover
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                  {book.title}
                </h3>
                <p className="text-sm text-muted/80">
                  {author}
                </p>
                <p className="text-xs text-muted/60 mt-1">
                  {year}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
