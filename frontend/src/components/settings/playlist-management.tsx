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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

const persistenceOptions = [
  {
    label: 'Forever',
    value: 'forever',
  },
  {
    label: '30 Days',
    value: '30 days',
  },
  {
    label: '90 Days',
    value: '90 days',
  },
  {
    label: '180 Days',
    value: '180 days',
  },
  {
    label: '1 Year',
    value: '1 year',
  },
]

export function PlaylistManagement() {
  const [playlistName, setPlaylistName] = useState('Recently Removed')
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(true)
  const [persistence, setPersistence] = useState(persistenceOptions[0].value)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Playlist Management</CardTitle>
        <CardDescription>
          Choose what you want to do with your recently deleted songs
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='analyze-switch'>
            Create Recently Removed Playlist
          </Label>
          <Switch
            id='playlist-creation-switch'
            checked={isCreatingPlaylist}
            onCheckedChange={setIsCreatingPlaylist}
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label htmlFor='playlistName'>Playlist Name</Label>
          <Input
            className='max-w-[200px]'
            defaultValue={playlistName}
            onChange={(e) => {
              setPlaylistName(e.target.value)
            }}
            placeholder={'Playlist Name'}
            disabled={!isCreatingPlaylist}
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label>Song Persistence</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className='cursor-pointer'>
              <Input
                className='text-right max-w-[200px] w-full'
                value={
                  persistenceOptions.find((o) => o.value === persistence)?.label
                }
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-full'>
              {persistenceOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setPersistence(opt.value)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className='justify-end'>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  )
}
