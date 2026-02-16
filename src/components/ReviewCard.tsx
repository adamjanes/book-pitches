import Link from 'next/link'
import type { Pitch, User, Book } from '@/lib/supabase/types'
import Rating from './Rating'

interface ReviewCardProps {
  review: Pitch & { user?: User; book?: Book }
  showBook?: boolean
}

export default function ReviewCard({ review, showBook = false }: ReviewCardProps) {
  return (
    <div className="py-6 border-b border-warm-border last:border-b-0">
      {/* Header: rating + reviewer */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.user && (
            <Link
              href={`/users/${review.user.slug}`}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-sm font-semibold">
                {review.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {review.user.name}
              </span>
            </Link>
          )}
        </div>
        <Rating rating={review.rating ?? null} size="sm" />
      </div>

      {/* Book reference if showBook */}
      {showBook && review.book && (
        <Link
          href={`/books/${review.book.slug}`}
          className="block mb-3 text-sm font-medium text-accent hover:underline"
        >
          {review.book.title} by {review.book.author}
        </Link>
      )}

      {/* Pitch text */}
      {review.pitch_text ? (
        <div className="pitch-text">
          {review.pitch_text}
        </div>
      ) : (
        <p className="text-sm text-muted italic">
          No pitch written yet.
        </p>
      )}

      {/* Date */}
      <p className="mt-3 text-xs text-muted">
        {new Date(review.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  )
}
