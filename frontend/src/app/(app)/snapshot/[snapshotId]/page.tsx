'use client'

import { SnapshotDetailResponse } from '@/app/api/snapshots/[snapshotId]/route'
import { ErrorAlert } from '@/components/error-alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

async function fetchSnapshot(
  snapshotId: string
): Promise<SnapshotDetailResponse> {
  const res = await fetch(`/api/snapshots/${snapshotId}`)
  return res.json()
}

export default function SnapshotPage({
  params,
}: {
  params: { snapshotId: string }
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['snapshot', params.snapshotId],
    queryFn: () => fetchSnapshot(params.snapshotId),
  })

  if (isLoading) return <LoadingComponent />
  if (error) return <ErrorAlert message={error.message} retry={refetch} />
  if (!data) return <div>No data</div>

  const paginatedSongs = data.tracks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(data.tracks.length / itemsPerPage)

  const playlistUrl =
    data.snapshot.tracked_playlist.playlist_id === 'liked_songs'
      ? 'https://open.spotify.com/collection/tracks'
      : `https://open.spotify.com/playlist/${data.snapshot.tracked_playlist.playlist_id}`

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <CardTitle className='flex items-center justify-between'>
              <Link
                href={playlistUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:underline'
              >
                {data.snapshot.tracked_playlist.playlist_name}
                <ExternalLink className='w-4 h-4 inline-block ml-1' />
              </Link>
            </CardTitle>
            <CardDescription>
              {data.tracks.length} tracks as of{' '}
              {dayjs(data.snapshot.created_at).format('MMM D, YYYY h:mm A')}
            </CardDescription>
          </div>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Items per page' />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} tracks per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className='[&>th]:px-2'>
              <TableHead className='w-10' />
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Album</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSongs.map((track: any) => (
              <TableRow key={track.id} className='[&>td]:p-2'>
                <TableCell className='w-10'>
                  <img
                    src={track.image}
                    width={40}
                    height={40}
                    alt={track.name}
                    className='w-5 h-5 rounded-full'
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`spotify:track:${track.id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                    onClick={(e) => {
                      e.preventDefault()
                      window.open(
                        `https://open.spotify.com/track/${track.id}`,
                        '_blank'
                      )
                    }}
                  >
                    {track.name}{' '}
                    <ExternalLink className='w-3 h-3 inline-block ml-1 mb-1' />
                  </Link>
                </TableCell>
                <TableCell>{track.artist}</TableCell>
                <TableCell>{track.album}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination className='justify-end mt-4'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)]
              .map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setCurrentPage(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              )}
            {currentPage + 2 < totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  )
}

export function LoadingComponent() {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col w-full space-y-1'>
            <Skeleton className='h-8 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
          <Skeleton className='h-10 w-[180px]' />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10' />
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Album</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className='[&>td]:p-2'>
                <TableCell className='w-10'>
                  <Skeleton className='h-5 w-5 rounded-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='mt-4 flex justify-end items-center'>
          <div className='flex items-center'>
            <Skeleton className='h-10 w-10 mr-2' />
            <Skeleton className='h-10 w-32 mx-2' />
            <Skeleton className='h-10 w-10 ml-2' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
