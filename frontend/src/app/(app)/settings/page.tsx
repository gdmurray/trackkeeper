'use client'

import { AnalysisSettings } from '@/components/settings/analysis-settings'
import { PlaylistManagement } from '@/components/settings/playlist-management'
import { TrackedPlaylists } from '@/components/settings/tracked-playlists'
import { AccountManagement } from '@/components/settings/account-management'

export const dynamic = 'force-dynamic'

export default function Settings() {
  return (
    <div className='space-y-8'>
      <AnalysisSettings />
      <PlaylistManagement />
      <TrackedPlaylists />
      <AccountManagement />
    </div>
  )
}
