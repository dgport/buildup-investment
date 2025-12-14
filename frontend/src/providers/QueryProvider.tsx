import { queryClient } from '@/lib/tanstack/query-client'
import { QueryClientProvider } from '@tanstack/react-query'

import type { ReactNode } from 'react'

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
