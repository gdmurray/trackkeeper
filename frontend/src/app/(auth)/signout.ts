'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function signout() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
}
