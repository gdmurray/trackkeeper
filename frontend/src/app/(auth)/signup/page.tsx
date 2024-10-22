'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
import { scopes } from '@/lib/spotify/client'
import { getBaseRedirectUri } from '@/lib/get-base-redirect-uri'

export default function SignUp() {
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleSpotifySignUp = async () => {
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
            Sign up for TrackKeeper
          </CardTitle>
          <CardDescription className='text-center'>
            Create an account to start tracking your Spotify history
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                Continue with
              </span>
            </div>
          </div>
          <Button
            variant='outline'
            className='w-full bg-spotify text-white hover:bg-spotify/80'
            onClick={handleSpotifySignUp}
          >
            <SpotifyFilled className='text-white mr-2' />
            Sign up with Spotify
          </Button>
        </CardContent>
        <CardFooter>
          <p className='text-xs text-center text-muted-foreground w-full'>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
      {error && (
        <Alert variant='destructive' className='mt-4 max-w-md'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
