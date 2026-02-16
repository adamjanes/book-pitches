import Link from 'next/link'

interface TagBadgeProps {
  tag: { name: string; slug: string }
  category?: { name: string; slug: string }
}

export default function TagBadge({ tag, category }: TagBadgeProps) {
  const badge = (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-light text-accent transition-colors hover:bg-accent hover:text-white">
      {tag.name}
    </span>
  )

  if (category) {
    return (
      <Link href={`/categories/${category.slug}`}>
        {badge}
      </Link>
    )
  }

  return badge
}
