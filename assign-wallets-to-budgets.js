// assign-wallets-to-budgets.js
const { Client } = require('pg');

async function assignWalletsToBudgets() {
  // Parse the DATABASE_URL
  const databaseUrl = 'postgresql://postgres.hqffseuofnziszoecnzh:6aEVVfS1l27QEh0Q@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  
  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check if there are any budgets with NULL wallet_id
    const nullWalletBudgets = await client.query(`
      SELECT id, user_id, name
      FROM budgets
      WHERE wallet_id IS NULL
    `);
    
    console.log(`Found ${nullWalletBudgets.rows.length} budgets with NULL wallet_id`);
    
    if (nullWalletBudgets.rows.length > 0) {
      console.log('Budgets with NULL wallet_id:');
      nullWalletBudgets.rows.forEach(budget => {
        console.log(`  ${budget.id} - ${budget.name || 'Unnamed'} (User: ${budget.user_id})`);
      });
      
      // For each user with NULL wallet_id budgets, try to find a default wallet
      const userBudgets = {};
      nullWalletBudgets.rows.forEach(budget => {
        if (!userBudgets[budget.user_id]) {
          userBudgets[budget.user_id] = [];
        }
        userBudgets[budget.user_id].push(budget);
      });
      
      // For each user, find their wallets
      for (const userId in userBudgets) {
        console.log(`\nProcessing budgets for user ${userId}...`);
        
        // Get user's wallets
        const userWallets = await client.query(`
          SELECT id, name, balance
          FROM wallets
          WHERE user_id = $1
          ORDER BY created_at ASC
          LIMIT 1
        `, [userId]);
        
        if (userWallets.rows.length > 0) {
          const defaultWallet = userWallets.rows[0];
          console.log(`  Found default wallet: ${defaultWallet.name} (${defaultWallet.id})`);
          
          // Assign this wallet to all budgets for this user
          const budgetIds = userBudgets[userId].map(b => b.id);
          console.log(`  Assigning ${budgetIds.length} budgets to wallet ${defaultWallet.id}`);
          
          const updateResult = await client.query(`
            UPDATE budgets
            SET wallet_id = $1
            WHERE id = ANY($2::uuid[])
          `, [defaultWallet.id, budgetIds]);
          
          console.log(`  Successfully updated ${updateResult.rowCount} budgets`);
        } else {
          console.log(`  No wallets found for user ${userId}`);
        }
      }
      
      // Now try to set wallet_id to NOT NULL
      console.log('\nTrying to set wallet_id to NOT NULL...');
      try {
        await client.query(`
          ALTER TABLE budgets 
          ALTER COLUMN wallet_id SET NOT NULL
        `);
        console.log('✓ Successfully set wallet_id to NOT NULL');
      } catch (err) {
        console.log('× Error setting wallet_id to NOT NULL:', err.message);
      }
    } else {
      console.log('All budgets already have wallet_id assigned');
    }
    
    console.log('\nWallet assignment process completed!');
    
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
  }
}

assignWalletsToBudgets();