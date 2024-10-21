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
    <Card>
      <CardHeader>
        <CardTitle>Snapshots</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Number of Songs</TableHead>
              <TableHead>Playlist Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((snapshot) => (
              <TableRow key={snapshot.id}>
                <TableCell>
                  {dayjs(snapshot.created_at).format('MMM D, YYYY h:mm A')}
                </TableCell>
                <TableCell>{snapshot.song_count}</TableCell>
                <TableCell>{snapshot.playlist_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Snapshots</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center space-y-4'>
        <BookOpen className='h-12 w-12 text-muted-foreground' />
        <p className='text-center text-muted-foreground'>
          No snapshots available yet.
        </p>
      </CardContent>
    </Card>
  )
}

function SnapshotsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Snapshots</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Number of Songs</TableHead>
              <TableHead>Playlist Name</TableHead>
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
      </CardContent>
    </Card>
  )
}
