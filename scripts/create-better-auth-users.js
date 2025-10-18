const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createBetterAuthUsersTable() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Create the BetterAuth users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        email_verified BOOLEAN DEFAULT false,
        image VARCHAR(255),
        password VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    console.log('Created BetterAuth users table with VARCHAR id');
    
    // Also update the accounts table to reference the new users table
    await client.query(`
      ALTER TABLE accounts 
      DROP CONSTRAINT IF EXISTS accounts_user_id_users_id_fk
    `);
    
    await client.query(`
      ALTER TABLE accounts 
      ADD CONSTRAINT accounts_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);
    
    console.log('Updated accounts table foreign key constraint');
    
    // Also update the sessions table
    await client.query(`
      ALTER TABLE sessions 
      DROP CONSTRAINT IF EXISTS sessions_user_id_users_id_fk
    `);
    
    await client.query(`
      ALTER TABLE sessions 
      ADD CONSTRAINT sessions_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);
    
    console.log('Updated sessions table foreign key constraint');
    
    console.log('All BetterAuth tables updated successfully!');
    
  } catch (err) {
    console.error('Error creating BetterAuth users table:', err);
  } finally {
    await client.end();
  }
}

createBetterAuthUsersTable();