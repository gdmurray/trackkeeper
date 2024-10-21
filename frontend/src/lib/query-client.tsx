'use client'

import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './react-query'
import { ReactNode } from 'react'

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  )
}
