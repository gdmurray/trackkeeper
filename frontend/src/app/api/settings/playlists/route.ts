import { getAuthenticatedUserClient } from '@/lib/spotify/get-authenticated-user-client'
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export type PlaylistResponse = SpotifyApi.PlaylistObjectSimplified[]
export async function GET() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'User Not Authenticated' },
      { status: 401 }
    )
  }

  const spotifyId = user.user_metadata.provider_id

  const client = await getAuthenticatedUserClient()
  let user_playlists: SpotifyApi.PlaylistObjectSimplified[] = []

  let playlists = await client.getUserPlaylists()
  user_playlists = user_playlists.concat(playlists.body.items)

  while (playlists.body.total > playlists.body.offset + playlists.body.limit) {
    playlists = await client.getUserPlaylists({
      limit: playlists.body.limit,
      offset: playlists.body.offset + playlists.body.limit,
    })
    user_playlists = user_playlists.concat(playlists.body.items)
  }

  const publicPlaylistExceptions = ['On Repeat', 'Release Radar']

  const finalPlaylists = user_playlists
    .filter(
      (playlist) =>
        playlist.owner.id === spotifyId ||
        publicPlaylistExceptions.includes(playlist.name)
    )
    .sort((a, b) => {
      if (a.owner.id !== spotifyId && b.owner.id === spotifyId) return -1
      if (a.owner.id === spotifyId && b.owner.id !== spotifyId) return 1
      return 0
    })

  console.log('Final Playlists: ', finalPlaylists)

  finalPlaylists.unshift({
    id: 'liked_songs',
    name: 'Liked Songs',
    collaborative: false,
    images: [{ url: '/liked-songs-logo.png', width: 60 }],
    owner: {
      id: spotifyId,
      external_urls: {
        spotify: '',
      },
      href: '',
      type: 'user',
      uri: '',
    },
    tracks: {
      href: '',
      total: 0,
    },
    description: '',
    public: false,
    type: 'playlist',
    snapshot_id: '',
    external_urls: {
      spotify: '',
    },
    uri: '',
    href: '',
  })

  return NextResponse.json(finalPlaylists, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
