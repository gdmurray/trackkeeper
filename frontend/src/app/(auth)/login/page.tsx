'use client'

import { useEffect, useState } from 'react'
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
import { useParams, useRouter } from 'next/navigation'
import { ErrorAlert } from '@/components/error-alert'
import { scopes } from '@/lib/spotify/client'

export default function Login() {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(undefined)
  const params = useParams()

  useEffect(() => {
    setError(undefined)
  }, [])

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    console.log('Hash: ', hash)
    const searchParams = new URLSearchParams(hash)
    if (searchParams.get('error')) {
      const errorDescription = searchParams.get('error_description')
      const cleanedError = errorDescription?.split('%3A')[0].replace(/\+/g, ' ')
      setError(cleanedError ?? undefined)
      // setError(searchParams.get('error'))
    }
  }, [params])
  const handleLogin = async () => {
    setError(undefined)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
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
