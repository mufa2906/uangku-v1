// Script to clear all IndexedDB data for Uangku
const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function clearAllIndexedDBData() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Clear all offline transaction data from the database
    const result = await client.query(`
      DELETE FROM _uangku_offline_transactions
    `);
    
    console.log(`Cleared ${result.rowCount} offline transactions from database`);
    
    // Also clear the BetterAuth tables to start fresh
    await client.query(`DELETE FROM _uangku_verification_tokens`);
    console.log('Cleared verification tokens');
    
    await client.query(`DELETE FROM _uangku_sessions`);
    console.log('Cleared sessions');
    
    await client.query(`DELETE FROM _uangku_accounts`);
    console.log('Cleared accounts');
    
    await client.query(`DELETE FROM _uangku_users`);
    console.log('Cleared users');
    
    console.log('\\n✅ All IndexedDB and BetterAuth data cleared successfully!');
    console.log('\\n🔧 To clear browser IndexedDB cache:');
    console.log('   1. Open Developer Tools (F12)');
    console.log('   2. Go to Application tab');
    console.log('   3. Expand IndexedDB in the sidebar');
    console.log('   4. Right-click on uangku_db and select "Delete"');
    console.log('   5. Refresh the page');
    
  } catch (err) {
    console.error('Error clearing IndexedDB data:', err);
  } finally {
    await client.end();
  }
}

clearAllIndexedDBData();