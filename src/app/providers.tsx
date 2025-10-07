// src/app/providers.tsx
'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Theme } from '@clerk/types'
import { useTheme } from 'next-themes'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { ToastProvider } from '@/components/ui/toast'

type Props = {
  children: React.ReactNode
}

export function Providers({ children }: Props) {
  const { resolvedTheme } = useTheme()
  
  return (
    <ClerkProvider appearance={resolvedTheme === 'dark' ? { baseTheme: dark } : {}}>
      <CurrencyProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </CurrencyProvider>
    </ClerkProvider>
  )
}