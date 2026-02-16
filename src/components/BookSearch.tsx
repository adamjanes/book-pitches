'use client'

import { useState } from 'react'

interface BookSearchProps {
  onBookSelected?: (book: any) => void
}

export default function BookSearch({ onBookSelected }: BookSearchProps) {
  const [query, setQuery] = useState('')

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
