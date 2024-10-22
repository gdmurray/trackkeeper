'use client'

import { createClient } from '@/lib/supabase/client'
import { User, Home, Cog, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import Link from 'next/link'
import { useUser } from '../auth/user-provider'
import { SpotifyFilled } from '@ant-design/icons'
import { signout } from '@/app/(auth)/signout'

export const UserDropdown = () => {
  const router = useRouter()
  const { user } = useUser()

  const handleSignout = async () => {
    await signout()
    router.push('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <User className='h-4 w-4 text-primary flex-shrink-0' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <div className='flex flex-col space-y-1 px-2 py-1.5'>
          <p className='text-sm font-medium leading-none'>
            <SpotifyFilled className='text-spotify mr-2' />
            {user?.user_metadata.provider_id}
          </p>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link className='justify-between' href='/dashboard'>
            Home
            <Home className='w-4 h-4' />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className='justify-between' href='/settings/general'>
            Settings
            <Cog className='w-4 h-4' />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className='justify-between' href='/logout'>
            Sign Out
            <LogOut className='w-4 h-4 ml-2' />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
