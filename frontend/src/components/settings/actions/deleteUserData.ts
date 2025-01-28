'use server'

import { ServerFunctionResponse } from '@/lib/serverFunction'
import { createServerClient } from '@/lib/supabase/server'

type DeleteUserDataFormData = {
  deleteSnapshots: boolean
  deleteRemovedSongs: boolean
  deleteTrackedPlaylists: boolean
}

type DeleteUserDataResult = {
  deleteSnapshots: {
    status: 'success' | 'error' | 'skipped' | string
    message: string
  }
  deleteRemovedSongs: {
    status: 'success' | 'error' | 'skipped' | string
    message: string
  }
  deleteTrackedPlaylists: {
    status: 'success' | 'error' | 'skipped' | string
    message: string
  }
}

type Response = ServerFunctionResponse<DeleteUserDataResult>

export async function deleteUserData(
  formData: DeleteUserDataFormData
): Promise<Response> {
  const supabase = await createServerClient()
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

  const deleteResult = {
    deleteSnapshots: {
      status: 'skipped',
      message: '',
    },
    deleteRemovedSongs: {
      status: 'skipped',
      message: '',
    },
    deleteTrackedPlaylists: {
      status: 'skipped',
      message: '',
    },
  }

  if (formData.deleteSnapshots) {
    const { error: deleteSnapshotsStorageError } = await supabase.storage
      .from('user-snapshots')
      .remove([user.id])
    if (deleteSnapshotsStorageError) {
      console.error(deleteSnapshotsStorageError)
      deleteResult.deleteSnapshots = {
        status: 'error',
        message: 'Unable to delete snapshots from storage',
      }
    } else {
      const { error: deleteSnapshotsDbError } = await supabase
        .from('Library Snapshots')
        .delete()
        .eq('user_id', user.id)
      if (deleteSnapshotsDbError) {
        console.error(deleteSnapshotsDbError)
        deleteResult.deleteSnapshots = {
          status: 'error',
          message: 'Unable to delete snapshots from database',
        }
      }
    }
    // After all snapshots are deleted, set status to success
    if (deleteResult.deleteSnapshots.status === 'skipped') {
      deleteResult.deleteSnapshots.status = 'success'
    }
  }

  if (formData.deleteRemovedSongs) {
    const { error: deleteRemovedSongsDbError } = await supabase
      .from('Deleted Songs')
      .delete()
      .eq('user_id', user.id)
    if (deleteRemovedSongsDbError) {
      console.error(deleteRemovedSongsDbError)
      deleteResult.deleteRemovedSongs = {
        status: 'error',
        message: 'Unable to delete removed songs from database',
      }
    } else {
      deleteResult.deleteRemovedSongs.status = 'success'
    }
  }

  if (formData.deleteTrackedPlaylists) {
    const { error: deleteTrackedPlaylistsDbError } = await supabase
      .from('Tracked Playlists')
      .delete()
      .eq('user_id', user.id)
    if (deleteTrackedPlaylistsDbError) {
      console.error(deleteTrackedPlaylistsDbError)
      deleteResult.deleteTrackedPlaylists = {
        status: 'error',
        message: 'Unable to delete tracked playlists from database',
      }
    } else {
      deleteResult.deleteTrackedPlaylists.status = 'success'
    }
  }

  return {
    success: true,
    status: 200,
    data: deleteResult,
  }
}
