'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Snapshots } from '@/components/dashboard/snapshots'
import { RecentlyDeleted } from '@/components/dashboard/recently-deleted'

export const dynamic = 'force-dynamic'

const deletedSongsData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Song ${i + 1}`,
  artist: `Artist ${i + 1}`,
  deletedDate: new Date(Date.now() - Math.random() * 10000000000)
    .toISOString()
    .split('T')[0],
}))

export default function Dashboard() {
  return (
    <div className='space-y-8'>
      <Snapshots />
      <RecentlyDeleted />
    </div>
  )
}
