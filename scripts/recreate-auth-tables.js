const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function recreateAuthTablesWithPrefix() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Drop existing BetterAuth tables if they exist
    const tables = ['verification_tokens', 'sessions', 'accounts', 'users'];
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`Dropped table ${table}`);
      } catch (err) {
        console.log(`Error dropping ${table}:`, err.message);
      }
    }
    
    // Create tables with _uangku_ prefix
    console.log('\nCreating tables with _uangku_ prefix...');
    
    // Create _uangku_users table
    await client.query(`
      CREATE TABLE _uangku_users (
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
    console.log('Created _uangku_users table');
    
    // Create _uangku_accounts table
    await client.query(`
      CREATE TABLE _uangku_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        provider_id VARCHAR(50) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at INTEGER,
        token_type VARCHAR(50),
        scope VARCHAR(255),
        id_token TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);
    console.log('Created _uangku_verification_tokens table');
    
    console.log('\nAll _uangku_ prefixed BetterAuth tables created successfully!');
    
  } catch (err) {
    console.error('Error recreating BetterAuth tables:', err);
  } finally {
    await client.end();
  }
}

recreateAuthTablesWithPrefix();