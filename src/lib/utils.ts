export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function formatRating(rating: number | null): string {
  if (rating === null) return 'N/A'
  return rating.toFixed(1)
}

export function getBookCoverUrl(coverUrl: string | null): string | null {
  if (!coverUrl) return null
  // Only return URLs that are absolute (http/https) — relative paths from Obsidian aren't usable
  if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) return coverUrl
  return null
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
