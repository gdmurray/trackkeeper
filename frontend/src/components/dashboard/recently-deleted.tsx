'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
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
import { DeletedSongsResponse } from '@/app/api/deleted/route'
import { Music } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import { ErrorAlert } from '../error-alert'

const deletedSongsData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Song ${i + 1}`,
  artist: `Artist ${i + 1}`,
  deletedDate: new Date(Date.now() - Math.random() * 10000000000)
    .toISOString()
    .split('T')[0],
}))

async function fetchDeletedSongs(): Promise<DeletedSongsResponse> {
  const res = await fetch('/api/deleted')
  return res.json()
}

export function RecentlyDeleted() {
  const {
    data: deletedSongs,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['recently-deleted'],
    queryFn: fetchDeletedSongs,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  if (isLoading) return <RecentlyDeletedSkeleton />
  if (error) return <ErrorAlert message={error.message} retry={refetch} />
  if (!deletedSongs || deletedSongs.data.length === 0) return <EmptyState />

  const paginatedSongs = deletedSongs.data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Deleted</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Deleted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSongs?.map((song) => (
              <TableRow key={song.id}>
                <TableCell>{song.track_id}</TableCell>
                <TableCell>{song.playlist}</TableCell>
                <TableCell>{song.removed_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='flex justify-between items-center mt-4'>
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of{' '}
            {Math.ceil(deletedSongsData.length / itemsPerPage)}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(deletedSongsData.length / itemsPerPage)
                )
              )
            }
            disabled={
              currentPage === Math.ceil(deletedSongsData.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
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
        <Music className='h-12 w-12 text-muted-foreground' />
        <p className='text-center text-muted-foreground'>
          No recently deleted songs.
        </p>
      </CardContent>
    </Card>
  )
}

function RecentlyDeletedSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Deleted</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Deleted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className='h-4 w-[100px]' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-[80px]' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-[60px]' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='flex justify-between items-center mt-4'>
          <Skeleton className='h-10 w-[100px]' />
          <Skeleton className='h-4 w-[100px]' />
          <Skeleton className='h-10 w-[100px]' />
        </div>
      </CardContent>
    </Card>
  )
}
