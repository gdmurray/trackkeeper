'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Music } from 'lucide-react'
import { SpotifyFilled } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { ErrorAlert } from '@/components/error-alert'
import { scopes } from '@/lib/spotify/client'
import { getBaseRedirectUri } from '@/lib/get-base-redirect-uri'
import { AuthErrorHandler } from '@/components/auth/auth-error-handler'

export default function Login() {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(undefined)

  const handleLogin = async () => {
    setError(undefined)
    const supabase = createClient()
    const redirectUri = `${getBaseRedirectUri()}/api/auth/callback`
    console.log('Redirect URI: ', redirectUri)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: redirectUri,
        scopes,
      },
    })
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-secondary/30'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-center mb-4'>
            <Music className='h-12 w-12 text-primary' />
          </div>
          <CardTitle className='text-2xl font-bold text-center'>
            Welcome back to TrackKeeper
          </CardTitle>
          <CardDescription className='text-center'>
            Log in with your Spotify account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Button
            type='button'
            variant='outline'
            className='w-full bg-spotify text-white hover:bg-spotify/80'
            onClick={handleLogin}
          >
            <SpotifyFilled className='text-white mr-2' />
            Log in with Spotify
          </Button>
          {error && (
            <ErrorAlert
              message={error}
              retry={() => {
                router.push('/login')
                router.refresh()
              }}
              retryText='Reload'
            />
          )}
          <Suspense fallback={<></>}>
            <AuthErrorHandler />
          </Suspense>
        </CardContent>
        <CardFooter>
          <p className='text-xs text-center text-muted-foreground w-full'>
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
