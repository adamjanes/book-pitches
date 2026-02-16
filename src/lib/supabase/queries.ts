import { createClient } from './client'
import type { BookWithStats, Category, Book, Pitch, User } from './types'

export async function getBooks(limit?: number): Promise<BookWithStats[]> {
  const supabase = createClient()

  let query = supabase
    .from('book_with_stats')
    .select('*')
    .order('avg_rating', { ascending: false, nullsFirst: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as BookWithStats[]) || []
}

export async function getBookBySlug(slug: string): Promise<{
  book: Book
  pitches: Array<Pitch & { user: User }>
  categories: Category[]
} | null> {
  const supabase = createClient()

  // Get the book
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single()

  if (bookError || !book) return null

  const bookData = book as unknown as Book

  // Get pitches with user info
  const { data: pitches, error: pitchesError } = await supabase
    .from('pitches')
    .select(`
      *,
      user:users (*)
    `)
    .eq('book_id', bookData.id)
    .order('created_at', { ascending: false })

  if (pitchesError) throw pitchesError

  // Get categories for this book
  const { data: bookCategories, error: categoriesError } = await supabase
    .from('book_categories')
    .select(`
      category:categories (*)
    `)
    .eq('book_id', bookData.id)

  if (categoriesError) throw categoriesError

  // Flatten the category structure
  const categories = ((bookCategories as Array<{ category: Category }>) || [])
    .filter(bc => bc.category)
    .map(bc => bc.category)

  return {
    book: bookData,
    pitches: ((pitches as Array<Pitch & { user: User }>) || []).map(p => ({
      ...p,
      user: p.user
    })),
    categories
  }
}

export async function getCategories(): Promise<Array<Category & {
  book_count: number
}>> {
  const supabase = createClient()

  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  if (categoriesError) throw categoriesError
  if (!categories) return []

  const categoryData = categories as unknown as Category[]

  // For each category, get book count
  const categoriesWithData = await Promise.all(
    categoryData.map(async (category) => {
      // Get book count via book_categories
      const { count } = await supabase
        .from('book_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)

      return {
        ...category,
        book_count: count || 0
      }
    })
  )

  return categoriesWithData
}

export async function getCategoryBySlug(slug: string): Promise<{
  category: Category
  books: BookWithStats[]
} | null> {
  const supabase = createClient()

  // Get the category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) return null

  const categoryData = category as unknown as Category

  // Get all book_categories for this category
  const { data: bookCategories, error: bookCategoriesError } = await supabase
    .from('book_categories')
    .select('book_id')
    .eq('category_id', categoryData.id)

  if (bookCategoriesError) throw bookCategoriesError

  const bookCategoryData = (bookCategories as unknown as Array<{ book_id: string }>) || []
  if (bookCategoryData.length === 0) {
    return { category: categoryData, books: [] }
  }

  // Get unique book IDs
  const bookIds = Array.from(new Set(bookCategoryData.map(bc => bc.book_id)))

  // Get books with stats
  const { data: books, error: booksError } = await supabase
    .from('book_with_stats')
    .select('*')
    .in('id', bookIds)
    .order('avg_rating', { ascending: false, nullsFirst: false })

  if (booksError) throw booksError

  return {
    category: categoryData,
    books: (books as BookWithStats[]) || []
  }
}

export async function getUserBySlug(slug: string): Promise<{
  user: User
  pitches: Array<Pitch & { book: Book }>
} | null> {
  const supabase = createClient()

  // Get the user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('slug', slug)
    .single()

  if (userError || !user) return null

  const userData = user as unknown as User

  // Get pitches with book info
  const { data: pitches, error: pitchesError } = await supabase
    .from('pitches')
    .select(`
      *,
      book:books (*)
    `)
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })

  if (pitchesError) throw pitchesError

  return {
    user: userData,
    pitches: ((pitches as Array<Pitch & { book: Book }>) || []).map(p => ({
      ...p,
      book: p.book
    }))
  }
}

export async function searchBooks(query: string): Promise<BookWithStats[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('book_with_stats')
    .select('*')
    .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
    .order('avg_rating', { ascending: false, nullsFirst: false })

  if (error) throw error
  return (data as BookWithStats[]) || []
}
