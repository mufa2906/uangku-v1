const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createTestUserManually() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Create a test user manually to see if the schema works
    const userId = 'test-user-123';
    const userEmail = 'test@example.com';
    const userName = 'Test User';
    const userPassword = 'hashed_password_example_12345'; // This would normally be hashed
    
    console.log('Creating test user...');
    
    // Insert user into _uangku_users
    const userResult = await client.query(`
      INSERT INTO _uangku_users (id, email, name, password, email_verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET 
        updated_at = NOW()
      RETURNING id, email, name
    `, [userId, userEmail, userName, userPassword, false]);
    
    console.log('User created/updated:', userResult.rows[0]);
    
    // Insert account into _uangku_accounts
    const accountId = 'account-' + userId;
    const accountResult = await client.query(`
      INSERT INTO _uangku_accounts (
        id, account_id, provider_id, user_id, password, 
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, account_id, provider_id, user_id
    `, [accountId, accountId, 'credential', userId, userPassword]);
    
    console.log('Account created:', accountResult.rows[0]);
    
    // Clean up
    await client.query(`DELETE FROM _uangku_accounts WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM _uangku_users WHERE id = $1`, [userId]);
    console.log('Cleaned up test records');
    
  } catch (err) {
    console.error('Error creating test user:', err);
  } finally {
    await client.end();
  }
}

createTestUserManually();