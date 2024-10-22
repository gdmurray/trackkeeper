import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { gunzip } from 'zlib'
import { promisify } from 'util'
import { Tables } from '@/lib/types/database.types'

type Track = {
  id: string
  added_at: string
  album: string
  image: string
  name: string
}

type SnapshotWithPlaylist = Tables<'Library Snapshots'> & {
  tracked_playlist: Tables<'Tracked Playlists'>
}

export type SnapshotDetailResponse = {
  snapshot: SnapshotWithPlaylist
  tracks: Track[]
}

const gunzipAsync = promisify(gunzip)
export async function GET(
  request: NextRequest,
  { params }: { params: { snapshotId: string } }
) {
  console.log('Snapshot ID: ', params.snapshotId)
  const supabase = createServerClient()

  // Get the user's ID from the session
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the snapshot
  const { data: snapshot, error } = await supabase
    .from('Library Snapshots')
    .select(
      `
      *,
      tracked_playlist: "Tracked Playlists" (*)`
    )
    .eq('id', params.snapshotId)
    .single()

  if (error || !snapshot) {
    return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 })
  }

  // Check if the snapshot belongs to the current user
  if (snapshot.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  console.log('Snapshot: ', snapshot)

  // Download the gzipped data from Supabase storage
  const { data: gzippedData, error: downloadError } = await supabase.storage
    .from('user-snapshots')
    .download(`${snapshot.snapshot_id}`)

  if (downloadError || !gzippedData) {
    return NextResponse.json(
      { error: 'Failed to download snapshot data' },
      { status: 500 }
    )
  }

  const buffer = await gzippedData.arrayBuffer()
  const uncompressedData = await gunzipAsync(Buffer.from(buffer))
  const tracks = JSON.parse(uncompressedData.toString())

  return NextResponse.json(
    {
      snapshot,
      tracks,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  )
}
