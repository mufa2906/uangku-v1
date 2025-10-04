// src/app/providers.tsx
'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Theme } from '@clerk/types'
import { useTheme } from 'next-themes'

type Props = {
  children: React.ReactNode
}

export function Providers({ children }: Props) {
  const { resolvedTheme } = useTheme()
  
  const clerkTheme: Theme = resolvedTheme === 'dark' ? dark : undefined

  return (
    <ClerkProvider appearance={{ baseTheme: clerkTheme }}>
      {children}
    </ClerkProvider>
  )
}