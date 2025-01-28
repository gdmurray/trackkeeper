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
import { Button } from '../ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

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

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  const paginatedSnapshots = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(data.length / itemsPerPage)
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
        <TooltipProvider>
          <TableBody>
            {paginatedSnapshots.map((snapshot) => (
              <TableRow key={snapshot.id}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/snapshot/${snapshot.id}`}
                        className='hover:underline'
                      >
                        {dayjs(snapshot.created_at).format(
                          'MMM D, YYYY h:mm A'
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>View Tracks in Snapshot</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        className='hover:underline'
                        href={`/playlist/${snapshot.playlist_id}`}
                      >
                        {snapshot.tracked_playlist.playlist_name}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>View Playlist History</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>{snapshot.song_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TooltipProvider>
      </Table>
      {totalPages > 1 && (
        <Pagination className='mt-4 justify-end'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                // disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                // disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
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
      <Button variant='outline' asChild>
        <Link href='/settings/playlists'>
          Click here to configure snapshots.
        </Link>
      </Button>
      {/* <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>OR</span>
        </div>
      </div>
      <Button variant='default'>Create Snapshot</Button> */}
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
