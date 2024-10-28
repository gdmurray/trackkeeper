import { Button } from '../ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { SettingsResponse } from '@/app/api/settings/route'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormLabel,
  FormField,
  FormItem,
  FormControl,
  FormDescription,
} from '../ui/form'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select'
import { updatePlaylistManagement } from './actions/updatePlaylistManagement'
import { useMutation } from '@tanstack/react-query'
import { CircleHelp, Loader2 } from 'lucide-react'
import { ErrorAlert } from '../error-alert'
import { useToast } from '@/hooks/use-toast'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'
import { Switch } from '../ui/switch'

const persistenceOptions = [
  { label: 'Forever', value: 'forever' },
  { label: '30 Days', value: '30 days' },
  { label: '90 Days', value: '90 days' },
  { label: '180 Days', value: '180 days' },
  { label: '1 Year', value: '1 year' },
]

const playlistManagementSchema = z.object({
  playlist_persistence: z.enum([
    'forever',
    '30 days',
    '90 days',
    '180 days',
    '1 year',
  ]),
  remove_from_playlist: z.boolean(),
})

type PlaylistManagementFormValues = z.infer<typeof playlistManagementSchema>

type PlaylistManagementProps = {
  settings: SettingsResponse
}

export function PlaylistManagement({ settings }: PlaylistManagementProps) {
  console.log('Settings: ', settings)
  const { toast } = useToast()
  const form = useForm<PlaylistManagementFormValues>({
    resolver: zodResolver(playlistManagementSchema),
    defaultValues: {
      // create_playlist: settings.userSettings?.create_playlist ?? true,
      // playlist_name: settings.userSettings?.playlist_name ?? 'Recently Removed',
      playlist_persistence: (settings.userSettings?.playlist_persistence ??
        'forever') as 'forever' | '30 days' | '90 days' | '180 days' | '1 year',
      remove_from_playlist:
        settings.userSettings?.remove_from_playlist != null
          ? settings.userSettings.remove_from_playlist
          : true,
    },
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: updatePlaylistManagement,
    onSuccess: () => {
      toast({
        title: 'Playlist management updated',
        duration: 5000,
      })
    },
  })

  const onSubmit = (data: PlaylistManagementFormValues) => {
    mutate(data)
  }

  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <div className='flex flex-row justify-between items-start'>
          <div className='flex flex-col'>
            <CardTitle>Playlist Management</CardTitle>
            <CardDescription>
              Choose what you want to do with your recently deleted songs
            </CardDescription>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant='outline' size='icon-circle'>
                <CircleHelp className='h-4 w-4' />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className='w-80'>
              <div className='space-y-2'>
                <h4 className='font-medium leading-none'>
                  Playlist Management
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Configure how long songs remain in your Recently Removed
                  playlist before being automatically removed. Choose from 30
                  days up to 1 year, or keep them forever.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            {/* <FormField
              control={form.control}
              name='create_playlist'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between space-y-0'>
                  <FormLabel htmlFor='playlist-creation-switch'>
                    Create Recently Removed Playlist
                  </FormLabel>
                  <FormControl>
                    <Switch
                      id='playlist-creation-switch'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}
            {/* <FormField
              control={form.control}
              name='playlist_name'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between space-y-0'>
                  <FormLabel htmlFor='playlist-name'>Playlist Name</FormLabel>
                  <FormControl>
                    <Input
                      id='playlist-name'
                      className='max-w-[200px]'
                      {...field}
                      disabled={!form.watch('create_playlist')}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name='playlist_persistence'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between space-y-0'>
                  <FormLabel>Song Persistence</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      // disabled={!form.watch('create_playlist')}
                    >
                      <SelectTrigger className='max-w-[200px] w-full'>
                        <SelectValue placeholder='Select persistence' />
                      </SelectTrigger>
                      <SelectContent>
                        {persistenceOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='remove_from_playlist'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between space-y-0'>
                  <div className='flex flex-col'>
                    <FormLabel htmlFor='remove_from_playlist'>
                      Remove from Playlist
                    </FormLabel>
                    <FormDescription>
                      Automatically remove songs from your Recently Removed
                      playlist after a set amount of time.
                    </FormDescription>
                  </div>

                  <FormControl>
                    <Switch
                      id='suggestion_emails'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
                  variant='secondary'
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

export function PlaylistManagementLoading() {
  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
      </CardHeader>
      <CardContent className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='flex items-center justify-between'>
            <Skeleton className='h-4 w-1/3' />
            <Skeleton className='h-8 w-[200px]' />
          </div>
        ))}
      </CardContent>
      <CardFooter className='justify-end'>
        <Skeleton className='h-10 w-16' />
      </CardFooter>
    </Card>
  )
}
