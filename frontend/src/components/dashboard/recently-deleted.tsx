'use client'

import { useState } from 'react'
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
import dayjs from 'dayjs'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '../ui/pagination'

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
  const totalPages = Math.ceil(deletedSongs.data.length / itemsPerPage)
  return (
    <RecentlyDeletedCard>
      <Table>
        <TableHeader>
          <TableRow className='[&>th]:px-2'>
            <TableHead className='w-10' />
            <TableHead>Title</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Playlist</TableHead>
            <TableHead>Deleted Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedSongs?.map((song) => (
            <TableRow key={song.id} className='[&>td]:p-2'>
              <TableCell className='w-10'>
                <img
                  src={song.track.image ?? undefined}
                  width={40}
                  height={40}
                  alt={song.track.name ?? ''}
                  className='w-5 h-5 rounded-full'
                />
              </TableCell>
              <TableCell>{song.track.name}</TableCell>
              <TableCell>{song.track.artist}</TableCell>
              <TableCell>{song.playlist.playlist_name}</TableCell>
              <TableCell>
                {dayjs(song.removed_at).format('MMM D, YYYY')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
    </RecentlyDeletedCard>
  )
}

function EmptyState() {
  return (
    <RecentlyDeletedCard>
      <Music className='h-12 w-12 text-muted-foreground' />
      <p className='text-center text-muted-foreground'>
        No recently deleted songs.
      </p>
    </RecentlyDeletedCard>
  )
}

const RecentlyDeletedCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Deleted</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center space-y-4'>
        {children}
      </CardContent>
    </Card>
  )
}

function RecentlyDeletedSkeleton() {
  return (
    <RecentlyDeletedCard>
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
      <Pagination className='mt-4 justify-end'>
        <PaginationContent>
          <PaginationItem>
            <Skeleton className='h-10 w-10' />
          </PaginationItem>
          {[...Array(5)].map((_, index) => (
            <PaginationItem key={index}>
              <Skeleton className='h-10 w-10' />
            </PaginationItem>
          ))}
          <PaginationItem>
            <Skeleton className='h-10 w-10' />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </RecentlyDeletedCard>
  )
}
