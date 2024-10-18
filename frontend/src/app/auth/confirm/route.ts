import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // Set the session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Redirect with the session
        return NextResponse.redirect(new URL('/app', request.url), {
          status: 302,
          headers: {
            'Set-Cookie': `session=${JSON.stringify(session)}; Path=/; HttpOnly; SameSite=Strict`,
          },
        })
      }
    }
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect(new URL('/error', request.url))
}
