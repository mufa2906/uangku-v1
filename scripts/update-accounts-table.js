const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function updateAccountsTable() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Add the missing accountId column to _uangku_accounts
    try {
      await client.query(`ALTER TABLE _uangku_accounts ADD COLUMN IF NOT EXISTS account_id VARCHAR(255)`);
      console.log('Added account_id column to _uangku_accounts');
    } catch (err) {
      console.log('Column account_id may already exist:', err.message);
    }
    
    // Make sure the id column is varchar(255) instead of uuid
    try {
      await client.query(`ALTER TABLE _uangku_accounts ALTER COLUMN id TYPE VARCHAR(255)`);
      console.log('Changed id column type to VARCHAR(255)');
    } catch (err) {
      console.log('Could not change id column type:', err.message);
    }
    
    console.log('Accounts table updated successfully!');
    
  } catch (err) {
    console.error('Error updating accounts table:', err);
  } finally {
    await client.end();
  }
}

updateAccountsTable();