'use client'

import { PlaylistDetailResponse } from '@/app/api/playlists/[playlistId]/route'
import { ErrorAlert } from '@/components/error-alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState, use } from 'react'

async function fetchPlaylist(
  playlistId: string
): Promise<PlaylistDetailResponse> {
  const res = await fetch(`/api/playlists/${playlistId}`)
  return res.json()
}

export default function PlaylistPage(props: {
  params: Promise<{ playlistId: string }>
}) {
  const params = use(props.params)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['playlist', params.playlistId],
    queryFn: () => fetchPlaylist(params.playlistId),
  })

  console.log('Playlist data: ', data)

  if (isLoading) return <PlaylistLoading />
  if (error) return <ErrorAlert message={error.message} retry={refetch} />
  if (!data) return <div>No data</div>

  const paginatedSnapshots = data.snapshots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(data.snapshots.length / itemsPerPage)

  const playlistUrl =
    data.playlist.playlist_id === 'liked_songs'
      ? 'https://open.spotify.com/collection/tracks'
      : `https://open.spotify.com/playlist/${data.playlist.playlist_id}`

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
                {data.playlist.playlist_name}
                <ExternalLink className='w-4 h-4 inline-block ml-1' />
              </Link>
            </CardTitle>
            <CardDescription>
              {data.snapshots.length} snapshots as of{' '}
              {dayjs(data.snapshots[0].created_at).format('MMM D, YYYY h:mm A')}
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
              <TableHead>Date</TableHead>
              <TableHead>Number of Songs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSnapshots.map((snapshot) => (
              <TableRow key={snapshot.id} className='[&>td]:p-2'>
                <TableCell>
                  <TooltipProvider>
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
                      <TooltipContent>View Songs in Snapshot</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{snapshot.song_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <Pagination className='justify-end mt-4'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  // disabled={currentPage === 1}
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
                  // disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}

function PlaylistLoading() {
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
            <Skeleton className='h-10 w-32 mx-2' />
            <Skeleton className='h-10 w-10 ml-2' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
