// src/lib/offline-storage.ts
import { Transaction } from '@/types';

// Define the structure for offline transaction data
interface OfflineTransaction {
  id: string; // Local ID for offline storage
  transactionData: Partial<Omit<Transaction, 'id'>>; // Partial transaction data without server ID
  createdAt: string; // Timestamp when added offline
  synced: boolean; // Whether it has been synced to server
}

// Key for local storage
const OFFLINE_TRANSACTIONS_KEY = 'uangku_offline_transactions';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

export class OfflineStorage {
  // Add a transaction to offline storage
  static addOfflineTransaction(transaction: Partial<Omit<Transaction, 'id'>>): string {
    // Only run in browser environment
    if (!isBrowser) return '';
    
    try {
      const offlineTransactions = this.getOfflineTransactions();
      const localId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const offlineTransaction: OfflineTransaction = {
        id: localId,
        transactionData: transaction,
        createdAt: new Date().toISOString(),
        synced: false
      };
      
      offlineTransactions.push(offlineTransaction);
      localStorage.setItem(OFFLINE_TRANSACTIONS_KEY, JSON.stringify(offlineTransactions));
      
      return localId;
    } catch (error) {
      console.error('Error adding offline transaction:', error);
      return '';
    }
  }

  // Get all offline transactions that haven't been synced
  static getOfflineTransactions(): OfflineTransaction[] {
    // Only run in browser environment
    if (!isBrowser) return [];
    
    try {
      const stored = localStorage.getItem(OFFLINE_TRANSACTIONS_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).filter((t: OfflineTransaction) => !t.synced);
    } catch (error) {
      console.error('Error reading offline transactions:', error);
      return [];
    }
  }

  // Mark a transaction as synced
  static markAsSynced(localId: string, serverId?: string): boolean {
    // Only run in browser environment
    if (!isBrowser) return false;
    
    try {
      const offlineTransactions = this.getOfflineTransactions();
      const transactionIndex = offlineTransactions.findIndex(t => t.id === localId);
      
      if (transactionIndex !== -1) {
        // Update the transaction in the list
        const updatedTransaction = { ...offlineTransactions[transactionIndex] };
        
        if (serverId) {
          // Update the ID to the server ID
          updatedTransaction.id = serverId;
        }
        
        updatedTransaction.synced = true;
        
        // Replace the old transaction with the updated one
        offlineTransactions[transactionIndex] = updatedTransaction;
        
        localStorage.setItem(OFFLINE_TRANSACTIONS_KEY, JSON.stringify(offlineTransactions));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking transaction as synced:', error);
      return false;
    }
  }

  // Remove synced transactions from storage
  static cleanupSyncedTransactions(): void {
    // Only run in browser environment
    if (!isBrowser) return;
    
    try {
      const transactions = JSON.parse(localStorage.getItem(OFFLINE_TRANSACTIONS_KEY) || '[]');
      const unsyncedTransactions = transactions.filter((t: OfflineTransaction) => !t.synced);
      localStorage.setItem(OFFLINE_TRANSACTIONS_KEY, JSON.stringify(unsyncedTransactions));
    } catch (error) {
      console.error('Error cleaning up synced transactions:', error);
    }
  }

  // Check if there are any pending offline transactions
  static hasPendingTransactions(): boolean {
    // Only run in browser environment
    if (!isBrowser) return false;
    
    return this.getOfflineTransactions().length > 0;
  }

  // Get count of pending offline transactions
  static getPendingCount(): number {
    // Only run in browser environment
    if (!isBrowser) return 0;
    
    return this.getOfflineTransactions().length;
  }
}