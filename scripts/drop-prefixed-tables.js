const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function dropPrefixedTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Drop existing _uangku_ prefixed tables if they exist
    const tables = ['_uangku_verification_tokens', '_uangku_sessions', '_uangku_accounts', '_uangku_users'];
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`Dropped table ${table}`);
      } catch (err) {
        console.log(`Error dropping ${table}:`, err.message);
      }
    }
    
    console.log('All _uangku_ prefixed tables dropped successfully!');
    
  } catch (err) {
    console.error('Error dropping tables:', err);
  } finally {
    await client.end();
  }
}

dropPrefixedTables();