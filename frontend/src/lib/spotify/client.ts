import SpotifyWebApi from 'spotify-web-api-node'

export const scopes =
  'user-library-read user-read-email playlist-read-private playlist-modify-private playlist-modify-public user-top-read'

export const spotifyClient = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `${
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL
      ? process.env.NEXT_PUBLIC_BASE_URL
      : 'http://localhost:3001'
  }/api/auth/spotify/callback`,
})
