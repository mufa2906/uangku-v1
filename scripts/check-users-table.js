const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkUsersTable() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check the users table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'id'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length > 0) {
      console.log('Users table ID column:');
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
      });
    } else {
      console.log('ID column not found in users table');
    }
    
    // Also check a few sample rows if they exist
    try {
      const sample = await client.query(`SELECT id FROM users LIMIT 1`);
      if (sample.rows.length > 0) {
        console.log('Sample user ID:', sample.rows[0].id);
        console.log('Sample user ID type:', typeof sample.rows[0].id);
      } else {
        console.log('No users found in table');
      }
    } catch (err) {
      console.log('Could not query sample users:', err.message);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkUsersTable();