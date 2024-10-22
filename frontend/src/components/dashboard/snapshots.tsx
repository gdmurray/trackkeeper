'use client'

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '../ui/table'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '../ui/skeleton'
import { BookOpen } from 'lucide-react'
import dayjs from 'dayjs'
import { ErrorAlert } from '../error-alert'
import { SnapshotsResponse } from '@/app/api/snapshots/route'
import Link from 'next/link'

async function fetchSnapshots(): Promise<SnapshotsResponse> {
  const res = await fetch('/api/snapshots')
  if (!res.ok) {
    throw new Error('Failed to fetch snapshots')
  }
  return res.json()
}

export function Snapshots() {
  const {
    data: snapshots,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['snapshots'],
    queryFn: () => fetchSnapshots(),
  })

  if (isLoading) return <SnapshotsSkeleton />
  if (error)
    return (
      <ErrorAlert
        message={
          error instanceof Error ? error.message : 'An unknown error occurred'
        }
      />
    )
  if (!snapshots || snapshots.data.length === 0) return <EmptyState />

  const { data } = snapshots
  return (
    <SnapshotsCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Playlist Name</TableHead>
            <TableHead>Number of Songs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((snapshot) => (
            <TableRow key={snapshot.id}>
              <TableCell>
                <Link
                  href={`/snapshot/${snapshot.id}`}
                  className='hover:underline'
                >
                  {dayjs(snapshot.created_at).format('MMM D, YYYY h:mm A')}
                </Link>
              </TableCell>
              <TableCell>{snapshot.tracked_playlist.playlist_name}</TableCell>
              <TableCell>{snapshot.song_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SnapshotsCard>
  )
}

function EmptyState() {
  return (
    <SnapshotsCard>
      <BookOpen className='h-12 w-12 text-muted-foreground' />
      <p className='text-center text-muted-foreground'>
        No snapshots available yet.
      </p>
    </SnapshotsCard>
  )
}

const SnapshotsCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Snapshots</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center space-y-4'>
        {children}
      </CardContent>
    </Card>
  )
}

function SnapshotsSkeleton() {
  return (
    <SnapshotsCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Playlist Name</TableHead>
            <TableHead>Number of Songs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className='h-4 w-[100px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[50px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[50px]' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SnapshotsCard>
  )
}
