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
import { Form, FormLabel, FormField, FormItem, FormControl } from '../ui/form'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select'
import { updatePlaylistManagement } from './actions/updatePlaylistManagement'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { ErrorAlert } from '../error-alert'

const persistenceOptions = [
  { label: 'Forever', value: 'forever' },
  { label: '30 Days', value: '30 days' },
  { label: '90 Days', value: '90 days' },
  { label: '180 Days', value: '180 days' },
  { label: '1 Year', value: '1 year' },
]

const playlistManagementSchema = z.object({
  create_playlist: z.boolean(),
  playlist_name: z.string().min(1, 'Playlist name is required'),
  playlist_persistence: z.enum([
    'forever',
    '30 days',
    '90 days',
    '180 days',
    '1 year',
  ]),
})

type PlaylistManagementFormValues = z.infer<typeof playlistManagementSchema>

type PlaylistManagementProps = {
  settings: SettingsResponse
}

export function PlaylistManagement({ settings }: PlaylistManagementProps) {
  const form = useForm<PlaylistManagementFormValues>({
    resolver: zodResolver(playlistManagementSchema),
    defaultValues: {
      // create_playlist: settings.userSettings?.create_playlist ?? true,
      // playlist_name: settings.userSettings?.playlist_name ?? 'Recently Removed',
      playlist_persistence: (settings.userSettings?.playlist_persistence ??
        'forever') as 'forever' | '30 days' | '90 days' | '180 days' | '1 year',
    },
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: updatePlaylistManagement,
  })

  const onSubmit = (data: PlaylistManagementFormValues) => {
    mutate(data)
  }

  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle>Playlist Management</CardTitle>
        <CardDescription>
          Choose what you want to do with your recently deleted songs
        </CardDescription>
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
