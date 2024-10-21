import { createServerClient } from '@/lib/supabase/server'
import { spotifyClient } from './client'

export async function getAuthenticatedUserClient() {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const { data: spotifyAccess, error: spotifyAccessError } = await supabase
    .from('Spotify Access')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  console.log('Fetched Spotify Access Data: ', spotifyAccess)

  if (spotifyAccessError || !spotifyAccess) {
    throw new Error('Spotify Access Not Found')
  }

  const now = new Date()
  const expiresAt = new Date(spotifyAccess.expires_at!)

  console.log('Expires At: ', expiresAt)
  if (expiresAt <= now) {
    console.log('Refreshing Token')
    try {
      spotifyClient.setRefreshToken(spotifyAccess.refresh_token)
      const data = await spotifyClient.refreshAccessToken()

      // Update the database with the new token
      const { error } = await supabase
        .from('Spotify Access')
        .update({
          access_token: data.body['access_token'],
          expires_at: new Date(
            Date.now() + data.body['expires_in'] * 1000
          ).toISOString(),
        })
        .eq('user_id', user.id)

      if (error) {
        throw new Error('Failed to update token in database')
      }

      spotifyClient.setAccessToken(data.body['access_token'])
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw new Error('Failed to refresh Spotify token')
    }
  } else {
    console.log('Token Not Expired')
    console.log('Setting Access Token: ', spotifyAccess.access_token)
    spotifyClient.setAccessToken(spotifyAccess.access_token)
  }

  return spotifyClient
}
