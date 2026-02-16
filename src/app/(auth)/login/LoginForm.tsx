'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type LoginMode = 'password' | 'magic-link'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const [mode, setMode] = useState<LoginMode>('password')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  // Client-side validation
  const validate = () => {
    const newErrors: typeof errors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (mode === 'password' && !formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validate form
    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password' })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      if (data.user) {
        // Success - redirect to original page or home
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validate email only
    if (!formData.email) {
      setErrors({ email: 'Email is required' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      })

      if (error) {
        setErrors({ general: error.message })
        return
      }

      // Success - show confirmation message
      setMagicLinkSent(true)
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = mode === 'password' ? handlePasswordLogin : handleMagicLinkLogin

  // If magic link was sent, show confirmation message
  if (magicLinkSent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="card p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Check Your Email</h1>
              <p className="text-muted text-sm">
                We've sent a magic link to <span className="font-medium text-foreground">{formData.email}</span>
              </p>
              <p className="text-muted text-sm">
                Click the link in the email to sign in. The link will expire in 1 hour.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setMagicLinkSent(false)
                  setFormData({ email: '', password: '' })
                  setMode('password')
                }}
                className="w-full bg-warm-border text-foreground py-2 px-4 rounded-md font-medium hover:bg-warm-border/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted text-sm">
              {mode === 'password'
                ? 'Sign in to your account'
                : "We'll send you a magic link to sign in"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General error */}
            {errors.general && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.email ? 'border-red-500' : 'border-warm-border'
                }`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password field - only show in password mode */}
            {mode === 'password' && (
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.password ? 'border-red-500' : 'border-warm-border'
                  }`}
                  placeholder="Your password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-white py-2 px-4 rounded-md font-medium hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading
                ? (mode === 'password' ? 'Signing in...' : 'Sending magic link...')
                : (mode === 'password' ? 'Sign In' : 'Send Magic Link')}
            </button>

            {/* Toggle mode link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'password' ? 'magic-link' : 'password')
                  setErrors({})
                  setFormData({ ...formData, password: '' })
                }}
                className="text-sm text-accent hover:underline"
                disabled={isLoading}
              >
                {mode === 'password'
                  ? 'Sign in without password'
                  : 'Sign in with password instead'}
              </button>
            </div>
          </form>

          {/* Signup link */}
          <div className="text-center text-sm">
            <span className="text-muted">Don't have an account? </span>
            <Link
              href="/signup"
              className="text-accent font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
