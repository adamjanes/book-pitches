'use client'

import BookSearch from '@/components/BookSearch'

export default function TestSearchPage() {
  const handleBookSelected = (book: any) => {
    console.log('📚 Book selected:', book)
    console.log('Book ID:', book.id)
    console.log('Title:', book.title)
    console.log('Author:', book.author)
    console.log('Open Library Key:', book.open_library_key)
    console.log('Cover URL:', book.cover_url)
    console.log('Published Year:', book.published_year)
    console.log('Description:', book.description)
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Book Search Test Page
        </h1>
        <p className="text-muted">
          Test the Open Library search integration. Select a book to see the result logged to the console.
        </p>
      </div>

      <div className="bg-white/30 border border-accent/20 rounded-lg p-6">
        <BookSearch onBookSelected={handleBookSelected} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">Test Instructions:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Search for a book (minimum 3 characters)</li>
          <li>Verify search results appear with covers, titles, authors, and years</li>
          <li>Verify debounce works (300ms delay)</li>
          <li>Verify loading spinner shows during search</li>
          <li>Click a book to select it</li>
          <li>Open browser console to see the logged book record</li>
          <li>Select the same book again to verify deduplication</li>
        </ol>
      </div>
    </div>
  )
}
