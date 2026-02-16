import { Suspense } from 'react'
import CheckEmailContent from './CheckEmailContent'

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<CheckEmailLoading />}>
      <CheckEmailContent />
    </Suspense>
  )
}

function CheckEmailLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 space-y-6">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-16 w-16 bg-warm-bg rounded-full mx-auto"></div>
              <div className="h-8 bg-warm-bg rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-warm-bg rounded w-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

