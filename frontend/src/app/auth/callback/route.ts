import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the Auth Helpers package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('REQUEST: ', request)

  if (code) {
    const supabase = createServerClient()
    const {
      error,
      data: { session },
    } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (session != null) {
        const { user, provider_token, provider_refresh_token } = session
        // Calculate expires_at (current time + 1 hour in UTC)
        const expiresAt = new Date(Date.now() + 3600000).toISOString() // 3600000 ms = 1 hour
        const { error: insertError } = await supabase
          .from('Spotify Access')
          .insert({
            user_id: user.id,
            access_token: provider_token,
            refresh_token: provider_refresh_token,
            expires_at: expiresAt,
          })
        if (insertError) {
          console.error('Error inserting Spotify Access token:', insertError)
        }
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth-error', request.url))
}
