'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { SPOTIFY_APP_AUTHORIZATION_DIGEST } from '@/components/landing-page/error-handler'
import { RequestAuthorizationButton } from '@/components/auth/request-authorization-button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; email?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error: ', error)
  }, [error])

  const router = useRouter()

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-background text-foreground container mx-auto'>
      <h1 className='text-4xl font-bold mb-4'>Oops! Something went wrong</h1>
      <p className='text-xl mb-8 text-muted-foreground max-w-lg'>
        {error.message ??
          "We're sorry, but an error occurred while processing your request."}
      </p>
      <div className='flex space-x-4'>
        {error?.digest === SPOTIFY_APP_AUTHORIZATION_DIGEST &&
        error.email != null ? (
          <RequestAuthorizationButton email={error.email} />
        ) : (
          <Button onClick={() => reset()} variant='default'>
            Try again
          </Button>
        )}

        <Button onClick={() => router.push('/')} variant='outline'>
          Go to homepage
        </Button>
      </div>
    </div>
  )
}
