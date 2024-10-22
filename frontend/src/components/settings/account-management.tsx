import { SettingsResponse } from '@/app/api/settings/route'
import { Button } from '../ui/button'
import * as z from 'zod'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Label } from '../ui/label'
import {
  InfoIcon,
  SquareArrowOutUpRight,
  TriangleAlertIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '../ui/checkbox'
import { FormItem, FormField, FormControl, FormLabel, Form } from '../ui/form'
import { useMutation } from '@tanstack/react-query'
import { deleteUserData } from './actions/deleteUserData'
import { ErrorAlert } from '../error-alert'
import { useState } from 'react'

type AccountManagementProps = {
  settings: SettingsResponse
}

// TODO: MAnage what we delete, theres some cascading and new changes with the tracked playlists table
export function AccountManagement({
  settings: _settings,
}: AccountManagementProps) {
  const [isDeleteDataDialogOpen, setIsDeleteDataDialogOpen] = useState(false)
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
    useState(false)

  const closeDeleteDataDialog = () => setIsDeleteDataDialogOpen(false)
  const closeDeleteAccountDialog = () => setIsDeleteAccountDialogOpen(false)

  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle>Account Management</CardTitle>
        <CardDescription className='text-red-600 font-semibold flex flex-row items-center'>
          Danger Zone <TriangleAlertIcon className='w-4 h-4 ml-1' />
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-8'>
        <div className='flex flex-col'>
          <Label>Delete Stored Data</Label>
          <span className='text-sm text-muted-foreground'>
            This will delete all playlists created by TrackKeeper
          </span>
          <Dialog
            open={isDeleteDataDialogOpen}
            onOpenChange={setIsDeleteDataDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size='sm'
                className='self-start mt-2'
                variant='destructive'
                type='button'
              >
                Delete Stored Data{' '}
                <SquareArrowOutUpRight className='w-4 h-4 ml-1' />
              </Button>
            </DialogTrigger>
            <DeleteDataDialog onSuccess={closeDeleteDataDialog} />
          </Dialog>
        </div>
        <div className='flex flex-col'>
          <Label>Delete Account</Label>
          <span className='text-sm text-muted-foreground'>
            This will delete your account and all associated data.
          </span>
          <Dialog
            open={isDeleteAccountDialogOpen}
            onOpenChange={setIsDeleteAccountDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size='sm'
                className='self-start mt-2'
                variant='destructive'
                type='button'
              >
                Delete Account
                <SquareArrowOutUpRight className='w-4 h-4 ml-1' />
              </Button>
            </DialogTrigger>
            <DeleteAccountDialog onSuccess={closeDeleteAccountDialog} />
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

const deleteDataSchema = z.object({
  deleteSnapshots: z.boolean(),
  deleteRemovedSongs: z.boolean(),
  deleteTrackedPlaylists: z.boolean(),
})

type DeleteDataFormValues = z.infer<typeof deleteDataSchema>

type DeleteDataDialogProps = {
  onSuccess: () => void
}
const DeleteDataDialog = ({ onSuccess }: DeleteDataDialogProps) => {
  const form = useForm<DeleteDataFormValues>({
    resolver: zodResolver(deleteDataSchema),
    defaultValues: {
      deleteSnapshots: false,
      deleteRemovedSongs: false,
      deleteTrackedPlaylists: false,
    },
  })
  const values = form.watch()
  const { mutate, isPending, error } = useMutation({
    mutationFn: deleteUserData,
    onSuccess: () => {
      onSuccess()
    },
  })
  const onSubmit = (data: DeleteDataFormValues) => {
    mutate(data)
  }
  return (
    <DialogContent>
      <DialogHeader className='mb-2'>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. Are you sure you want to permanently
          delete the following content file from our storage?
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='space-y-6'>
            <div className='flex flex-col space-y-1'>
              <div className='flex items-center space-x-2'>
                <FormField
                  control={form.control}
                  name='deleteSnapshots'
                  render={({ field }) => (
                    <FormItem className='flex items-center space-x-2'>
                      <FormControl>
                        <Checkbox
                          id='deleteSnapshots'
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                      </FormControl>
                      <FormLabel className='!mt-0' htmlFor='deleteSnapshots'>
                        Delete Snapshots
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <span className='text-xs text-muted-foreground leading-snug'>
                This will delete <b>all snapshots</b> of libraries and playlists
                created by TrackKeeper
              </span>
            </div>
            <div className='flex flex-col space-y-1'>
              <div className='flex items-center space-x-2'>
                <FormField
                  control={form.control}
                  name='deleteRemovedSongs'
                  render={({ field }) => (
                    <FormItem className='flex items-center space-x-2'>
                      <FormControl>
                        <Checkbox
                          id='deleteRemovedSongs'
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                      </FormControl>
                      <FormLabel className='!mt-0' htmlFor='deleteRemovedSongs'>
                        Delete Removed Songs
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <span className='text-xs text-muted-foreground leading-snug'>
                This will delete <b>our storage</b> of songs that were removed
                from Spotify playlists by TrackKeeper
              </span>
            </div>
            <div className='flex flex-col space-y-1'>
              <div className='flex items-center space-x-2'>
                <FormField
                  control={form.control}
                  name='deleteTrackedPlaylists'
                  render={({ field }) => (
                    <FormItem className='flex items-center space-x-2'>
                      <FormControl>
                        <Checkbox
                          id='deleteTrackedPlaylists'
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                      </FormControl>
                      <FormLabel
                        className='!mt-0'
                        htmlFor='deleteTrackedPlaylists'
                      >
                        Delete Tracked Playlists
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <span className='text-xs text-muted-foreground leading-snug'>
                This will delete all <b>references</b> to playlists that
                TrackKeeper is currently tracking.
              </span>
            </div>
            <p className='mt-4 underline underline-offset-1 text-accent-foreground font-medium text-sm flex flex-row items-center'>
              <InfoIcon className='w-4 h-4 mr-1' />
              This will not impact anything in your Spotify account.
            </p>
          </div>
          {error && <ErrorAlert message={error.message} />}
          <DialogFooter className='mt-4'>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type='submit'
              variant='destructive'
              disabled={
                !Object.values(values).some((value) => value) || isPending
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}

type DeleteAccountDialogProps = {
  onSuccess: () => void
}
// TODO: Implement this
const DeleteAccountDialog = ({
  onSuccess: _onSuccess,
}: DeleteAccountDialogProps) => {
  // const { mutate, isPending, error } = useMutation({
  //   // mutationFn: () => deleteAccount(),
  // })
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. Are you sure you want to permanently
          delete your account and associated data from TrackKeeper.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type='button' variant='outline'>
            Cancel
          </Button>
        </DialogClose>
        <Button type='submit' variant={'destructive'}>
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function AccountManagementLoading() {
  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-10 w-32' />
      </CardContent>
    </Card>
  )
}
