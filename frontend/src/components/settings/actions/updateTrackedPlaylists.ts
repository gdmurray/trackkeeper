'use server'

import { TablesInsert, TablesUpdate } from '@/lib/types/database.types'
import { createServerClient } from '@/lib/supabase/server'

// type TrackedPlaylist = Tables<'Tracked Playlists'>

type TrackedPlaylistInsert = TablesInsert<'Tracked Playlists'>
type TrackedPlaylistUpdate = TablesUpdate<'Tracked Playlists'>

export async function updateTrackedPlaylists(
  formData: (TrackedPlaylistInsert | TrackedPlaylistUpdate)[]
) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('User Not Authenticated')
    return {
      success: false,
      error: 'User Not Authenticated',
      status: 401,
    }
  }

  const operations = formData.reduce<{
    updated: TrackedPlaylistUpdate[]
    added: TrackedPlaylistInsert[]
  }>(
    (acc, playlist) => {
      if (playlist.id == null) {
        // const
        const { id: _id, ...rest } = playlist

        acc.added.push({
          ...rest,
          user_id: user.id,
          playlist_id: playlist.playlist_id!,
          playlist_name: playlist.playlist_name!,
        })
      } else {
        acc.updated.push({ ...playlist, user_id: user.id })
      }
      return acc
    },
    { updated: [], added: [] }
  )

  if (operations.added.length > 0) {
    const { error: addedError } = await supabase
      .from('Tracked Playlists')
      .insert(operations.added)

    if (addedError) {
      console.error(addedError)
      return {
        success: false,
        error: addedError.message,
        status: 500,
      }
    }
  }

  if (operations.updated.length > 0) {
    const updatePromises = operations.updated.map((playlist) =>
      supabase.from('Tracked Playlists').update(playlist).eq('id', playlist.id!)
    )

    const updateResults = await Promise.all(updatePromises)

    const updateErrors = updateResults
      .filter((result) => result.error)
      .map((result) => result.error)

    if (updateErrors.length > 0) {
      console.error('Errors updating playlists:', updateErrors)
      return {
        success: false,
        error: 'Error updating one or more playlists',
        status: 500,
      }
    }
  }

  return { success: true, status: 200 }
}
