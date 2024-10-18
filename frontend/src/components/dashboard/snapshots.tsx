import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '../ui/table'

// Mock data for demonstration
const snapshotData = [
  { id: 1, date: '2023-06-01', songCount: 150 },
  { id: 2, date: '2023-06-08', songCount: 155 },
  { id: 3, date: '2023-06-15', songCount: 153 },
]

export function Snapshots() {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshotData.map((snapshot) => (
              <TableRow key={snapshot.id}>
                <TableCell>{snapshot.date}</TableCell>
                <TableCell>{snapshot.songCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
