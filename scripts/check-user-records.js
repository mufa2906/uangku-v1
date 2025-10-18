const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkUserRecords() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check the latest user records
    const result = await client.query(`
      SELECT id, email, name, password, created_at, updated_at 
      FROM _uangku_users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('Latest 5 user records:');
    if (result.rows.length === 0) {
      console.log('No user records found');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. User:`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Email: ${row.email}`);
        console.log(`   Name: ${row.name}`);
        console.log(`   Password: ${row.password ? `[HASHED - ${row.password.substring(0, 20)}...]` : 'NULL'}`);
        console.log(`   Created: ${row.created_at}`);
      });
    }
    
  } catch (err) {
    console.error('Error checking user records:', err);
  } finally {
    await client.end();
  }
}

checkUserRecords();