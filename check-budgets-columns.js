// check-budgets-columns.js
const { Client } = require('pg');

async function checkBudgetsColumns() {
  const databaseUrl = 'postgresql://postgres.hqffseuofnziszoecnzh:6aEVVfS1l27QEh0Q@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  
  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check current columns in budgets table
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'budgets'
      ORDER BY ordinal_position
    `);
    
    console.log('Current budgets columns:');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}, ${col.is_nullable}${col.column_default ? `, default: ${col.column_default}` : ''})`);
    });

    console.log('\nChecking if wallet_id column exists...');
    const walletIdExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'budgets'
      AND column_name = 'wallet_id'
    `);
    
    if (walletIdExists.rows.length > 0) {
      console.log('✓ wallet_id column exists');
    } else {
      console.log('× wallet_id column does not exist');
    }

    console.log('\nChecking if allocated_amount column exists...');
    const allocatedAmountExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'budgets'
      AND column_name = 'allocated_amount'
    `);
    
    if (allocatedAmountExists.rows.length > 0) {
      console.log('✓ allocated_amount column exists');
    } else {
      console.log('× allocated_amount column does not exist');
    }

    console.log('\nChecking if remaining_amount column exists...');
    const remainingAmountExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'budgets'
      AND column_name = 'remaining_amount'
    `);
    
    if (remainingAmountExists.rows.length > 0) {
      console.log('✓ remaining_amount column exists');
    } else {
      console.log('× remaining_amount column does not exist');
    }

    console.log('\nChecking if amount column still exists...');
    const amountExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'budgets'
      AND column_name = 'amount'
    `);
    
    if (amountExists.rows.length > 0) {
      console.log('× amount column still exists (should have been dropped)');
    } else {
      console.log('✓ amount column has been dropped');
    }

    console.log('\nChecking wallet_id constraints...');
    const constraints = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name = 'budgets'
      AND constraint_name LIKE '%wallet%'
    `);
    
    if (constraints.rows.length > 0) {
      console.log('Found wallet-related constraints:');
      constraints.rows.forEach(constraint => {
        console.log(`  ${constraint.constraint_name} (${constraint.constraint_type})`);
      });
    } else {
      console.log('No wallet-related constraints found');
    }
    
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
  }
}

checkBudgetsColumns();