import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { sendAuthorizationEmail } from './send-authorization-email'
import { Button } from '../ui/button'
import { useToast } from '@/hooks/use-toast'

export function RequestAuthorizationButton({ email }: { email: string }) {
  const [isDisabled, setIsDisabled] = useState(false)
  const { toast } = useToast()
  const { mutate, isPending } = useMutation({
    mutationFn: () => sendAuthorizationEmail(email),
    onSuccess: (response) => {
      if (response.success) {
        setIsDisabled(true)
        toast({
          title: 'Authorization Request Sent',
          description: 'Try again later.',
        })
      } else {
        toast({
          title: 'Error Sending Authorization Request',
          description: response.error ?? 'An unknown error occurred',
          variant: 'destructive',
        })
      }
    },
  })

  return (
    <Button onClick={() => mutate()} disabled={isPending || isDisabled}>
      {isPending ? 'Requesting Authorization...' : 'Request Authorization'}
    </Button>
  )
}
