import { Suspense } from 'react'
import Link from 'next/link'
import { getBooks, getCategories, searchBooks } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'
import BookGrid from '@/components/BookGrid'
import CategoryCard from '@/components/CategoryCard'
import SearchBar from '@/components/SearchBar'

interface HomeProps {
  searchParams: Promise<{ q?: string }>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams
  const query = params.q

  if (query) {
    const results = await searchBooks(query)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Search Results
          </h1>
          <p className="text-muted text-sm mb-6">
            {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
          </p>
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
        <BookGrid books={results} />
      </div>
    )
  }

  const [books, categories] = await Promise.all([
    getBooks(8),
    getCategories(),
  ])

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Book Pitches
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Curated book reviews with 90-second elevator pitches.
          Discover your next great read.
        </p>
        <div className="flex justify-center pt-4">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      {/* Featured Books */}
      {books.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Top Rated
            </h2>
            <Link
              href="/books"
              className="text-sm font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          <BookGrid books={books} />
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
