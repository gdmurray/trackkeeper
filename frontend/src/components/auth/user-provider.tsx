'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

const UserContext = createContext<{ user: User | null }>({
  user: null,
})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: User | null
}) => {
  const [user, setUser] = useState<User | null>(initialUser)
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  )
}
