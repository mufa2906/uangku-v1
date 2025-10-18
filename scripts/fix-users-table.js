const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function fixUsersTableId() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if the users table exists and what columns it has
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current users table columns:');
    columns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // We need to alter the id column from uuid to varchar(255)
    console.log('\nAltering users table id column from uuid to varchar(255)...');
    
    // First, we need to drop the primary key constraint
    try {
      await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey`);
      console.log('Dropped primary key constraint');
    } catch (err) {
      console.log('No primary key constraint to drop or error dropping it:', err.message);
    }
    
    // Then alter the id column type
    await client.query(`ALTER TABLE users ALTER COLUMN id TYPE varchar(255)`);
    console.log('Changed id column type to varchar(255)');
    
    // Add back the primary key constraint
    await client.query(`ALTER TABLE users ADD PRIMARY KEY (id)`);
    console.log('Added primary key constraint back');
    
    console.log('Successfully modified users table');
    
  } catch (err) {
    console.error('Error modifying users table:', err);
  } finally {
    await client.end();
  }
}

fixUsersTableId();