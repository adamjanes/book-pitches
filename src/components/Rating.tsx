import { formatRating } from '@/lib/utils'

interface RatingProps {
  rating: number | null
  size?: 'sm' | 'md' | 'lg'
}

function getRatingClass(rating: number | null): string {
  if (rating === null) return 'rating-none'
  if (rating >= 8) return 'rating-high'
  if (rating >= 6) return 'rating-medium'
  return 'rating-low'
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
} as const

export default function Rating({ rating, size = 'md' }: RatingProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${getRatingClass(rating)} ${sizeStyles[size]}`}
    >
      {formatRating(rating)}{rating !== null ? '/10' : ''}
    </span>
  )
}
