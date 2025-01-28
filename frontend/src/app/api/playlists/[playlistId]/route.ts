import { createServerClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/types/database.types'
import { NextRequest, NextResponse } from 'next/server'

export type PlaylistDetailResponse = {
  playlist: Tables<'Tracked Playlists'>
  snapshots: Tables<'Library Snapshots'>[]
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ playlistId: string }> }
) {
  const params = await props.params
  const supabase = await createServerClient()

  console.log('Params: ', params)
  const playlistId = parseInt(params.playlistId)

  console.log('PlaylistId: ', playlistId)
  const { data: playlist, error: playlistError } = await supabase
    .from('Tracked Playlists')
    .select('*')
    .eq('id', playlistId)
    .single()

  if (playlistError) {
    return NextResponse.json({ error: playlistError.message }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('Library Snapshots')
    .select('*')
    .eq('playlist_id', parseInt(params.playlistId))
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: PlaylistDetailResponse = {
    playlist: playlist,
    snapshots: data,
  }

  return NextResponse.json(response, {
    status: 200,
    // headers: {
    //   'Cache-Control': 'max-age=60',
    // },
  })
}
