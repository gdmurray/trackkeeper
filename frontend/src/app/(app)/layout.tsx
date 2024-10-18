import Link from 'next/link'
import { Music } from 'lucide-react'
import { UserDropdown } from '@/components/dashboard/user-dropdown'

import { createServerClient } from '@/lib/supabase/server'
import { UserProvider } from '@/components/auth/user-provider'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const cookieStore = cookies()
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <UserProvider initialUser={user}>
      <div className='min-h-screen flex flex-col'>
        <header className='border-b'>
          <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
            <Link href='/dashboard' className='flex items-center space-x-2'>
              <Music className='h-6 w-6 text-spotify' />
              <span className='text-2xl font-bold text-spotify'>
                TrackKeeper
              </span>
            </Link>
            <UserDropdown />
          </div>
        </header>
        <main className='flex-grow container mx-auto px-4 py-8'>
          {children}
        </main>
      </div>
    </UserProvider>
  )
}
