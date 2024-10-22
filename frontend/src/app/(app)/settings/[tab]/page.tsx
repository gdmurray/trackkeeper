'use client'

import { SettingsPage, SettingsTab } from '@/components/settings/settings-page'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function Settings() {
  const params = useParams()
  const tab = params.tab as SettingsTab
  return <SettingsPage activeTab={tab} />
}
