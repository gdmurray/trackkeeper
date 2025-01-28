'use server'

import { ServerFunctionResponse } from '@/lib/serverFunction'
import { createServerClient } from '@/lib/supabase/server'

type UpdateAnalysisFormData = {
  snapshots_enabled: boolean
}

export async function updateAnalysis(
  formData: UpdateAnalysisFormData
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

  const { snapshots_enabled } = formData

  const { error } = await supabase
    .from('User Settings')
    .update({ snapshots_enabled })
    .eq('user_id', user.id)

  if (error) {
    console.error(error)
    return {
      success: false,
      error: error.message,
      status: 500,
    }
  }

  return { success: true, status: 200 }
}
