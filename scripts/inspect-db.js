const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function inspectDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // List all tables
    const tables = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name} (${row.table_schema})`);
    });
    
    // Check for any users tables
    console.log('\nChecking users tables...');
    const usersTables = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_name LIKE '%users%'
      ORDER BY table_name
    `);
    
    if (usersTables.rows.length > 0) {
      for (const table of usersTables.rows) {
        console.log(`\nTable: ${table.table_name}`);
        const columns = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [table.table_name]);
        
        columns.rows.forEach(row => {
          console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
      }
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

inspectDatabase();