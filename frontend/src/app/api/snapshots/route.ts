import { createServerClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/types/database.types'
import { NextResponse } from 'next/server'

type LibrarySnapshot = Tables<'Library Snapshots'> & {
  tracked_playlist: Tables<'Tracked Playlists'>
}

export type SnapshotsResponse = {
  data: LibrarySnapshot[]
}

export async function GET() {
  try {
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

    console.log('User: ', user, user.id)

    const { data, error } = await supabase
      .from('Library Snapshots')
      .select(
        `
      *,
      tracked_playlist:"Tracked Playlists" (*)`
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    console.log('Data: ', data)
    return NextResponse.json(
      {
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'max-age=300, s-maxage=300, stale-while-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching snapshots: ', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
