// src/hooks/useOfflineSync.ts
import { useState, useEffect, useCallback } from 'react';
import { IndexedDBStorage } from '@/lib/indexeddb-storage';
import { OfflineStorage } from '@/lib/offline-storage'; // Keep for fallback
import { Transaction } from '@/types';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

interface UseOfflineSyncReturn {
  isOnline: boolean;
  pendingTransactions: number;
  syncPendingTransactions: () => Promise<void>;
  hasPendingTransactions: boolean;
  initialized: boolean; // Whether the storage system is ready
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState<boolean>(isBrowser ? navigator.onLine : true);
  const [pendingTransactions, setPendingTransactions] = useState<number>(0);
  const [hasPending, setHasPending] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize the storage system on mount
  useEffect(() => {
    const initializeStorage = async () => {
      if (!isBrowser) {
        setInitialized(true);
        return;
      }

      try {
        // Migrate from localStorage to IndexedDB if needed
        await IndexedDBStorage.migrateFromLocalStorage();
        // Check for pending transactions on mount
        const count = await IndexedDBStorage.getPendingCount();
        setPendingTransactions(count);
        setHasPending(count > 0);
      } catch (error) {
        console.error('Error initializing offline storage:', error);
        // Fallback to localStorage if IndexedDB fails
        try {
          const count = OfflineStorage.getPendingCount();
          setPendingTransactions(count);
          setHasPending(count > 0);
        } catch (fallbackError) {
          console.error('Error with localStorage fallback:', fallbackError);
          setPendingTransactions(0);
          setHasPending(false);
        }
      } finally {
        setInitialized(true);
      }
    };

    initializeStorage();
  }, []);

  // Update online status
  useEffect(() => {
    // Only run in browser environment
    if (!isBrowser) return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for pending transactions periodically
  useEffect(() => {
    if (!initialized) return; // Wait for initialization
    
    // Only run in browser environment
    if (!isBrowser) return;
    
    const checkPending = async () => {
      try {
        const count = await IndexedDBStorage.getPendingCount();
        setPendingTransactions(count);
        setHasPending(count > 0);
      } catch (error) {
        // Fallback to localStorage if IndexedDB fails
        try {
          const count = OfflineStorage.getPendingCount();
          setPendingTransactions(count);
          setHasPending(count > 0);
        } catch (fallbackError) {
          console.error('Error checking pending transactions:', fallbackError);
          setPendingTransactions(0);
          setHasPending(false);
        }
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [initialized]);

  // Function to sync pending transactions
  const syncPendingTransactions = useCallback(async (): Promise<void> => {
    // Only run in browser environment
    if (!isBrowser) return;
    
    if (!isOnline) {
      console.log('Cannot sync: Device is offline');
      return;
    }

    // Try IndexedDB first, fallback to localStorage
    let offlineTransactions = [];
    try {
      offlineTransactions = await IndexedDBStorage.getOfflineTransactions();
    } catch (error) {
      console.error('Error getting offline transactions from IndexedDB, falling back to localStorage:', error);
      try {
        offlineTransactions = OfflineStorage.getOfflineTransactions();
      } catch (fallbackError) {
        console.error('Error getting offline transactions from localStorage:', fallbackError);
        return;
      }
    }
    
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
          try {
            await IndexedDBStorage.markAsSynced(offlineTx.id, result.id);
          } catch (storageError) {
            console.error('Error marking transaction as synced in IndexedDB, trying localStorage:', storageError);
            try {
              OfflineStorage.markAsSynced(offlineTx.id, result.id);
            } catch (fallbackError) {
              console.error('Error marking transaction as synced in localStorage:', fallbackError);
            }
          }
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
    try {
      await IndexedDBStorage.cleanupSyncedTransactions();
    } catch (cleanupError) {
      console.error('Error cleaning up synced transactions in IndexedDB, trying localStorage:', cleanupError);
      try {
        OfflineStorage.cleanupSyncedTransactions();
      } catch (fallbackError) {
        console.error('Error cleaning up synced transactions in localStorage:', fallbackError);
      }
    }
    
    // Update pending count
    try {
      const count = await IndexedDBStorage.getPendingCount();
      setPendingTransactions(count);
      setHasPending(count > 0);
    } catch (countError) {
      console.error('Error getting pending count from IndexedDB, falling back to localStorage:', countError);
      try {
        const count = OfflineStorage.getPendingCount();
        setPendingTransactions(count);
        setHasPending(count > 0);
      } catch (fallbackError) {
        console.error('Error getting pending count from localStorage:', fallbackError);
        setPendingTransactions(0);
        setHasPending(false);
      }
    }
    
    console.log(`Synced ${syncedCount} of ${offlineTransactions.length} transactions`);
  }, [isOnline]); // Add useCallback with proper dependencies

  return {
    isOnline: isBrowser ? isOnline : true,
    pendingTransactions: isBrowser && initialized ? pendingTransactions : 0,
    syncPendingTransactions,
    hasPendingTransactions: hasPending,
    initialized,
  };
}