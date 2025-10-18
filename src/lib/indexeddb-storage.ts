// src/lib/indexeddb-storage.ts
import { Transaction } from '@/types';

// Define the structure for offline transaction data
interface OfflineTransaction {
  id: string; // Local ID for offline storage
  transactionData: any; // Partial transaction data without server ID
  createdAt: string; // Timestamp when added offline
  synced: boolean; // Whether it has been synced to server
  serverId?: string; // Server ID after sync
}

// Database configuration
const DB_NAME = 'uangku_db';
const DB_VERSION = 2; // Increment version to force schema update
const TRANSACTIONS_STORE = 'offline_transactions';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize IndexedDB
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      reject(new Error('IndexedDB is only available in browser environments'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for offline transactions if it doesn't exist
      if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
        const store = db.createObjectStore(TRANSACTIONS_STORE, { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      } else {
        // If store exists, check if indices need to be updated
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        if (transaction) {
          const store = transaction.objectStore(TRANSACTIONS_STORE);
          
          // Check if synced index exists, if not create it
          if (!store.indexNames.contains('synced')) {
            store.createIndex('synced', 'synced', { unique: false });
          }
          
          // Check if createdAt index exists, if not create it
          if (!store.indexNames.contains('createdAt')) {
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }
        }
      }
    };
  });
}

export class IndexedDBStorage {
  // Add a transaction to offline storage
  static async addOfflineTransaction(transaction: any): Promise<string> {
    if (!isBrowser) {
      throw new Error('IndexedDB is only available in browser environments');
    }

    try {
      const db = await initDB();
      const transactionId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const offlineTransaction: OfflineTransaction = {
        id: transactionId,
        transactionData: transaction,
        createdAt: new Date().toISOString(),
        synced: false
      };
      
      const tx = db.transaction(TRANSACTIONS_STORE, 'readwrite');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      
      await store.add(offlineTransaction);
      
      return transactionId;
    } catch (error) {
      console.error('Error adding offline transaction to IndexedDB:', error);
      throw error;
    }
  }

  // Get all offline transactions that haven't been synced
  static async getOfflineTransactions(): Promise<OfflineTransaction[]> {
    if (!isBrowser) {
      return [];
    }

    try {
      const db = await initDB();
      
      const tx = db.transaction(TRANSACTIONS_STORE, 'readonly');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      const index = store.index('synced');
      
      return new Promise((resolve) => {
        try {
          const request = index.getAll(IDBKeyRange.only(false));
          
          request.onsuccess = () => {
            resolve(request.result || []);
          };
          
          request.onerror = () => {
            console.error('Error reading offline transactions from IndexedDB index:', request.error);
            // Fallback: Get all transactions and filter in memory
            const allRequest = store.getAll();
            allRequest.onsuccess = () => {
              const allTransactions = allRequest.result || [];
              const unsyncedTransactions = allTransactions.filter((tx: any) => !tx.synced);
              resolve(unsyncedTransactions);
            };
            allRequest.onerror = () => {
              console.error('Fallback getAll request also failed:', allRequest.error);
              resolve([]); // Return empty array on complete failure
            };
          };
        } catch (queryError) {
          console.error('Error creating IDBKeyRange query:', queryError);
          // Ultimate fallback: Get all transactions and filter in memory
          const allRequest = store.getAll();
          allRequest.onsuccess = () => {
            const allTransactions = allRequest.result || [];
            const unsyncedTransactions = allTransactions.filter((tx: any) => !tx.synced);
            resolve(unsyncedTransactions);
          };
          allRequest.onerror = () => {
            console.error('Ultimate fallback getAll request also failed:', allRequest.error);
            resolve([]); // Return empty array on complete failure
          };
        }
      });
    } catch (error) {
      console.error('Error reading offline transactions from IndexedDB:', error);
      return [];
    }
  }

