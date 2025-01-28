import { getBaseRedirectUri } from '@/lib/get-base-redirect-uri'
import { scopes } from '@/lib/spotify/client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function useAuthFlow() {
  const [error, setError] = useState<string | undefined>(undefined)

  const handleLogin = async () => {
    setError(undefined)
    const supabase = createClient()
    const redirectUri = `${getBaseRedirectUri()}/api/auth/callback`
    console.log('Redirect URI: ', redirectUri)
    console.log('Redirect URI: ', redirectUri)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: redirectUri,
        scopes,
        queryParams: {
          auth_flow: 'mobile_debug',
        },
      },
    })
    if (error) {
      setError(error.message)
    }
  }

  return { handleLogin, error }
}
