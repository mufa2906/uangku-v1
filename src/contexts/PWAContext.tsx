// src/contexts/PWAContext.tsx
// Context for managing PWA features in Uangku

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  isPushSupported, 
  requestPushPermission, 
  subscribeToPush, 
  unsubscribeFromPush,
  hasPushPermission,
  isPushDenied,
  getCurrentSubscription
} from '@/services/push-notification-service';

interface PWAContextType {
  // Installation state
  isInstallable: boolean;
  installPrompt: (() => void) | null;
  installApp: () => void;
  
  // Online/offline state
  isOnline: boolean;
  
  // Push notification state
  isPushSupported: boolean;
  isPushEnabled: boolean;
  isPushDenied: boolean;
  pushPermission: boolean;
  enablePushNotifications: () => Promise<void>;
  disablePushNotifications: () => Promise<void>;
  
  // Service worker state
  isUpdateAvailable: boolean;
  updateApp: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  // Installation state
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<(() => void) | null>(null);
  const deferredPromptRef = useRef<Event | null>(null);
  
  // Online/offline state
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // Push notification state
  const [isPushSupportedState] = useState(isPushSupported());
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isPushDeniedState, setIsPushDenied] = useState(false);
  const [pushPermission, setPushPermission] = useState(false);
  
  // Service worker state
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  // Handle installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      deferredPromptRef.current = e;
      
      // Set a function to show the install prompt
      setInstallPrompt(() => () => {
        if (deferredPromptRef.current) {
          // Show the install prompt
          (deferredPromptRef.current as any).prompt();
          
          // Wait for the user to respond to the prompt
          (deferredPromptRef.current as any).userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            } else {
              console.log('User dismissed the install prompt');
            }
            
            // Clear the saved prompt since it can't be used again
            setInstallPrompt(null);
            deferredPromptRef.current = null;
            setIsInstallable(false);
          });
        }
      });
      
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []); // Added proper dependency array

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle push notification state
  useEffect(() => {
    const updatePushState = async () => {
      if (isPushSupportedState) {
        const hasPermission = hasPushPermission();
        const denied = isPushDenied();
        const subscription = await getCurrentSubscription();
        
        setPushPermission(hasPermission);
        setIsPushDenied(denied);
        setIsPushEnabled(!!subscription && hasPermission);
      }
    };

    updatePushState();
  }, [isPushSupportedState]);

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for updates
      const handleControllerChange = () => {
        setIsUpdateAvailable(true);
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  // Install app
  const installApp = useCallback(() => {
    if (installPrompt) {
      installPrompt();
    }
  }, [installPrompt]);

  // Enable push notifications
  const enablePushNotifications = useCallback(async () => {
    if (!isPushSupportedState) return;
    
    const permissionGranted = await requestPushPermission();
    if (permissionGranted) {
      const subscription = await subscribeToPush();
      if (subscription) {
        setIsPushEnabled(true);
        setPushPermission(true);
        setIsPushDenied(false);
      }
    } else {
      setIsPushDenied(true);
    }
  }, [isPushSupportedState]);

  // Disable push notifications
  const disablePushNotifications = useCallback(async () => {
    if (!isPushSupportedState) return;
    
    const success = await unsubscribeFromPush();
    if (success) {
      setIsPushEnabled(false);
      setPushPermission(false);
    }
  }, [isPushSupportedState]);

  // Update app
  const updateApp = useCallback(() => {
    if (isUpdateAvailable) {
      // Reload the page to update the app
      window.location.reload();
    }
  }, [isUpdateAvailable]);

  const value = {
    // Installation state
    isInstallable,
    installPrompt,
    installApp,
    
    // Online/offline state
    isOnline,
    
    // Push notification state
    isPushSupported: isPushSupportedState,
    isPushEnabled,
    isPushDenied: isPushDeniedState,
    pushPermission,
    enablePushNotifications,
    disablePushNotifications,
    
    // Service worker state
    isUpdateAvailable,
    updateApp,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}