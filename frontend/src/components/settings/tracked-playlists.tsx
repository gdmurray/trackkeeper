import { useCallback, useMemo } from 'react'
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
import { Skeleton } from '../ui/skeleton'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { SettingsResponse } from '@/app/api/settings/route'
import { PlaylistResponse } from '@/app/api/settings/playlists/route'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../ui/select'
import { CircleHelp, FolderLock, Globe, Loader2 } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTrackedPlaylists } from './actions/updateTrackedPlaylists'
import { ErrorAlert } from '../error-alert'
import { useToast } from '@/hooks/use-toast'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'

type TrackedPlaylistsProps = {
  settings: SettingsResponse
  playlists: PlaylistResponse
}

const trackedPlaylistSchema = z.record(
  z.object({
    id: z.number().nullable().optional(),
    playlist_name: z.string(),
    active: z.boolean(),
    playlist_id: z.string(),
    removed_playlist_name: z.string().nullable(),
    public: z.boolean(),
  })
)

export function TrackedPlaylists({
  playlists,
  settings,
}: TrackedPlaylistsProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof trackedPlaylistSchema>>({
    resolver: zodResolver(trackedPlaylistSchema),
    defaultValues: settings.trackedPlaylists.reduce(
      (acc, playlist) => ({
        ...acc,
        [playlist.playlist_id]: {
          id: playlist.id,
          playlist_name: playlist.playlist_name,
          active: playlist.active,
          playlist_id: playlist.playlist_id,
          removed_playlist_name: playlist.removed_playlist_name,
          public: playlist.public,
        },
      }),
      {}
    ),
  })

  const queryClient = useQueryClient()

  const { control, handleSubmit, watch } = form
  const trackedPlaylists = watch()
  const { mutate, isPending, error } = useMutation({
    mutationFn: updateTrackedPlaylists,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({
        title: 'Tracked playlists updated',
        duration: 5000,
      })
    },
  })

  const onSubmit = (data: z.infer<typeof trackedPlaylistSchema>) => {
    const payload = Object.values(data).map((playlist) => ({
      ...playlist,
      id: playlist.id ?? undefined,
    }))
    mutate(payload)
  }

  const onUncheckedChange = useCallback(
    (checked: boolean, playlist: SpotifyApi.PlaylistObjectSimplified) => {
      if (checked) {
        // Use setTimeout to move state update outside render cycle
        setTimeout(() => {
          form.setValue(playlist.id, {
            id: null,
            playlist_name: playlist.name,
            active: true,
            playlist_id: playlist.id,
            removed_playlist_name: `Removed - ${playlist.name}`,
            public: false,
          })
        }, 0)
      }
    },
    [form]
  )

  const sortedPlaylists = useMemo(() => {
    const playlistIdSet = new Set()
    return playlists
      .filter((p) => {
        if (!playlistIdSet.has(p.id)) {
          playlistIdSet.add(p.id)
          return true
        }
        return false
      })
      .sort((a, b) => {
        const aTracked = a.id in trackedPlaylists
        const bTracked = b.id in trackedPlaylists
        if (aTracked && !bTracked) return -1
        if (!aTracked && bTracked) return 1
        return 0
      })
  }, [trackedPlaylists, playlists])

  console.log(
    form.formState.isDirty,
    form.formState.isValid,
    form.formState.dirtyFields,
    form.getValues(),
    form.formState.errors
  )

  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <div className='flex flex-row justify-between'>
          <div className='flex flex-col'>
            <CardTitle>Tracked Playlists</CardTitle>
            <CardDescription>
              Choose which additional playlists TrackKeeper should monitor.
              <br />
              Liked Songs is automatically tracked.
            </CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger>
              <Button variant='outline' size='icon-circle'>
                <CircleHelp className='w-4 h-4' />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className='space-y-2'>
                <h4 className='font-medium leading-none'>Tracked Playlists</h4>
                <p className='text-sm text-muted-foreground'>
                  This can be used to keep track of changes in playlists which
                  Spotify updates itself, such as <b>Release Radar</b> and{' '}
                  <b>On Repeat</b>.
                  <br />
                  Make sure to add those playlists to your liked playlists so
                  that it appears in this list.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className='flex flex-col'>
            <div className='w-full flex flex-row items-center justify-between mb-4 border-b pb-2 pr-4'>
              <Label>Playlist Name</Label>
              <div className='flex flex-row items-center space-x-2'>
                <Label>Removed Playlist Name</Label>
                <Label className='w-28 text-right'>Visibility</Label>
              </div>
            </div>

            <ScrollArea
              className='flex max-h-64 flex-col overflow-y-auto'
              type='scroll'
            >
              <div className='space-y-1 pr-4'>
                {sortedPlaylists.map((playlist) => {
                  const playlistImage = getSmallestImage(playlist.images)

                  function getSmallestImage(
                    images: SpotifyApi.ImageObject[]
                  ): SpotifyApi.ImageObject | null {
                    if (!images || images.length === 0) {
                      return null // Replace with your default image path
                    }
                    const smallestImage = images.reduce((smallest, current) =>
                      current.width &&
                      smallest.width &&
                      current.width < smallest.width
                        ? current
                        : smallest
                    )
                    return smallestImage
                  }
                  const isPlaylistTracked = playlist.id in trackedPlaylists
                  if (isPlaylistTracked) {
                    return (
                      <div
                        key={`${playlist.id}-tracked`}
                        className='flex flex-row items-center space-x-2 justify-between h-[50px]'
                      >
                        <div className='flex flex-row items-center space-x-2'>
                          <div className='w-8 h-8 flex-shrink-0'>
                            {playlistImage && (
                              <img
                                src={playlistImage.url}
                                width={playlistImage.width ?? 40}
                                height={playlistImage.height ?? 40}
                                alt={playlist.name}
                                className='w-8 h-8 rounded-full'
                              />
                            )}
                          </div>
                          <FormField
                            name={`${playlist.id}.active`}
                            control={control}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className='flex items-center space-x-2'>
                                    <Checkbox
                                      id={playlist.id}
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        if (
                                          !checked &&
                                          form.getValues(`${playlist.id}.id`) ==
                                            null
                                        ) {
                                          form.unregister(playlist.id)
                                        } else {
                                          field.onChange(checked)
                                        }
                                      }}
                                    />
                                    <Label htmlFor={playlist.id}>
                                      {playlist.name}
                                    </Label>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className='flex flex-row items-center space-x-2'>
                          <FormField
                            name={`${playlist.id}.removed_playlist_name`}
                            disabled={!form.watch(`${playlist.id}.active`)}
                            control={control}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  {/* @ts-expect-error react-hook-form */}
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            name={`${playlist.id}.public`}
                            control={control}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select
                                    disabled={
                                      !form.watch(`${playlist.id}.active`)
                                    }
                                    onValueChange={(value) =>
                                      field.onChange(value === 'true')
                                    }
                                    value={field.value ? 'true' : 'false'}
                                  >
                                    <SelectTrigger className='w-28 [&>span]:flex [&>span]:items-center [&>span]:justify-between'>
                                      <SelectValue placeholder='Select a Mode' />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem
                                        value='true'
                                        className='[&>span]:flex [&>span]:items-center [&>span]:justify-between'
                                      >
                                        Public
                                        <Globe className='w-4 h-4 ml-2' />
                                      </SelectItem>
                                      <SelectItem
                                        value='false'
                                        className='[&>span]:flex [&>span]:items-center [&>span]:justify-between'
                                      >
                                        Private
                                        <FolderLock className='w-4 h-4 ml-2' />
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={playlist.id}
                      className='flex flex-row items-center space-x-2 h-[50px]'
                    >
                      <div className='w-8 h-8 flex-shrink-0'>
                        {playlistImage && (
                          <img
                            src={playlistImage.url}
                            width={playlistImage.width ?? 40}
                            height={playlistImage.height ?? 40}
                            alt={playlist.name}
                            className='w-8 h-8 rounded-full'
                          />
                        )}
                      </div>
                      <Checkbox
                        id={playlist.id}
                        checked={false}
                        onCheckedChange={(checked) =>
                          onUncheckedChange(checked as boolean, playlist)
                        }
                      />
                      <Label htmlFor={playlist.id}>{playlist.name}</Label>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
            {/* </div> */}
          </CardContent>
          <CardFooter className='justify-between'>
            <div>
              {error && (
                <ErrorAlert
                  message={error.message}
                  retry={() => onSubmit(form.getValues())}
                />
              )}
            </div>
            <div className='flex flex-row items-center space-x-2'>
              {form.formState.isDirty && (
                <Button
                  type='button'
                  variant={'outline'}
                  onClick={() => {
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type='submit'
                disabled={
                  !form.formState.isDirty ||
                  isPending ||
                  !form.formState.isValid
                }
              >
                Save
                {isPending && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

export function TrackedPlaylistsLoading() {
  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='flex items-center space-x-2'>
              <Skeleton className='h-4 w-4' />
              <Skeleton className='h-4 w-1/3' />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className='justify-end'>
        <Skeleton className='h-10 w-16' />
      </CardFooter>
    </Card>
  )
}
