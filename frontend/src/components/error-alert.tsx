import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

type Props = {
  title?: string
  message: string
  retry?: () => void
  retryText?: string
}
export const ErrorAlert = ({
  message,
  retry,
  title = 'Error',
  retryText = 'Retry',
}: Props) => (
  <Alert variant='destructive'>
    <AlertCircle className='h-4 w-4 !text-red-500' />
    <AlertTitle className='text-red-500 font-semibold'>{title}</AlertTitle>
    <AlertDescription className='text-red-500'>{message}</AlertDescription>
    <div className='flex justify-end'>
      {retry && (
        <Button variant='destructive' size='sm' onClick={retry}>
          {retryText}
        </Button>
      )}
    </div>
  </Alert>
)
