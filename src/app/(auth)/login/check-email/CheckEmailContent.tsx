'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CheckEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')

  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Redirect to login if no email param
  useEffect(() => {
    if (!email) {
      router.push('/login')
    }
  }, [email, router])

  const handleResend = async () => {
    if (!email) return

    setIsResending(true)
    setResendError(null)
    setResendSuccess(false)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Check if it's a rate limit error
        if (error.message.includes('Email rate limit exceeded')) {
          setResendError('Please wait 60 seconds before requesting another link.')
        } else {
          setResendError(error.message)
        }
        return
      }

      // Success
      setResendSuccess(true)
      // Clear success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      setResendError(
        err instanceof Error ? err.message : 'Failed to resend magic link. Please try again.'
      )
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 space-y-6">
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-foreground">Check your email</h1>

            {/* Instructions */}
            <div className="space-y-2">
              <p className="text-muted">
                We've sent a magic link to
              </p>
              <p className="font-medium text-foreground">
                {email}
              </p>
              <p className="text-muted text-sm">
                Click the link in the email to sign in. You can close this page.
              </p>
            </div>
          </div>

          {/* Success message */}
          {resendSuccess && (
            <div className="rounded-md bg-green-50 border border-green-200 p-3">
              <p className="text-sm text-green-800">Magic link sent successfully!</p>
            </div>
          )}

          {/* Error message */}
          {resendError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{resendError}</p>
            </div>
          )}

          {/* Resend button */}
          <div className="pt-4 border-t border-warm-border">
            <div className="space-y-3">
              <p className="text-sm text-muted text-center">
                Didn't receive the email?
              </p>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full bg-warm-bg text-foreground border border-warm-border py-2 px-4 rounded-md font-medium hover:bg-warm-bg/70 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? 'Sending...' : 'Resend magic link'}
              </button>
              <p className="text-xs text-muted text-center">
                You can resend after 60 seconds
              </p>
            </div>
          </div>

          {/* Back to login */}
          <div className="text-center pt-2">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
