import { createServerClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/types/database.types'
import { NextResponse } from 'next/server'

type DeletedSong = Tables<'Deleted Songs'> & {
  track: Tables<'Cached Tracks'>
  playlist: Tables<'Tracked Playlists'>
}

export type DeletedSongsResponse = {
  data: DeletedSong[]
}

export async function GET() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'User Not Authenticated' },
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('Deleted Songs')
    .select(
      `
      *,
      track:"Cached Tracks"(*),
      playlist:"Tracked Playlists"(*)`
    )
    .eq('user_id', user.id)
    .eq('active', true)
    .order('removed_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    { data },
    {
      status: 200,
      headers: {
        'Cache-Control': 'max-age=60',
      },
    }
  )
}
