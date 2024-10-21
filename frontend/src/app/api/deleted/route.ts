import { createServerClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/types/database.types'
import { NextResponse } from 'next/server'

type DeletedSong = Tables<'Deleted Songs'>

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
    .select('*')
    .eq('user_id', user.id)
    .order('removed_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
