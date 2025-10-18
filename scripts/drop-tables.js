const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function dropTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Drop tables in correct order to avoid foreign key constraints
    const tables = ['verification_tokens', 'sessions', 'accounts', 'users'];
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`Dropped table ${table}`);
      } catch (err) {
        console.log(`Error dropping ${table}:`, err.message);
      }
    }
    
    console.log('All tables dropped successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

dropTables();