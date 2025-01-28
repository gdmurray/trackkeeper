'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function signout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
}
