import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

export default async function Navigation() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 bg-warm-bg/95 backdrop-blur-sm border-b border-warm-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-accent">
            Book Pitches
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/books"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Categories
            </Link>
            {user ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Logout
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
