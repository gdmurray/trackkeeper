import { createServerClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/types/database.types'
import { NextResponse } from 'next/server'

type UserSettings = Tables<'User Settings'>
type LibrarySnapshot = Tables<'Library Snapshots'>
type TrackedPlaylist = Tables<'Tracked Playlists'>

export type SettingsResponse = {
  userSettings: UserSettings
  latestSnapshot: LibrarySnapshot
  trackedPlaylists: TrackedPlaylist[]
}

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

  let userSettings = null
  const { data: userSettingsData, error: userSettingsError } = await supabase
    .from('User Settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (userSettingsError && userSettingsError.code === 'PGRST116') {
    console.error('Error checking user settings:', userSettingsError)
  }
  userSettings = userSettingsData

  if (!userSettings) {
    const { data: createdUserSettings, error: insertUserSettingsError } =
      await supabase
        .from('User Settings')
        .insert({
          user_id: user.id,
        })
        .select()

    if (insertUserSettingsError) {
      console.error('Error inserting user settings:', insertUserSettingsError)
    }

    userSettings = createdUserSettings
  }
  const { data: latestSnapshot, error: latestSnapshotError } = await supabase
    .from('Library Snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (latestSnapshotError) {
    console.error(
      'Error fetching latest library snapshot:',
      latestSnapshotError
    )
  }

  const { data: trackedPlaylists, error: trackedPlaylistsError } =
    await supabase.from('Tracked Playlists').select('*').eq('user_id', user.id)

  if (trackedPlaylistsError) {
    console.error('Error fetching tracked playlists:', trackedPlaylistsError)
  }

  return NextResponse.json({
    userSettings,
    latestSnapshot,
    trackedPlaylists,
  })
}
