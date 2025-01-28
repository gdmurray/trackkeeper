import { SettingsResponse } from '@/app/api/settings/route'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '../ui/form'
import { updateEmailSettings } from './actions/updateEmailSettings'
import { useMutation } from '@tanstack/react-query'
import { Switch } from '../ui/switch'
import { ErrorAlert } from '../error-alert'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import { useToast } from '@/hooks/use-toast'
const emailSettingsSchema = z.object({
  suggestion_emails: z.boolean(),
})

type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>

export function EmailSettings({ settings }: { settings: SettingsResponse }) {
  const { toast } = useToast()
  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      suggestion_emails: settings.userSettings?.suggestion_emails,
    },
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: updateEmailSettings,
    onSuccess: () => {
      toast({
        title: 'Email preferences updated',
        duration: 5000,
      })
    },
  })

  const onSubmit = async (data: EmailSettingsFormValues) => {
    mutate(data)
  }

  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>
          Control how TrackKeeper sends you emails
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='suggestion_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start justify-between gap-x-2'>
                  <div className='flex flex-col'>
                    <FormLabel htmlFor='suggestion_emails'>
                      Suggestion Emails
                    </FormLabel>
                    <FormDescription>
                      Weekly emails with a summary of any removed songs and an
                      analysis of whether TrackKeeper thinks that song was
                      removed accidentally.
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

export function EmailSettingsLoading() {
  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>
          Control how TrackKeeper sends you emails
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-row items-center justify-between space-y-0'>
          <div className='flex flex-col space-y-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-64' />
          </div>
          <Skeleton className='h-6 w-12' />
        </div>
      </CardContent>
      <CardFooter className='justify-end'>
        <Skeleton className='h-10 w-20' />
      </CardFooter>
    </Card>
  )
}
