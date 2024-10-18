import { useState } from 'react'
import { Button } from '../ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

const playlists = [
  { id: 'liked', name: 'Liked Songs' },
  { id: 'playlist1', name: 'My Favorites' },
  { id: 'playlist2', name: 'Workout Mix' },
  { id: 'playlist3', name: 'Chill Vibes' },
]

export function TrackedPlaylists() {
  const [trackedPlaylists, setTrackedPlaylists] = useState(['liked'])
  const handlePlaylistToggle = (playlistId: string) => {
    setTrackedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId]
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracked Playlists</CardTitle>
        <CardDescription>
          Choose which playlists TrackKeeper should monitor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {playlists.map((playlist) => (
            <div key={playlist.id} className='flex items-center space-x-2'>
              <Checkbox
                id={playlist.id}
                checked={trackedPlaylists.includes(playlist.id)}
                onCheckedChange={() => handlePlaylistToggle(playlist.id)}
              />
              <Label htmlFor={playlist.id}>{playlist.name}</Label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className='justify-end'>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  )
}
