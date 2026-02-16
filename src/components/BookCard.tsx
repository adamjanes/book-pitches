import Link from 'next/link'
import type { BookWithStats } from '@/lib/supabase/types'
import { getBookCoverUrl } from '@/lib/utils'
import Rating from './Rating'

interface BookCardProps {
  book: BookWithStats
}

export default function BookCard({ book }: BookCardProps) {
  const coverUrl = getBookCoverUrl(book.cover_url)
  const hasRealCover = !!coverUrl

  return (
    <Link href={`/books/${book.slug}`}>
      <div className="card overflow-hidden group">
        {/* Cover */}
        <div className="aspect-[2/3] relative bg-accent-light flex items-center justify-center overflow-hidden">
          {hasRealCover ? (
            <img
              src={coverUrl}
              alt={`Cover of ${book.title}`}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
              <span className="text-5xl font-bold text-accent/30">
                {book.title?.charAt(0).toUpperCase() || '?'}
              </span>
              <span className="text-xs text-accent/50 font-medium">
                {book.author || 'Unknown'}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
              {book.title}
            </h3>
            <Rating rating={book.avg_rating} size="sm" />
          </div>
          <p className="text-xs text-muted truncate">
            {book.author}
          </p>
          {(book.pitch_count ?? 0) > 0 && (
            <p className="text-xs text-muted">
              {book.pitch_count} {book.pitch_count === 1 ? 'pitch' : 'pitches'}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
