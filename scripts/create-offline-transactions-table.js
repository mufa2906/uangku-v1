// Script to create offline transactions table
const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createOfflineTransactionsTable() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Create offline transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _uangku_offline_transactions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        transaction_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        synced BOOLEAN DEFAULT FALSE,
        server_id VARCHAR(255)
      )
    `);
    
    console.log('Created _uangku_offline_transactions table');
    
    // Add index on synced column for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_offline_transactions_synced 
      ON _uangku_offline_transactions (synced)
    `);
    
    console.log('Created index on synced column');
    
    // Add index on user_id column for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_offline_transactions_user_id 
      ON _uangku_offline_transactions (user_id)
    `);
    
    console.log('Created index on user_id column');
    
    console.log('\n✅ Offline transactions table created successfully!');
    
  } catch (err) {
    console.error('Error creating offline transactions table:', err);
  } finally {
    await client.end();
  }
}

createOfflineTransactionsTable();