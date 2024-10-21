import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // console.log('SESSION: ', session)
  const isHomePage =
    request.nextUrl.pathname === '/' || request.nextUrl.pathname === ''

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/signup')

  // console.log('Is Home Page: ', isHomePage)
  // console.log('Is Auth Page: ', isAuthPage)
  if (!session && isHomePage) {
    return response
  }

  if (session && isHomePage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
