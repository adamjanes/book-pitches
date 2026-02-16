import type { Metadata } from 'next'
import { getCategories } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'
import CategoryCard from '@/components/CategoryCard'

export const metadata: Metadata = {
  title: 'Categories | Book Pitches',
  description: 'Browse book categories',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">
        Categories
      </h1>
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <p className="text-muted py-12 text-center">
          No categories yet.
        </p>
      )}
    </div>
  )
}