  // Get all offline transactions (including synced ones for display)
  static async getAllOfflineTransactions(): Promise<OfflineTransaction[]> {
    if (!isBrowser) {
      return [];
    }

    try {
      const db = await initDB();
      
      const tx = db.transaction(TRANSACTIONS_STORE, 'readonly');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error reading all offline transactions from IndexedDB:', error);
      return [];
    }
  }

  // Mark a transaction as synced
  static async markAsSynced(localId: string, serverId?: string): Promise<boolean> {
    if (!isBrowser) {
      return false;
    }

    try {
      const db = await initDB();
      
      const tx = db.transaction(TRANSACTIONS_STORE, 'readwrite');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      
      const transaction = await new Promise<OfflineTransaction | undefined>((resolve, reject) => {
        const request = store.get(localId);
        request.onsuccess = () => {
          resolve(request.result || undefined);
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
      
      if (transaction) {
        transaction.synced = true;
        if (serverId) {
          transaction.serverId = serverId;
          transaction.id = serverId; // Update the ID to the server ID
        }
        
        await new Promise((resolve, reject) => {
          const request = store.put(transaction);
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking transaction as synced in IndexedDB:', error);
      return false;
    }
  }

  // Remove synced transactions from storage
  static async cleanupSyncedTransactions(): Promise<void> {
    if (!isBrowser) {
      return;
    }

    try {
      const db = await initDB();
      
      const tx = db.transaction(TRANSACTIONS_STORE, 'readwrite');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      
      // Get all synced transactions
      const syncedTransactions = await new Promise<OfflineTransaction[]>((resolve, reject) => {
        const index = store.index('synced');
        const request = index.getAll(IDBKeyRange.only(true));
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
      
      // Delete all synced transactions
      for (const transaction of syncedTransactions) {
        await new Promise((resolve, reject) => {
          const request = store.delete(transaction.id);
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Error cleaning up synced transactions in IndexedDB:', error);
    }
  }

  // Check if there are any pending offline transactions
  static async hasPendingTransactions(): Promise<boolean> {
    if (!isBrowser) {
      return false;
    }

    try {
      const transactions = await this.getOfflineTransactions();
      return transactions.length > 0;
    } catch (error) {
      console.error('Error checking for pending transactions in IndexedDB:', error);
      return false;
    }
  }

  // Get count of pending offline transactions
  static async getPendingCount(): Promise<number> {
    if (!isBrowser) {
      return 0;
    }

    try {
      const transactions = await this.getOfflineTransactions();
      return transactions.length;
    } catch (error) {
      console.error('Error getting pending transaction count from IndexedDB:', error);
      return 0;
    }
  }

  // Clear all offline transactions (useful for testing)
  static async clearAll(): Promise<void> {
    if (!isBrowser) {
      return;
    }

    try {
      const db = await initDB();
      
      const tx = db.transaction(TRANSACTIONS_STORE, 'readwrite');
      const store = tx.objectStore(TRANSACTIONS_STORE);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error clearing offline transactions in IndexedDB:', error);
    }
  }

  // Migrate from localStorage to IndexedDB
  static async migrateFromLocalStorage(): Promise<void> {
    if (!isBrowser) {
      return;
    }

    try {
      // Get offline transactions from localStorage
      const localStorageKey = 'uangku_offline_transactions';
      const stored = localStorage.getItem(localStorageKey);
      
      if (!stored) {
        return; // No data to migrate
      }
      
      const oldTransactions: OfflineTransaction[] = JSON.parse(stored);
      
      if (oldTransactions.length === 0) {
        localStorage.removeItem(localStorageKey);
        return; // No data to migrate
      }
      
      // Add each transaction to IndexedDB
      for (const transaction of oldTransactions) {
        await this.addOfflineTransaction(transaction.transactionData);
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem(localStorageKey);
      console.log('Successfully migrated offline transactions from localStorage to IndexedDB');
    } catch (error) {
      console.error('Error migrating from localStorage to IndexedDB:', error);
      // Don't throw error, migration failure shouldn't break the app
    }
  }
}