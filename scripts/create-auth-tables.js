const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createAuthTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        email_verified BOOLEAN DEFAULT false,
        image VARCHAR(255),
        password VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('Created users table');
    
    // Create accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    console.log('Created accounts table');
    
    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('Created sessions table');
    
    // Create verification_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);
    console.log('Created verification_tokens table');
    
    console.log('All BetterAuth tables created successfully!');
    
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await client.end();
  }
}

createAuthTables();