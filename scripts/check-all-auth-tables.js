const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkAllAuthTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check users table
    console.log('=== USERS TABLE ===');
    const usersResult = await client.query(`
      SELECT id, email, name, password, created_at, updated_at 
      FROM _uangku_users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (usersResult.rows.length === 0) {
      console.log('No user records found');
    } else {
      usersResult.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. User:`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Email: ${row.email}`);
        console.log(`   Name: ${row.name}`);
        console.log(`   Password: ${row.password ? `[SET - ${row.password.substring(0, 20)}...]` : 'NULL'}`);
        console.log(`   Created: ${row.created_at}`);
      });
    }
    
    // Check accounts table
    console.log('\n=== ACCOUNTS TABLE ===');
    const accountsResult = await client.query(`
      SELECT id, account_id, provider_id, user_id, password, created_at, updated_at 
      FROM _uangku_accounts 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (accountsResult.rows.length === 0) {
      console.log('No account records found');
    } else {
      accountsResult.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Account:`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Account ID: ${row.account_id}`);
        console.log(`   Provider ID: ${row.provider_id}`);
        console.log(`   User ID: ${row.user_id}`);
        console.log(`   Password: ${row.password ? `[SET - ${row.password.substring(0, 20)}...]` : 'NULL'}`);
        console.log(`   Created: ${row.created_at}`);
      });
    }
    
    // Check sessions table
    console.log('\n=== SESSIONS TABLE ===');
    const sessionsResult = await client.query(`
      SELECT id, user_id, expires_at, created_at 
      FROM _uangku_sessions 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (sessionsResult.rows.length === 0) {
      console.log('No session records found');
    } else {
      sessionsResult.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Session:`);
        console.log(`   ID: ${row.id}`);
        console.log(`   User ID: ${row.user_id}`);
        console.log(`   Expires: ${row.expires_at}`);
        console.log(`   Created: ${row.created_at}`);
      });
    }
    
  } catch (err) {
    console.error('Error checking auth tables:', err);
  } finally {
    await client.end();
  }
}

checkAllAuthTables();