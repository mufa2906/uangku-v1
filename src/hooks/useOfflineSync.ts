// src/hooks/useOfflineSync.ts
import { useState, useEffect } from 'react';
import { OfflineStorage } from '@/lib/offline-storage';
import { Transaction } from '@/types';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

interface UseOfflineSyncReturn {
  isOnline: boolean;
  pendingTransactions: number;
  syncPendingTransactions: () => Promise<void>;
  hasPendingTransactions: boolean;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState<boolean>(isBrowser ? navigator.onLine : true);
  const [pendingTransactions, setPendingTransactions] = useState<number>(0);

  // Update online status
  useEffect(() => {
    // Only run in browser environment
    if (!isBrowser) return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending transactions on mount
    setPendingTransactions(OfflineStorage.getPendingCount());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for pending transactions periodically
  useEffect(() => {
    // Only run in browser environment
    if (!isBrowser) return;
    
    const checkPending = () => {
      setPendingTransactions(OfflineStorage.getPendingCount());
    };

    checkPending();
    const interval = setInterval(checkPending, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to sync pending transactions
  const syncPendingTransactions = async (): Promise<void> => {
    // Only run in browser environment
    if (!isBrowser) return;
    
    if (!isOnline) {
      console.log('Cannot sync: Device is offline');
      return;
    }

    const offlineTransactions = OfflineStorage.getOfflineTransactions();
    
    if (offlineTransactions.length === 0) {
      console.log('No pending transactions to sync');
      return;
    }

    console.log(`Syncing ${offlineTransactions.length} offline transactions...`);

    let syncedCount = 0;

    for (const offlineTx of offlineTransactions) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(offlineTx.transactionData),
        });

        if (response.ok) {
          const result = await response.json();
          // Mark as synced with the server ID
          OfflineStorage.markAsSynced(offlineTx.id, result.id);
          syncedCount++;
          console.log(`Successfully synced transaction ${offlineTx.id}`);
        } else {
          const errorData = await response.json();
          console.error(`Failed to sync transaction ${offlineTx.id}:`, errorData);
          // Don't mark as synced if it failed - will retry next time
        }
      } catch (error) {
        console.error(`Error syncing transaction ${offlineTx.id}:`, error);
        // Don't mark as synced if there was a network error - will retry next time
      }
    }

    // Clean up synced transactions from storage
    OfflineStorage.cleanupSyncedTransactions();
    
    // Update pending count
    setPendingTransactions(OfflineStorage.getPendingCount());
    
    console.log(`Synced ${syncedCount} of ${offlineTransactions.length} transactions`);
  };

  return {
    isOnline: isBrowser ? isOnline : true,
    pendingTransactions: isBrowser ? pendingTransactions : 0,
    syncPendingTransactions,
    hasPendingTransactions: isBrowser ? OfflineStorage.hasPendingTransactions() : false,
  };
}