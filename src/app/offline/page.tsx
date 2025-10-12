// src/app/offline/page.tsx
// Enhanced offline mode for Uangku PWA

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OfflineTransactionForm from '@/components/offline/OfflineTransactionForm';
import OfflineTransactionList from '@/components/offline/OfflineTransactionList';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { RefreshCw, WifiOff } from 'lucide-react';
import AppBottomNav from '@/components/shells/AppBottomNav';

export default function OfflineModePage() {
  const { isOnline, pendingTransactions, syncPendingTransactions } = useOfflineSync();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to main app when back online
  useEffect(() => {
    if (isOnline) {
      // Small delay to allow sync to complete
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Reconnecting...
            </CardTitle>
            <CardDescription>
              You're back online! Syncing your offline transactions...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center">
                {pendingTransactions > 0 
                  ? `Syncing ${pendingTransactions} transaction${pendingTransactions !== 1 ? 's' : ''}...` 
                  : 'All caught up!'}
              </p>
              
              {pendingTransactions > 0 && (
                <Button className="w-full" disabled>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </Button>
              )}
              
              <p className="text-center text-sm text-gray-500">
                Redirecting to dashboard shortly...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Offline Header */}
      <div className="p-4 bg-red-50 border-b border-red-100">
        <div className="flex items-center gap-3">
          <WifiOff className="h-6 w-6 text-red-600" />
          <div>
            <h1 className="text-lg font-semibold text-red-800">Offline Mode</h1>
            <p className="text-sm text-red-600">Creating transactions for later sync</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Transaction Form */}
        <OfflineTransactionForm />
        
        {/* Offline Transactions List */}
        <OfflineTransactionList />
        
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Working Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Create transactions - they'll save locally</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Data syncs automatically when you're back online</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>No data will be lost during offline periods</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Continue working normally when connectivity returns</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  );
}