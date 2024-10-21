'use client'

import {
  AnalysisSettings,
  AnalysisSettingsLoading,
} from '@/components/settings/analysis-settings'
import {
  PlaylistManagement,
  PlaylistManagementLoading,
} from '@/components/settings/playlist-management'
import {
  TrackedPlaylists,
  TrackedPlaylistsLoading,
} from '@/components/settings/tracked-playlists'
import {
  AccountManagement,
  AccountManagementLoading,
} from '@/components/settings/account-management'
import { useQuery } from '@tanstack/react-query'
import { SettingsResponse } from '@/app/api/settings/route'
import { ErrorAlert } from '@/components/error-alert'
import { PlaylistResponse } from '@/app/api/settings/playlists/route'

export const dynamic = 'force-dynamic'

async function fetchSettings(): Promise<{
  settings: SettingsResponse
  playlists: PlaylistResponse
}> {
  const [settingsRes, playlistsRes] = await Promise.all([
    fetch('/api/settings'),
    fetch('/api/settings/playlists'),
  ])
  const [settings, playlists] = await Promise.all([
    settingsRes.json(),
    playlistsRes.json(),
  ])
  return { settings, playlists }
}

export default function Settings() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })

  if (isLoading)
    return (
      <div className='space-y-8'>
        <AnalysisSettingsLoading />
        <PlaylistManagementLoading />
        <TrackedPlaylistsLoading />
        <AccountManagementLoading />
      </div>
    )
  if (error)
    return (
      <ErrorAlert
        message={error.message ?? 'An unknown error occurred'}
        retry={refetch}
      />
    )
  if (!data) return <ErrorAlert message='No settings found' retry={refetch} />
  return (
    <div className='space-y-8'>
      <AnalysisSettings settings={data.settings} />
      <PlaylistManagement settings={data.settings} />
      <TrackedPlaylists playlists={data.playlists} settings={data.settings} />
      <AccountManagement settings={data.settings} />
    </div>
  )
}
