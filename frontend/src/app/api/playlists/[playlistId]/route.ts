import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('Library Snapshots')
    .select('*')
    .eq('playlist_id', parseInt(params.playlistId))
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'max-age=60',
    },
  })
}
