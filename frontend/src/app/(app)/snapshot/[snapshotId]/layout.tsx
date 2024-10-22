import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SnapshotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className='flex-grow container mx-auto px-4 py-8'>
      <div>
        <Link
          href='/dashboard'
          className='flex items-center text-sm text-muted-foreground hover:underline mb-4'
        >
          <ArrowLeft className='w-3 h-3 mr-1' /> Back to Dashboard
        </Link>
      </div>
      {children}
    </main>
  )
}
