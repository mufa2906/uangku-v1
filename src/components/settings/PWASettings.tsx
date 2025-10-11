// src/components/settings/PWASettings.tsx
// Component for managing PWA settings in Uangku

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/contexts/PWAContext';

export default function PWASettings() {
  const {
    isInstallable,
    installApp,
    isOnline,
    isPushSupported,
    isPushEnabled,
    isPushDenied,
    pushPermission,
    enablePushNotifications,
    disablePushNotifications,
    isUpdateAvailable,
    updateApp
  } = usePWA();

  const [pushToggleLoading, setPushToggleLoading] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);

  // Handle push notification toggle
  const handlePushToggle = async (checked: boolean) => {
    setPushToggleLoading(true);
    try {
      if (checked) {
        await enablePushNotifications();
      } else {
        await disablePushNotifications();
      }
    } finally {
      setPushToggleLoading(false);
    }
  };

  // Handle app installation
  const handleInstallApp = async () => {
    setInstallLoading(true);
    try {
      installApp();
    } finally {
      setInstallLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Progressive Web App (PWA)
        </CardTitle>
        <CardDescription>
          Manage your Uangku app installation and notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {isOnline ? 'Connected to internet' : 'Working offline'}
          </span>
        </div>

        {/* Install App Section */}
        {isInstallable ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Install Uangku App</h3>
              <p className="text-sm text-gray-500">
                Install Uangku on your device for a native app experience with offline support
              </p>
            </div>
            <Button 
              onClick={handleInstallApp}
              disabled={installLoading}
              className="w-full"
            >
              {installLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Install App
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
            <p className="text-sm">
              Uangku is already installed as an app or installation is not available on this device
            </p>
          </div>
        )}

        {/* Push Notifications Section */}
        {isPushSupported ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Push Notifications
              </h3>
              <p className="text-sm text-gray-500">
                Receive timely reminders for bills, budgets, and financial insights
              </p>
            </div>
            
            {isPushDenied && (
              <div className="p-3 bg-red-50 text-red-800 rounded-md border border-red-200">
                <p className="text-sm">
                  Push notifications have been blocked. Please enable them in your browser settings.
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">
                  Enable Push Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  {isPushEnabled 
                    ? 'You will receive bill and budget reminders' 
                    : 'Enable to receive financial reminders'}
                </p>
              </div>
              {/* Simple toggle using Button */}
              <Button
                variant={isPushEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handlePushToggle(!isPushEnabled)}
                disabled={pushToggleLoading || isPushDenied}
                className="w-16"
              >
                {isPushEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 text-gray-800 rounded-md border border-gray-200">
            <p className="text-sm">
              Push notifications are not supported on this device or browser
            </p>
          </div>
        )}

        {/* Update Available */}
        {isUpdateAvailable && (
          <div className="p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm">A new version of Uangku is available</span>
              <Button 
                onClick={updateApp}
                size="sm"
                variant="outline"
              >
                Update Now
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Uangku works offline and syncs data when you're back online
      </CardFooter>
    </Card>
  );
}