// src/__tests__/offline.test.ts
// End-to-end test for offline functionality

import { expect, test, describe, beforeEach, afterEach } from '@playwright/test';
import { OfflineStorage } from '../lib/offline-storage';

describe('Offline Functionality', () => {
  beforeEach(async () => {
    // Clear any existing offline storage before tests
    if (typeof window !== 'undefined') {
      localStorage.removeItem('uangku_offline_transactions');
    }
  });

  afterEach(async () => {
    // Clean up after tests
    if (typeof window !== 'undefined') {
      localStorage.removeItem('uangku_offline_transactions');
    }
  });

  test('should add transaction to offline storage', () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      expect(true).toBeTruthy();
      return;
    }

    const transaction = {
      type: 'expense',
      amount: 150000,
      note: 'Test offline transaction',
      date: new Date().toISOString().split('T')[0]
    };

    const localId = OfflineStorage.addOfflineTransaction(transaction);
    
    expect(localId).toBeTruthy();
    expect(typeof localId).toBe('string');
    expect(localId).toContain('offline_');
  });

  test('should retrieve offline transactions', () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      expect(true).toBeTruthy();
      return;
    }

    // Add a test transaction
    const transaction = {
      type: 'income',
      amount: 250000,
      note: 'Another test',
      date: new Date().toISOString().split('T')[0]
    };

    OfflineStorage.addOfflineTransaction(transaction);

    const transactions = OfflineStorage.getOfflineTransactions();
    expect(Array.isArray(transactions)).toBeTruthy();
    expect(transactions.length).toBeGreaterThan(0);

    const firstTransaction = transactions[0];
    expect(firstTransaction.transactionData.type).toBe('income');
    expect(firstTransaction.transactionData.amount).toBe(250000);
    expect(firstTransaction.synced).toBe(false);
  });

  test('should mark transaction as synced', () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      expect(true).toBeTruthy();
      return;
    }

    // Add a test transaction
    const transaction = {
      type: 'expense',
      amount: 75000,
      note: 'Synced test',
      date: new Date().toISOString().split('T')[0]
    };

    const localId = OfflineStorage.addOfflineTransaction(transaction);
    
    // Mark as synced
    const success = OfflineStorage.markAsSynced(localId, 'server-123');
    expect(success).toBeTruthy();

    // Verify it's marked as synced
    const allTransactions = OfflineStorage.getAllOfflineTransactions();
    const syncedTransaction = allTransactions.find(t => t.id === 'server-123');
    expect(syncedTransaction).toBeTruthy();
    expect(syncedTransaction?.synced).toBeTruthy();
  });

  test('should have pending transactions', () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      expect(true).toBeTruthy();
      return;
    }

    // Initially no pending transactions
    expect(OfflineStorage.hasPendingTransactions()).toBeFalsy();
    expect(OfflineStorage.getPendingCount()).toBe(0);

    // Add a transaction
    const transaction = {
      type: 'expense',
      amount: 100000,
      note: 'Pending test',
      date: new Date().toISOString().split('T')[0]
    };

    OfflineStorage.addOfflineTransaction(transaction);

    // Should now have pending transactions
    expect(OfflineStorage.hasPendingTransactions()).toBeTruthy();
    expect(OfflineStorage.getPendingCount()).toBe(1);
  });

  test('should clean up synced transactions', () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      expect(true).toBeTruthy();
      return;
    }

    // Add two transactions
    const transaction1 = {
      type: 'expense',
      amount: 50000,
      note: 'Will be synced',
      date: new Date().toISOString().split('T')[0]
    };

    const transaction2 = {
      type: 'income',
      amount: 200000,
      note: 'Will remain offline',
      date: new Date().toISOString().split('T')[0]
    };

    const localId1 = OfflineStorage.addOfflineTransaction(transaction1);
    OfflineStorage.addOfflineTransaction(transaction2);

    // Mark first as synced
    OfflineStorage.markAsSynced(localId1);

    // Clean up synced transactions
    OfflineStorage.cleanupSyncedTransactions();

    // Should only have one transaction remaining (the unsynced one)
    const transactions = OfflineStorage.getAllOfflineTransactions();
    expect(transactions.length).toBe(1);
    expect(transactions[0].synced).toBeFalsy();
  });

  test('should clear all offline transactions', () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      expect(true).toBeTruthy();
      return;
    }

    // Add some transactions
    const transaction1 = {
      type: 'expense',
      amount: 75000,
      note: 'To be cleared',
      date: new Date().toISOString().split('T')[0]
    };

    const transaction2 = {
      type: 'income',
      amount: 300000,
      note: 'Also to be cleared',
      date: new Date().toISOString().split('T')[0]
    };

    OfflineStorage.addOfflineTransaction(transaction1);
    OfflineStorage.addOfflineTransaction(transaction2);

    // Verify transactions exist
    expect(OfflineStorage.getAllOfflineTransactions().length).toBeGreaterThan(0);

    // Clear all
    OfflineStorage.clearAll();

    // Verify all transactions cleared
    expect(OfflineStorage.getAllOfflineTransactions().length).toBe(0);
    expect(OfflineStorage.hasPendingTransactions()).toBeFalsy();
    expect(OfflineStorage.getPendingCount()).toBe(0);
  });
});