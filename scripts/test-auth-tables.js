const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function testAuthTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if the prefixed tables exist
    const tables = ['_uangku_users', '_uangku_accounts', '_uangku_sessions', '_uangku_verification_tokens'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${result.rows[0].count} rows`);
      } catch (err) {
        console.log(`${table}: Table does not exist or error: ${err.message}`);
      }
    }
    
    // Try to insert a test user
    try {
      const userId = 'test-user-id-123';
      const userEmail = 'test@example.com';
      
      const result = await client.query(`
        INSERT INTO _uangku_users (id, email, email_verified, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET 
          updated_at = NOW()
        RETURNING id, email, name
      `, [userId, userEmail, false, 'Test User']);
      
      console.log('Inserted/Updated user:', result.rows[0]);
      
      // Clean up the test user
      await client.query(`DELETE FROM _uangku_users WHERE id = $1`, [userId]);
      console.log('Cleaned up test user');
      
    } catch (err) {
      console.error('Error testing user insertion:', err.message);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

testAuthTables();