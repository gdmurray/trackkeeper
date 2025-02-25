import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/card'
import { Switch } from '../ui/switch'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
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
import dayjs from 'dayjs'
import { updateAnalysis } from './actions/updateAnalysis'
import { ErrorAlert } from '../error-alert'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
type AnalysisSettingsProps = {
  settings: SettingsResponse
}

const analysisSettingsSchema = z.object({
  snapshots_enabled: z.boolean(),
})

type AnalysisSettingsFormValues = z.infer<typeof analysisSettingsSchema>

export function AnalysisSettings({ settings }: AnalysisSettingsProps) {
  const { toast } = useToast()
  const form = useForm<AnalysisSettingsFormValues>({
    resolver: zodResolver(analysisSettingsSchema),
    defaultValues: {
      snapshots_enabled: settings.userSettings?.snapshots_enabled,
    },
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: updateAnalysis,
    onSuccess: () => {
      toast({
        title: 'Analysis settings updated',
        duration: 5000,
      })
    },
  })

  const onSubmit = async (data: AnalysisSettingsFormValues) => {
    mutate(data)
  }

  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle>Analysis Settings</CardTitle>
        <CardDescription>
          Control how TrackKeeper analyzes your Spotify data
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='snapshots_enabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start justify-between gap-x-2'>
                  <div className='flex flex-col'>
                    <FormLabel htmlFor='snapshots_enabled'>
                      Snapshots Enabled
                    </FormLabel>
                    {settings.latestSnapshot != null && (
                      <FormDescription className='text-sm text-muted-foreground'>
                        Last Analysed at{' '}
                        {dayjs(settings.latestSnapshot.created_at).format(
                          'h:mm A, MMMM D, YYYY'
                        )}
                      </FormDescription>
                    )}
                  </div>

                  <FormControl>
                    <Switch
                      id='snapshots_enabled'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className='justify-between mt-4'>
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
                disabled={!form.formState.isDirty || isPending}
              >
                Save
                {isPending && <Loader2 className='w-4 h-4 animate-spin' />}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

export function AnalysisSettingsLoading() {
  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-1/3' />
          <Skeleton className='h-6 w-12' />
        </div>
        <Skeleton className='h-4 w-2/3' />
      </CardContent>
      <CardFooter className='justify-end'>
        <Skeleton className='h-10 w-16' />
      </CardFooter>
    </Card>
  )
}
