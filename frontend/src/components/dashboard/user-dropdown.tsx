'use client'

import { User, Home, Cog, LogOut } from 'lucide-react'
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

interface DetectionResult {
  isLikelyRandomId: boolean
  reason?: string
}

function isLikelyRandomId(str: string): DetectionResult {
  // If it contains special characters (like hyphens), likely intentional
  if (/[^a-zA-Z0-9]/.test(str)) {
    return { isLikelyRandomId: false, reason: 'Contains special characters' }
  }

  // If it's all numbers, likely random
  if (/^\d+$/.test(str)) {
    return { isLikelyRandomId: true, reason: 'All numbers' }
  }

  // If length is exactly 28 and alphanumeric, very likely a Spotify ID
  if (/^[a-z0-9]{28}$/.test(str)) {
    return { isLikelyRandomId: true, reason: 'Matches Spotify ID pattern' }
  }

  // Check for repeating patterns (like 'aa', '11', etc.)
  const repeatingPatterns = (str.match(/(.)\1+/g) || []).length
  if (repeatingPatterns > 2) {
    return { isLikelyRandomId: false, reason: 'Contains repeating patterns' }
  }

  // Check ratio of numbers to letters
  const numbers = str.match(/\d/g)?.length || 0
  const letters = str.match(/[a-zA-Z]/g)?.length || 0

  // If there's a mix of numbers and letters with no clear pattern
  if (numbers > 0 && letters > 0) {
    // If numbers make up more than 40% of the string, likely random
    const numberRatio = numbers / str.length
    if (numberRatio > 0.4) {
      return { isLikelyRandomId: true, reason: 'High number ratio' }
    }
  }

  // Check for common username patterns
  const commonPatterns = [
    /^[a-zA-Z]+\d{1,4}$/, // letters followed by a few numbers
    /^[a-zA-Z]{2,}[._-]?[a-zA-Z]{2,}$/, // word-word pattern
    /^[a-zA-Z]+$/, // just letters
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(str)) {
      return {
        isLikelyRandomId: false,
        reason: 'Matches common username pattern',
      }
    }
  }

  // If string is longer than 20 chars and has mixed case, likely random
  if (str.length > 20 && /[A-Z]/.test(str) && /[a-z]/.test(str)) {
    return { isLikelyRandomId: true, reason: 'Long with mixed case' }
  }

  return { isLikelyRandomId: false, reason: 'Default case' }
}

export const UserDropdown = () => {
  const { user } = useUser()

  const displayId = isLikelyRandomId(user?.user_metadata.provider_id)
    .isLikelyRandomId
    ? user?.user_metadata.email
    : user?.user_metadata.provider_id

  console.log(displayId)

  console.log('User: ', user)
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
            {displayId}
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
