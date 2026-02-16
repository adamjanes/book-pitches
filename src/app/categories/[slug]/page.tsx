import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'
import BookGrid from '@/components/BookGrid'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getCategoryBySlug(slug)

  if (!result) {
    return { title: 'Category Not Found | Book Pitches' }
  }

  return {
    title: `${result.category.name} Books | Book Pitches`,
    description: `Browse ${result.category.name} book reviews and elevator pitches`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const result = await getCategoryBySlug(slug)

  if (!result) {
    notFound()
  }

  const { category, books } = result

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {category.name}
        </h1>
        <p className="text-muted text-sm mt-1">
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </p>
      </div>
      <BookGrid books={books} />
    </div>
  )
}
