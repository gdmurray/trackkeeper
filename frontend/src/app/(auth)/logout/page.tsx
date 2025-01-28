'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signout } from '../signout'

export const dynamic = 'force-dynamic'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    signout().then(() => {
      router.push('/')
    })
  }, [router])

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-secondary/30'>
      <Loader2 className='w-8 h-8 animate-spin text-primary' />
      <p className='mt-4 text-lg font-medium'>Signing you out...</p>
    </div>
  )
}
