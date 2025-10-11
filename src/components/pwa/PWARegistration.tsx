// src/components/pwa/PWARegistration.tsx
'use client';

import { useEffect } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export default function PWARegistration() {
  const { syncPendingTransactions } = useOfflineSync();

  useEffect(() => {
    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }

    // Auto-sync when coming back online
    const handleOnline = () => {
      console.log('Device is back online, syncing pending transactions...');
      syncPendingTransactions();
    };

    // PWA install prompt
    let deferredPrompt: Event | null = null;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      console.log('PWA install prompt deferred');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [syncPendingTransactions]);

  return null;
}