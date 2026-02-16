'use client'

import { useState, useEffect } from 'react'
import { searchBooks, type OLSearchResult } from '@/lib/openlibrary'

interface BookSearchProps {
  onBookSelected?: (book: any) => void
}

export default function BookSearch({ onBookSelected }: BookSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OLSearchResult[]>([])

  // Debounced search with 300ms delay and 3-character minimum
  useEffect(() => {
    // Clear results if query is too short
    if (query.trim().length < 3) {
      setResults([])
      return
    }

    // Set up debounce timer
    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchBooks(query.trim())
        setResults(response.docs)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      }
    }, 300)

    // Cleanup: cancel pending search when query changes
    return () => clearTimeout(timeoutId)
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

      {/* Results Area */}
      <div className="space-y-2">
        {/* Results will be rendered here in subsequent tasks */}
      </div>
    </div>
  )
}
