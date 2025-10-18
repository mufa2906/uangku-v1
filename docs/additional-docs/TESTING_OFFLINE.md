# Testing Offline Functionality

This document provides comprehensive instructions for testing the offline capabilities of Uangku Progressive Web App.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Testing Methods](#testing-methods)
3. [Test Scenarios](#test-scenarios)
4. [Verification Points](#verification-points)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment
- Node.js 18+
- Chrome, Firefox, Edge, or Safari browser
- Mobile device (optional but recommended)
- Internet connection for initial setup

### Application Setup
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the application at `http://localhost:3000`
3. Install the PWA (if testing installed app scenario)
4. Ensure service worker is registered:
   - Open DevTools → Application tab
   - Verify service worker shows as "activated and running"

## Testing Methods

### Method 1: Browser DevTools Network Throttling
1. Open Chrome DevTools (F12)
2. Go to the Network tab
3. Click the "Offline" checkbox to simulate offline conditions
4. Continue using the application normally

### Method 2: Physical Disconnection
1. Disconnect your Wi-Fi or ethernet connection
2. Continue using the application
3. Reconnect to test sync functionality

### Method 3: Mobile Device Testing
1. Install the PWA on your mobile device
2. Turn on airplane mode
3. Open the installed application
4. Turn off airplane mode to test sync

## Test Scenarios

### Scenario 1: Basic Offline Access
**Objective**: Verify that the application loads when offline

1. Load the application while online
2. Open DevTools → Network tab
3. Click "Offline" to simulate disconnection
4. Refresh the page
5. Verify:
   - Application loads successfully
   - Shows offline mode or cached content
   - No error messages

### Scenario 2: Offline Transaction Creation
**Objective**: Verify that transactions can be created while offline

1. Ensure you're in offline mode
2. Navigate to the Offline mode page (`/offline`)
3. Fill in transaction details:
   - Type: Income or Expense
   - Amount: Numeric value (e.g., 150000)
   - Note: Description (e.g., "Test offline transaction")
   - Date: Transaction date
4. Click "Save Offline Transaction"
5. Verify:
   - Success message appears
   - Transaction appears in offline transaction list
   - Transaction is stored in localStorage

### Scenario 3: Offline Transaction Storage
**Objective**: Verify that offline transactions persist

1. Create several offline transactions (Scenario 2)
2. Close and reopen the browser tab
3. Navigate back to the application
4. Go to `/offline` page
5. Verify:
   - All previously created transactions still appear
   - Data is persisted in localStorage
   - No data loss occurred

### Scenario 4: Sync When Back Online
**Objective**: Verify that offline transactions sync when connectivity returns

1. Create several offline transactions (Scenario 2)
2. Ensure you're still offline
3. Restore network connectivity:
   - Uncheck "Offline" in DevTools Network tab
   - Or reconnect your Wi-Fi
4. Observe the application behavior:
   - Should automatically detect online status
   - Should begin syncing pending transactions
   - Should redirect to main app (`/dashboard`)
5. Verify:
   - All offline transactions appear in main transaction list
   - Server IDs assigned to synced transactions
   - Offline storage cleared of synced transactions

### Scenario 5: Partial Offline Periods
**Objective**: Verify that transactions created during intermittent connectivity work correctly

1. Start with online connectivity
2. Create a transaction (should sync immediately)
3. Go offline
4. Create several offline transactions
5. Go back online
6. Create more online transactions
7. Go offline again
8. Create more offline transactions
9. Go online
10. Verify:
    - All transactions of all types appear in final transaction list
    - No data duplication
    - Correct chronological order

### Scenario 6: Offline Transaction Validation
**Objective**: Verify that offline transactions respect validation rules

1. Try to create offline transaction without required fields:
   - Empty amount
   - Empty note
   - Invalid date format
2. Verify:
   - Appropriate validation messages appear
   - Transaction not saved with invalid data
   - Form doesn't submit with invalid data

### Scenario 7: Large Batch Offline Transactions
**Objective**: Verify that many offline transactions handle correctly

1. While offline:
   - Create 50+ offline transactions
   - Vary types (income/expense)
   - Use different amounts and notes
2. Go back online
3. Verify:
   - All 50+ transactions sync successfully
   - No timeout or performance issues
   - Correct order maintained

### Scenario 8: Concurrent Offline Sessions
**Objective**: Verify that multiple browser windows/tabs handle offline correctly

1. Open two browser windows/tabs to application
2. Make one tab offline, keep the other online
3. Create transactions in both tabs
4. Make both tabs online
5. Verify:
   - All transactions from both tabs sync correctly
   - No data conflicts
   - No duplicate transactions

### Scenario 9: IndexedDB Storage Verification
**Objective**: Verify that transactions are stored in IndexedDB as primary storage

1. Open DevTools → Application tab → IndexedDB
2. Look for the "_uangku_db" database
3. Verify that the "offline_transactions" object store exists
4. Go offline and create a transaction
5. Refresh the IndexedDB view
6. Verify:
   - Transaction appears in IndexedDB with `synced: false`
   - Transaction data is correctly stored
   - Local ID is properly generated

### Scenario 10: localStorage Fallback Testing
**Objective**: Verify that localStorage is used as fallback when IndexedDB is unavailable

1. Disable IndexedDB in browser (DevTools → Application → Clear storage → IndexedDB)
2. Simulate offline conditions
3. Create a transaction
4. Check localStorage for the transaction
5. Verify:
   - Transaction is stored in localStorage with `synced: false`
   - Local ID is properly generated
   - Transaction data is correctly stored

### Scenario 11: Migration from localStorage to IndexedDB
**Objective**: Verify that existing localStorage data migrates to IndexedDB

1. Add some transactions to localStorage using the old system
2. Clear IndexedDB data
3. Access the application (this should trigger migration)
4. Check IndexedDB for the migrated transactions
5. Verify that localStorage is cleared after migration
6. Verify:
   - All localStorage transactions appear in IndexedDB
   - localStorage is emptied after successful migration
   - Transactions maintain their original data

## Verification Points

### Service Worker Registration
- [ ] Service worker is registered successfully
- [ ] Service worker activates without errors
- [ ] Service worker handles fetch events
- [ ] Service worker caches appropriate assets

### Offline Storage
- [ ] offline_transactions localStorage entry exists (legacy fallback)
- [ ] IndexedDB database exists with correct structure
- [ ] Transactions stored with correct structure in IndexedDB
- [ ] Synced transactions properly marked in IndexedDB
- [ ] Clean up of synced transactions works in IndexedDB
- [ ] Migration from localStorage to IndexedDB works correctly
- [ ] Fallback to localStorage when IndexedDB unavailable

### IndexedDB Operations
- [ ] IndexedDB transactions save quickly (<1 second)
- [ ] IndexedDB handles large datasets efficiently
- [ ] IndexedDB transactions persist across sessions
- [ ] IndexedDB transactions sync correctly when online
- [ ] IndexedDB error handling works properly
- [ ] IndexedDB transactions can be updated and deleted
- [ ] IndexedDB properly handles concurrent operations

### Application Behavior
- [ ] Offline mode detection accurate
- [ ] Online mode detection accurate
- [ ] Automatic sync when online
- [ ] User notifications for sync status
- [ ] Graceful degradation in offline mode

### Data Integrity
- [ ] No data loss during offline/online transitions
- [ ] Correct transaction data maintained
- [ ] Proper transaction IDs assigned after sync
- [ ] No duplicate transactions created

### Performance
- [ ] Offline transactions save quickly (<1 second)
- [ ] Sync completes promptly when online
- [ ] Large batches handle without freezing
- [ ] Memory usage remains stable

## Troubleshooting

### Common Issues and Solutions

#### Issue: Service worker not registering
**Solution**:
1. Check that `sw.js` exists in `public/` directory
2. Verify that `PWARegistration` component is included in `_app.js`
3. Ensure `manifest.json` exists in `public/` directory
4. Check browser console for SW registration errors

#### Issue: Offline transactions not saving
**Solution**:
1. Verify `IndexedDB` is accessible and functioning
2. Check console for JavaScript errors
3. Ensure `IndexedDBStorage` class functions correctly
4. Verify IndexedDB permissions
5. Check fallback to `localStorage` if IndexedDB fails
6. Verify migration from `localStorage` to `IndexedDB` works correctly

#### Issue: Sync not working when online
**Solution**:
1. Check network connectivity
2. Verify IndexedDB transactions exist with `synced: false`
3. Check API endpoint `/api/offline-transactions` is accessible
4. Ensure authentication token is valid
5. Check server logs for sync errors
6. Verify database connections are working
7. Test with small batch of transactions first
1. Check browser console for sync errors
2. Verify API endpoint accessibility
3. Check authentication status
4. Ensure service worker can make network requests

#### Issue: Data loss during offline/online transitions
**Solution**:
1. Verify offline data is saved to localStorage
2. Check that sync process doesn't overwrite unsynced data
3. Ensure proper error handling in sync process
4. Verify that failed sync attempts retry

#### Issue: Performance issues with many offline transactions
**Solution**:
1. Consider batching sync requests
2. Implement pagination for large transaction lists
3. Optimize database queries
4. Add loading states for long operations

### Debugging Tools

#### Browser DevTools
1. **Application Tab**:
   - Service Workers section: Check registration status
   - Storage section: Inspect localStorage contents
   - Manifest section: Verify PWA manifest

2. **Network Tab**:
   - Monitor offline/online transitions
   - Check for failed requests when offline
   - Verify sync requests when online

3. **Console Tab**:
   - Check for JavaScript errors
   - Monitor console.log output for debugging info

#### Programmatic Debugging
```javascript
// Check service worker status
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('SW:', registration);
    }
  });
}

// Check offline storage
console.log('Offline transactions:', localStorage.getItem('uangku_offline_transactions'));

// Check online status
console.log('Online status:', navigator.onLine);
```

## Special Considerations

### iOS Safari Limitations
iOS Safari has limitations with PWAs compared to other browsers:
- Limited background sync capabilities
- Push notifications require user interaction
- Smaller service worker cache size limits

### Browser-Specific Testing
Different browsers may behave differently:
- **Chrome**: Best PWA support
- **Firefox**: Good PWA support with some quirks
- **Safari**: Limited PWA features
- **Edge**: Similar to Chrome

### Performance Optimization
For large datasets:
1. Implement pagination for offline transactions
2. Batch sync requests for better performance
3. Add progress indicators for long sync operations
4. Consider compression for large transaction batches

This comprehensive testing ensures that the offline functionality works reliably across different scenarios and provides users with a seamless experience even when connectivity is unavailable.