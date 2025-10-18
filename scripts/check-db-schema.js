const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkDatabaseSchema() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check the structure of _uangku_accounts table
    console.log('\\n=== Checking _uangku_accounts table structure ===');
    const accountsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = '_uangku_accounts' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in _uangku_accounts:');
    accountsColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check the structure of _uangku_users table
    console.log('\\n=== Checking _uangku_users table structure ===');
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = '_uangku_users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in _uangku_users:');
    usersColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check foreign key constraints
    console.log('\\n=== Checking foreign key constraints ===');
    const fkConstraints = await client.query(`
      SELECT 
        kcu.constraint_name,
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = '_uangku_accounts' OR tc.table_name = '_uangku_sessions')
      ORDER BY tc.table_name
    `);
    
    if (fkConstraints.rows.length > 0) {
      console.log('Foreign key constraints:');
      fkConstraints.rows.forEach(row => {
        console.log(`  ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('No foreign key constraints found');
    }
    
  } catch (err) {
    console.error('Error checking database schema:', err);
  } finally {
    await client.end();
  }
}

checkDatabaseSchema();