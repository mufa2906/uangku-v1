// simple-db-update.js
const { Client } = require('pg');

async function updateDatabase() {
  // Parse the DATABASE_URL
  const databaseUrl = 'postgresql://postgres.hqffseuofnziszoecnzh:6aEVVfS1l27QEh0Q@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  
  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('budgets', 'wallets')
    `);
    
    console.log('Existing tables:', tables.rows);

    // Check current columns in budgets table
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'budgets'
    `);
    
    console.log('Current budgets columns:');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}, ${col.is_nullable})`);
    });

    // Apply updates one by one
    console.log('\nApplying updates...');

    // 1. Add wallet_id column
    try {
      await client.query(`
        ALTER TABLE budgets 
        ADD COLUMN IF NOT EXISTS wallet_id uuid 
        REFERENCES wallets(id) ON DELETE CASCADE
      `);
      console.log('✓ Added wallet_id column');
    } catch (err) {
      console.log('× Error adding wallet_id column:', err.message);
    }

    // 2. Add allocated_amount column
    try {
      await client.query(`
        ALTER TABLE budgets 
        ADD COLUMN IF NOT EXISTS allocated_amount numeric(14, 2) NOT NULL DEFAULT '0'
      `);
      console.log('✓ Added allocated_amount column');
    } catch (err) {
      console.log('× Error adding allocated_amount column:', err.message);
    }

    // 3. Add remaining_amount column
    try {
      await client.query(`
        ALTER TABLE budgets 
        ADD COLUMN IF NOT EXISTS remaining_amount numeric(14, 2) NOT NULL DEFAULT '0'
      `);
      console.log('✓ Added remaining_amount column');
    } catch (err) {
      console.log('× Error adding remaining_amount column:', err.message);
    }

    // 4. Copy existing amount values (if amount column exists)
    try {
      const hasAmountColumn = await client.query(`
        SELECT column_name 
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'budgets'
        AND column_name = 'amount'
      `);
      
      if (hasAmountColumn.rows.length > 0) {
        await client.query(`
          UPDATE budgets 
          SET allocated_amount = amount, 
              remaining_amount = amount 
          WHERE allocated_amount = '0' AND remaining_amount = '0'
        `);
        console.log('✓ Copied amount values to new columns');
      } else {
        console.log('- Amount column does not exist, skipping copy');
      }
    } catch (err) {
      console.log('× Error copying amount values:', err.message);
    }

    // 5. Drop the old amount column (if it exists)
    try {
      const hasAmountColumn = await client.query(`
        SELECT column_name 
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'budgets'
        AND column_name = 'amount'
      `);
      
      if (hasAmountColumn.rows.length > 0) {
        await client.query(`
          ALTER TABLE budgets 
          DROP COLUMN IF EXISTS amount
        `);
        console.log('✓ Dropped old amount column');
      } else {
        console.log('- Amount column does not exist, skipping drop');
      }
    } catch (err) {
      console.log('× Error dropping amount column:', err.message);
    }

    // 6. Make wallet_id NOT NULL (but only if there are no NULL values)
    try {
      const nullWalletIds = await client.query(`
        SELECT COUNT(*) as count
        FROM budgets
        WHERE wallet_id IS NULL
      `);
      
      if (parseInt(nullWalletIds.rows[0].count) === 0) {
        await client.query(`
          ALTER TABLE budgets 
          ALTER COLUMN wallet_id SET NOT NULL
        `);
        console.log('✓ Set wallet_id to NOT NULL');
      } else {
        console.log(`- Cannot set wallet_id to NOT NULL because there are ${nullWalletIds.rows[0].count} NULL values`);
      }
    } catch (err) {
      console.log('× Error setting wallet_id to NOT NULL:', err.message);
    }

    console.log('\nDatabase update process completed!');
    
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
  }
}

updateDatabase();