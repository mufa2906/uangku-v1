// Script to list all tables in the database
const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function listAllTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // List all tables
    const result = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name} (${row.table_schema})`);
    });
    
  } catch (err) {
    console.error('Error listing tables:', err);
  } finally {
    await client.end();
  }
}

listAllTables();