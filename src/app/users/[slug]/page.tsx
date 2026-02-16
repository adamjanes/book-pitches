import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getUserBySlug } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'
import { formatRating } from '@/lib/utils'
import ReviewCard from '@/components/ReviewCard'

interface UserPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getUserBySlug(slug)

  if (!result) {
    return { title: 'User Not Found | Book Pitches' }
  }

  return {
    title: `${result.user.name} | Book Pitches`,
    description: `${result.user.name}'s book pitches and reviews`,
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { slug } = await params
  const result = await getUserBySlug(slug)

  if (!result) {
    notFound()
  }

  const { user, pitches } = result
  const avgRating = pitches.length > 0
    ? pitches.reduce((sum, p) => sum + (p.rating || 0), 0) / pitches.length
    : null

  return (
    <div className="space-y-12">
      {/* Profile header */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center text-accent text-2xl font-bold shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {user.name}
          </h1>
          {user.bio && (
            <p className="text-muted max-w-2xl">
              {user.bio}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted pt-1">
            <span>
              {pitches.length} {pitches.length === 1 ? 'book' : 'books'} pitched
            </span>
            {avgRating !== null && (
              <span>
                Average rating: {formatRating(avgRating)}/10
              </span>
            )}
          </div>
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
              <ReviewCard key={pitch.id} review={pitch} showBook />
            ))}
          </div>
        ) : (
          <p className="text-muted py-8 text-center">
            No pitches yet.
          </p>
        )}
      </section>
    </div>
  )
}
