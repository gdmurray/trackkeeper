import { spotifyClient } from '@/lib/spotify/client'
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const CACHE_TIMEOUT_DAYS = 7
const MS_PER_DAY = 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  const { trackIds } = await request.json()

  const supabase = createServerClient()

  const { data: cachedTracks, error: cachedTracksError } = await supabase
    .from('Cached Tracks')
    .select('*')
    .in('id', trackIds)

  if (cachedTracksError) {
    console.error('Error fetching cached tracks:', cachedTracksError)
    return NextResponse.json(
      { error: 'Error fetching cached tracks' },
      { status: 500 }
    )
  }

  const now = new Date()
  const cacheTimeout = now.getTime() - CACHE_TIMEOUT_DAYS * MS_PER_DAY

  const freshCachedTracks =
    cachedTracks?.filter(
      (track) =>
        track.updated_at != null &&
        new Date(track.updated_at).getTime() > cacheTimeout
    ) || []

  const cachedTrackIds = new Set(
    freshCachedTracks.map((track) => track.track_id)
  )
  const uncachedTrackIds = trackIds.filter(
    (id: string) => !cachedTrackIds.has(id)
  )

  let newTracks = []
  if (uncachedTrackIds.length > 0) {
    const spotifyTracks = await spotifyClient.getTracks(uncachedTrackIds)

    newTracks = spotifyTracks.body.tracks.map((track) => ({
      track_id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: getSmallestImage(track.album.images),
      updated_at: now.toISOString(),
    }))
  }

  return NextResponse.json(uncachedTrackIds)
}

function getSmallestImage(images: SpotifyApi.ImageObject[]): string | null {
  if (!images || images.length === 0) {
    return null // Fallback image URL
  }

  const smallestImage = images.reduce((smallest, current) => {
    // If width is not available, assume it's larger
    const smallestWidth = smallest.width || Number.MAX_SAFE_INTEGER
    const currentWidth = current.width || Number.MAX_SAFE_INTEGER

    return currentWidth < smallestWidth ? current : smallest
  })

  return smallestImage.url
}
