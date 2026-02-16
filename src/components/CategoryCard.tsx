import Link from 'next/link'
import type { Category } from '@/lib/supabase/types'

interface CategoryCardProps {
  category: Category & { book_count: number }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <div className="card p-6 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          {category.name}
        </h3>
        <p className="text-sm text-muted">
          {category.book_count} {category.book_count === 1 ? 'book' : 'books'}
        </p>
      </div>
    </Link>
  )
}
