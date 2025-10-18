// src/app/providers.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { ToastProvider } from '@/components/ui/toast'
import PWARegistration from '@/components/pwa/PWARegistration'
import { PWAProvider } from '@/contexts/PWAContext'
import { BetterAuthProvider } from '@/contexts/BetterAuthContext'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'

type Props = {
  children: React.ReactNode
}

export function Providers({ children }: Props) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <BetterAuthProvider>
        <AccessibilityProvider>
          <CurrencyProvider>
            <PWAProvider>
              <ToastProvider>
                <PWARegistration />
                {children}
              </ToastProvider>
            </PWAProvider>
          </CurrencyProvider>
        </AccessibilityProvider>
      </BetterAuthProvider>
    </NextThemesProvider>
  )
}