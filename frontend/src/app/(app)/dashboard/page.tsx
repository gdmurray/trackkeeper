import { Snapshots } from '@/components/dashboard/snapshots'
import { RecentlyDeleted } from '@/components/dashboard/recently-deleted'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard | TrackKeeper',
  description:
    'View your Spotify library snapshots and recently deleted tracks.',
}

export default function Dashboard() {
  return (
    <div className='space-y-8'>
      <Snapshots />
      <RecentlyDeleted />
    </div>
  )
}
