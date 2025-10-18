// scripts/test-offline-storage.ts
// Test script to verify offline storage functionality

import { IndexedDBStorage } from '../src/lib/indexeddb-storage';

async function testOfflineStorage() {
  console.log('Testing Offline Storage...');

  try {
    // Test adding a transaction
    console.log('1. Adding a test transaction...');
    const testTransaction = {
      type: 'expense',
      amount: 10000,
      note: 'Test transaction',
      date: new Date().toISOString().split('T')[0],
      categoryId: 'food',
      walletId: 'cash'
    };
    
    const id = await IndexedDBStorage.addOfflineTransaction(testTransaction);
    console.log(`   Transaction added with ID: ${id}`);
    
    if (!id) {
      throw new Error('Failed to add transaction');
    }

    // Test getting all transactions
    console.log('2. Getting all offline transactions...');
    const allTransactions = await IndexedDBStorage.getAllOfflineTransactions();
    console.log(`   Found ${allTransactions.length} transactions`);
    
    if (allTransactions.length === 0) {
      throw new Error('No transactions found');
    }
    
    const transaction = allTransactions[0];
    console.log(`   Transaction details:`, transaction);
    
    // Test getting pending transactions
    console.log('3. Getting pending (unsynced) transactions...');
    const pendingTransactions = await IndexedDBStorage.getOfflineTransactions();
    console.log(`   Found ${pendingTransactions.length} pending transactions`);
    
    // Test marking as synced
    console.log('4. Marking transaction as synced...');
    const serverId = 'server-12345';
    const marked = await IndexedDBStorage.markAsSynced(id, serverId);
    console.log(`   Transaction marked as synced: ${marked}`);
    
    if (!marked) {
      throw new Error('Failed to mark transaction as synced');
    }

    // Test getting pending transactions again (should be 0 now)
    console.log('5. Getting pending transactions after sync...');
    const pendingAfterSync = await IndexedDBStorage.getOfflineTransactions();
    console.log(`   Found ${pendingAfterSync.length} pending transactions`);
    
    if (pendingAfterSync.length !== 0) {
      throw new Error('Pending transactions should be 0 after sync');
    }

    // Test cleanup
    console.log('6. Cleaning up synced transactions...');
    await IndexedDBStorage.cleanupSyncedTransactions();
    
    const allAfterCleanup = await IndexedDBStorage.getAllOfflineTransactions();
    console.log(`   All transactions after cleanup: ${allAfterCleanup.length}`);
    
    // Test clearing all
    console.log('7. Clearing all transactions...');
    await IndexedDBStorage.clearAll();
    
    const allAfterClear = await IndexedDBStorage.getAllOfflineTransactions();
    console.log(`   All transactions after clear: ${allAfterClear.length}`);
    
    if (allAfterClear.length !== 0) {
      throw new Error('Transactions should be 0 after clear');
    }

    console.log('\n✅ All offline storage tests passed!');
  } catch (error) {
    console.error('\n❌ Offline storage test failed:', error);
    process.exit(1);
  }
}

// Run the test
testOfflineStorage();