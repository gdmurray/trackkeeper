'use server'

import { ServerFunctionResponse } from '@/lib/serverFunction'
import { createServerClient } from '@/lib/supabase/server'

type PlaylistManagementFormValues = {
  remove_from_playlist: boolean
  playlist_persistence:
    | 'forever'
    | '30 days'
    | '90 days'
    | '180 days'
    | '1 year'
}

export async function updatePlaylistManagement(
  formData: PlaylistManagementFormValues
): Promise<ServerFunctionResponse> {
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

  const { remove_from_playlist, playlist_persistence } = formData

  const { error } = await supabase
    .from('User Settings')
    .update({ remove_from_playlist, playlist_persistence })
    .eq('user_id', user.id)

  if (error) {
    console.error(error)
    return {
      success: false,
      error: error.message,
      status: 500,
    }
  }

  return {
    success: true,
    status: 200,
  }
}
