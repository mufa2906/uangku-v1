const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if users table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'accounts', 'sessions', 'verification_tokens')
      ORDER BY table_name
    `);
    
    if (result.rows.length > 0) {
      console.log('Existing BetterAuth tables:');
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('No BetterAuth tables found');
    }
    
    // Check all tables
    const allTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nAll tables in database:');
    allTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkTables();