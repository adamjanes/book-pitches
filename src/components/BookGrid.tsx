import type { BookWithStats } from '@/lib/supabase/types'
import BookCard from './BookCard'

interface BookGridProps {
  books: BookWithStats[]
}

export default function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <p className="text-center text-muted py-12">
        No books found.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
