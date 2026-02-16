import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') ?? '/'

  // Handle missing code - redirect to login
  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = await createClient()

  // Exchange code for session using PKCE
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Handle error - redirect to login with error message
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(loginUrl)
  }

  // Success - redirect to original destination or home
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
