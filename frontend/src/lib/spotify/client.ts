import SpotifyWebApi from 'spotify-web-api-node'
import { getBaseRedirectUri } from '../get-base-redirect-uri'

export const scopes =
  'user-library-read user-read-email playlist-read-private playlist-modify-private playlist-modify-public user-top-read'

export const spotifyClient = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `${getBaseRedirectUri()}/api/auth/spotify/callback`,
})
