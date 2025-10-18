const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function recreateAuthTablesWithCorrectSchema() {
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
    
    console.log('\nCreating tables with correct BetterAuth schema...');
    
    // Create _uangku_users table
    await client.query(`
      CREATE TABLE _uangku_users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        email_verified BOOLEAN DEFAULT false NOT NULL,
        image TEXT,
        password TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log('Created _uangku_users table');
    
    // Create _uangku_accounts table
    await client.query(`
      CREATE TABLE _uangku_accounts (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        access_token_expires_at TIMESTAMP WITH TIME ZONE,
        refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
        scope TEXT,
        password TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log('Created _uangku_accounts table');
    
    // Add foreign key constraint for accounts
    await client.query(`
      ALTER TABLE _uangku_accounts 
      ADD CONSTRAINT accounts_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES _uangku_users(id) ON DELETE CASCADE
    `);
    console.log('Added foreign key constraint to _uangku_accounts');
    
    // Create _uangku_sessions table
    await client.query(`
      CREATE TABLE _uangku_sessions (
        id TEXT PRIMARY KEY,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        user_id TEXT NOT NULL
      )
    `);
    console.log('Created _uangku_sessions table');
    
    // Add foreign key constraint for sessions
    await client.query(`
      ALTER TABLE _uangku_sessions 
      ADD CONSTRAINT sessions_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES _uangku_users(id) ON DELETE CASCADE
    `);
    console.log('Added foreign key constraint to _uangku_sessions');
    
    // Create _uangku_verification_tokens table
    await client.query(`
      CREATE TABLE _uangku_verification_tokens (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log('Created _uangku_verification_tokens table');
    
    console.log('\nAll _uangku_ prefixed BetterAuth tables created with correct schema!');
    
  } catch (err) {
    console.error('Error recreating BetterAuth tables:', err);
  } finally {
    await client.end();
  }
}

recreateAuthTablesWithCorrectSchema();