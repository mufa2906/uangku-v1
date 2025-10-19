// src/components/pwa/PWARegistration.tsx
'use client';

import { useEffect, useState } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export default function PWARegistration() {
  const { syncPendingTransactions } = useOfflineSync();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      };

      // Wait for the page to be fully loaded before registering the service worker
      if (window.location.hostname !== 'localhost' || window.location.protocol === 'https:') {
        // Only register on HTTPS or localhost
        if (document.readyState === 'loading') {
          window.addEventListener('load', registerServiceWorker);
        } else {
          registerServiceWorker();
        }
      }
    }

    // Auto-sync when coming back online
    const handleOnline = () => {
      console.log('Device is back online, syncing pending transactions...');
      syncPendingTransactions();
    };

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      console.log('PWA install prompt deferred');
      
      // At this point, you can show a custom install button to the user
      // The PWAContext can provide the install function to trigger this
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