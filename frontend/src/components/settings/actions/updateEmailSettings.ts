'use server'

import { createServerClient } from '@/lib/supabase/server'

type UpdateEmailSettingsFormData = {
  suggestion_emails: boolean
}

export async function updateEmailSettings(data: UpdateEmailSettingsFormData) {
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

  const { suggestion_emails } = data

  const { error } = await supabase
    .from('User Settings')
    .update({ suggestion_emails })
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
