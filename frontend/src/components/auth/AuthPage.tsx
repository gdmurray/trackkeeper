'use client'

import { Music } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { useAuthFlow } from './useAuthFlow'
import { Button } from '../ui/button'
import { SpotifyFilled } from '@ant-design/icons'
import { ErrorAlert } from '../error-alert'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { AuthErrorHandler } from './auth-error-handler'

type AuthPageProps = {
  login?: boolean
}
export const AuthPage = ({ login }: AuthPageProps) => {
  const router = useRouter()
  const { handleLogin, error } = useAuthFlow()
  return (
    <div className='flex items-center justify-center min-h-screen bg-secondary/30'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-center mb-4'>
            <Music className='h-12 w-12 text-primary' />
          </div>
          <CardTitle className='text-2xl font-bold text-center'>
            {login ? 'Welcome back to TrackKeeper' : 'Sign up for TrackKeeper'}
          </CardTitle>
          <CardDescription className='text-center'>
            {login
              ? 'Log in with your Spotify account to continue'
              : 'Create an account to start tracking your Spotify history'}
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
            {login ? 'By logging in' : 'By signing up'}, you agree to our Terms
            of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
