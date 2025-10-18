const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function updateUsersTableSchema() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Remove password column from _uangku_users if it exists
    try {
      await client.query(`ALTER TABLE _uangku_users DROP COLUMN IF EXISTS password`);
      console.log('Removed password column from _uangku_users table');
    } catch (err) {
      console.log('No password column to remove or error removing it:', err.message);
    }
    
    console.log('Users table schema updated successfully!');
    
  } catch (err) {
    console.error('Error updating users table schema:', err);
  } finally {
    await client.end();
  }
}

updateUsersTableSchema();