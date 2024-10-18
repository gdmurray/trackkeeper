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

const deletedSongsData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Song ${i + 1}`,
  artist: `Artist ${i + 1}`,
  deletedDate: new Date(Date.now() - Math.random() * 10000000000)
    .toISOString()
    .split('T')[0],
}))

export function RecentlyDeleted() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const paginatedSongs = deletedSongsData.slice(
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
            {paginatedSongs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>{song.title}</TableCell>
                <TableCell>{song.artist}</TableCell>
                <TableCell>{song.deletedDate}</TableCell>
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
