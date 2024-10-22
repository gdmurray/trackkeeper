import { PlaylistResponse } from '@/app/api/settings/playlists/route'
import { SettingsResponse } from '@/app/api/settings/route'
import { useQuery } from '@tanstack/react-query'
import { AnalysisSettings, AnalysisSettingsLoading } from './analysis-settings'
import { ErrorAlert } from '../error-alert'
import {
  AccountManagementLoading,
  AccountManagement,
} from './account-management'
import {
  PlaylistManagementLoading,
  PlaylistManagement,
} from './playlist-management'
import { TrackedPlaylistsLoading, TrackedPlaylists } from './tracked-playlists'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const settingsTabs = {
  general: 'general',
  playlists: 'playlists',
  email: 'email',
  account: 'account',
} as const

export type SettingsTab = (typeof settingsTabs)[keyof typeof settingsTabs]

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

export const SettingsPage = ({ activeTab }: { activeTab: SettingsTab }) => {
  const router = useRouter()

  useEffect(() => {
    if (!Object.values(settingsTabs).includes(activeTab as SettingsTab)) {
      router.replace('/settings/general')
    }
  }, [activeTab, router])

  const handleTabChange = (value: string) => {
    router.replace(`/settings/${value}`)
  }
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <div className='w-full bg-muted'>
        <div className='container mx-auto w-full border-b border-border px-1 py-0.5'>
          <TabsList>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='playlists'>Playlists</TabsTrigger>
            <TabsTrigger value='email'>Email</TabsTrigger>
            <TabsTrigger value='account'>Account</TabsTrigger>
          </TabsList>
        </div>
      </div>
      <main className='flex-grow container mx-auto px-4 py-8'>
        <TabsContent value='general'>
          <div className='space-y-8'>
            {isLoading ? (
              <AnalysisSettingsLoading />
            ) : error ? (
              <ErrorAlert
                message={error.message ?? 'An unknown error occurred'}
                retry={refetch}
              />
            ) : (
              <AnalysisSettings settings={data!.settings} />
            )}
          </div>
        </TabsContent>
        <TabsContent value='playlists'>
          <div className='space-y-8'>
            {isLoading ? (
              <>
                <PlaylistManagementLoading />
                <TrackedPlaylistsLoading />
              </>
            ) : error ? (
              <ErrorAlert
                message={error.message ?? 'An unknown error occurred'}
                retry={refetch}
              />
            ) : (
              <>
                <PlaylistManagement settings={data!.settings} />
                <TrackedPlaylists
                  playlists={data!.playlists}
                  settings={data!.settings}
                />
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value='account'>
          <div className='space-y-8'>
            {isLoading ? (
              <AccountManagementLoading />
            ) : error ? (
              <ErrorAlert
                message={error.message ?? 'An unknown error occurred'}
                retry={refetch}
              />
            ) : (
              <AccountManagement settings={data!.settings} />
            )}
          </div>
        </TabsContent>
      </main>
    </Tabs>
  )
}
