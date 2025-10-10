// scripts/check-bills-table.ts
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkBillsTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if bills table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'bills'
      );
    `);
    
    const tableExists = result.rows[0].exists;
    console.log('Bills table exists:', tableExists);
    
    if (tableExists) {
      // Show table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'bills'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nBills table columns:');
      columns.rows.forEach(row => {
        console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking bills table:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkBillsTable();