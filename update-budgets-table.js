// update-budgets-table.js
require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { sql } = require('drizzle-orm');

async function updateBudgetsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const db = drizzle(pool);

  try {
    console.log('Starting database update...');
    
    // Add wallet_id column
    console.log('Adding wallet_id column...');
    await db.execute(sql`
      ALTER TABLE budgets 
      ADD COLUMN IF NOT EXISTS wallet_id uuid 
      REFERENCES wallets(id) ON DELETE CASCADE
    `);
    
    // Add allocated_amount column
    console.log('Adding allocated_amount column...');
    await db.execute(sql`
      ALTER TABLE budgets 
      ADD COLUMN IF NOT EXISTS allocated_amount numeric(14, 2) NOT NULL DEFAULT '0'
    `);
    
    // Add remaining_amount column
    console.log('Adding remaining_amount column...');
    await db.execute(sql`
      ALTER TABLE budgets 
      ADD COLUMN IF NOT EXISTS remaining_amount numeric(14, 2) NOT NULL DEFAULT '0'
    `);
    
    // Copy existing amount values to allocated_amount and remaining_amount
    console.log('Copying existing amount values...');
    await db.execute(sql`
      UPDATE budgets 
      SET allocated_amount = amount, 
          remaining_amount = amount 
      WHERE allocated_amount = '0' AND remaining_amount = '0'
    `);
    
    // Drop the old amount column
    console.log('Dropping old amount column...');
    await db.execute(sql`
      ALTER TABLE budgets 
      DROP COLUMN IF EXISTS amount
    `);
    
    // Make wallet_id NOT NULL
    console.log('Setting wallet_id to NOT NULL...');
    await db.execute(sql`
      ALTER TABLE budgets 
      ALTER COLUMN wallet_id SET NOT NULL
    `);
    
    console.log('Database update completed successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await pool.end();
  }
}

updateBudgetsTable();