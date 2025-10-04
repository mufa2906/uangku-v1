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
  
  return (
    <ClerkProvider appearance={resolvedTheme === 'dark' ? { baseTheme: dark } : {}}>
      {children}
    </ClerkProvider>
  )
}