// src/components/pwa/OfflineSyncNotification.tsx
'use client';

import { useEffect, useState } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function OfflineSyncNotification() {
  const { pendingTransactions, syncPendingTransactions, isOnline } = useOfflineSync();
  const { addToast } = useToast();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show notification when there are pending transactions and we're online
    if (pendingTransactions > 0 && isOnline) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [pendingTransactions, isOnline]);

  const handleSync = async () => {
    try {
      await syncPendingTransactions();
      setShowNotification(false);
      
      addToast({
        title: "Sync Complete",
        description: "All pending transactions have been synced successfully.",
        type: "success"
      });
    } catch (error) {
      addToast({
        title: "Sync Failed",
        description: "Failed to sync pending transactions. Please try again.",
        type: "error"
      });
    }
  };

  if (!showNotification) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-blue-100 border border-blue-300 text-blue-800 p-4 rounded-md shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Sync Pending Transactions</p>
            <p className="text-sm">
              {pendingTransactions} transaction{pendingTransactions !== 1 ? 's' : ''} waiting to sync
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleSync}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sync Now
          </Button>
        </div>
      </div>
    </div>
  );
}