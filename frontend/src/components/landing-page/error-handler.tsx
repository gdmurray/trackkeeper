'use client'

import { useSearchParams } from 'next/navigation'

class LoginError extends Error {
  digest?: string
  email?: string
  constructor(message: string, digest?: string, email?: string) {
    super(message)
    this.name = 'LoginError'
    this.digest = digest
    this.email = email
  }
}

export const SPOTIFY_APP_AUTHORIZATION_DIGEST = 'SPOTIFY_APP_AUTHORIZATION'

export function AppErrorHandler() {
  const searchParams = useSearchParams()
  console.log('SEARCH PARAMS: ', searchParams)
  console.log(searchParams.toString())
  if (searchParams.get('error')) {
    const errorDescription =
      searchParams.get('error_description') ?? 'Error Signing In'
    console.log('ERROR DESCRIPTION: ', errorDescription)
    if (errorDescription.endsWith('not authorized')) {
      const match = errorDescription.match(/"([^"]*)"/)
      const email = match ? match[1] : undefined
      const error = new LoginError(
        errorDescription,
        SPOTIFY_APP_AUTHORIZATION_DIGEST,
        email
      )
      throw error
    }
    const error = new Error(errorDescription)
    throw error
  }
  return <></>
}
