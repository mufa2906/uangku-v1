const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function renameUsersTable() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if auth_users table already exists
    const exists = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'auth_users'
    `);
    
    if (exists.rows.length > 0) {
      console.log('auth_users table already exists');
      return;
    }
    
    // Rename the existing users table to auth_users
    console.log('Renaming existing users table to auth_users...');
    await client.query(`ALTER TABLE users RENAME TO auth_users`);
    console.log('Successfully renamed users table to auth_users');
    
    // Also rename any constraints that reference the old name
    try {
      await client.query(`ALTER INDEX IF EXISTS users_pkey RENAME TO auth_users_pkey`);
      console.log('Renamed primary key index');
    } catch (err) {
      console.log('Could not rename primary key index:', err.message);
    }
    
  } catch (err) {
    console.error('Error renaming users table:', err);
  } finally {
    await client.end();
  }
}

renameUsersTable();