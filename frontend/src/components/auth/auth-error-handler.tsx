import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ErrorAlert } from '../error-alert'
import { useRouter } from 'next/navigation'

export const AuthErrorHandler = () => {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(undefined)
  const params = useParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    console.log('Hash: ', hash)
    const searchParams = new URLSearchParams(hash)
    if (searchParams.get('error')) {
      const errorDescription = searchParams.get('error_description')
      const cleanedError = errorDescription?.split('%3A')[0].replace(/\+/g, ' ')
      setError(cleanedError ?? undefined)
      // setError(searchParams.get('error'))
    } else {
      if (error) {
        setError(undefined)
      }
    }
  }, [params, error, searchParams])

  if (!error) return null

  const extendErrorMessage = (message: string) => {
    if (message.includes('confirmation email has been sent')) {
      return (
        message +
        ". \n\nBe sure to check your spam folder if you don't receive the email."
      )
    }
    return message
  }

  return (
    <ErrorAlert
      message={extendErrorMessage(error)}
      retry={() => {
        router.push('/login')
        router.refresh()
      }}
      retryText='Reload'
    />
  )
}
