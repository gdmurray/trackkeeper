'use client'

import { useState } from 'react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Music, AlertCircle } from 'lucide-react'
import { SpotifyFilled } from '@ant-design/icons'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'user-library-read user-read-email',
        },
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
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
            variant='outline'
            className='w-full bg-spotify text-white hover:bg-spotify/80'
            onClick={handleLogin}
          >
            <SpotifyFilled className='text-white mr-2' />
            Log in with Spotify
          </Button>
        </CardContent>
        <CardFooter>
          <p className='text-xs text-center text-muted-foreground w-full'>
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
      {error && (
        <Alert variant='destructive' className='mt-4 max-w-md'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
