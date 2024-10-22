import SpotifyWebApi from 'spotify-web-api-node'

export const scopes =
  'user-library-read user-read-email playlist-read-private playlist-modify-private playlist-modify-public user-top-read'

function getRedirectUri() {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    console.log('VERCEL URL: ', process.env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('BASE URL: ', process.env.NEXT_PUBLIC_BASE_URL)
    return `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  }
  console.log('Using Localhost:3001')
  return 'http://localhost:3001'
}
export const spotifyClient = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `${getRedirectUri()}/api/auth/spotify/callback`,
})
