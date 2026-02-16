import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBookBySlug } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'
import { getBookCoverUrl } from '@/lib/utils'
import Rating from '@/components/Rating'
import TagBadge from '@/components/TagBadge'
import ReviewCard from '@/components/ReviewCard'

interface BookPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getBookBySlug(slug)

  if (!result || !result.book) {
    return { title: 'Book Not Found | Book Pitches' }
  }

  return {
    title: `${result.book.title} by ${result.book.author} | Book Pitches`,
    description: `Read the elevator pitch for ${result.book.title} by ${result.book.author}`,
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params
  const result = await getBookBySlug(slug)

  if (!result || !result.book) {
    notFound()
  }

  const { book, pitches, categories } = result
  const coverUrl = getBookCoverUrl(book.cover_url)
  const hasRealCover = !!coverUrl
  const avgRating = pitches.length > 0
    ? pitches.reduce((sum, p) => sum + (p.rating || 0), 0) / pitches.length
    : null

  return (
    <div className="space-y-12">
      {/* Book header */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover */}
        <div className="shrink-0 w-full md:w-64">
          <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-accent-light flex items-center justify-center">
            {hasRealCover ? (
              <img
                src={coverUrl}
                alt={`Cover of ${book.title}`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="text-7xl font-bold text-accent/30">
                  {book.title.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm text-accent/50 font-medium">
                  {book.author}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {book.title}
            </h1>
            <p className="text-lg text-muted mt-1">
              by {book.author}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Rating rating={avgRating} size="lg" />
            {book.published_year && (
              <span className="text-sm text-muted">
                Published {book.published_year}
              </span>
            )}
            <span className="text-sm text-muted">
              {pitches.length} {pitches.length === 1 ? 'pitch' : 'pitches'}
            </span>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((category) => (
                <TagBadge
                  key={category.id}
                  tag={{ name: category.name, slug: category.slug }}
                  category={category}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pitches */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Pitches
        </h2>
        {pitches.length > 0 ? (
          <div className="divide-y divide-warm-border">
            {pitches.map((pitch) => (
              <ReviewCard key={pitch.id} review={pitch} />
            ))}
          </div>
        ) : (
          <p className="text-muted py-8 text-center">
            No pitches yet. Be the first to pitch this book!
          </p>
        )}
      </section>
    </div>
  )
}
