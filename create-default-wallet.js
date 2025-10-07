// create-default-wallet.js
const { Client } = require('pg');
// Generate a simple UUID-like string for testing purposes
function generateSimpleUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function createDefaultWallet() {
  const databaseUrl = 'postgresql://postgres.hqffseuofnziszoecnzh:6aEVVfS1l27QEh0Q@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  
  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check if user has any wallets
    const userId = 'user_33U9jT8En57Y2yrCJe21vuhWUHK';
    const userWallets = await client.query(`
      SELECT id, name
      FROM wallets
      WHERE user_id = $1
    `, [userId]);
    
    if (userWallets.rows.length === 0) {
      console.log(`No wallets found for user ${userId}. Creating default wallet...`);
      
      // Create a default wallet
      const walletId = generateSimpleUuid();
      const walletName = 'Default Wallet';
      const walletType = 'cash';
      const currency = 'IDR';
      const balance = '0';
      
      const insertResult = await client.query(`
        INSERT INTO wallets (id, user_id, name, type, balance, currency, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, name
      `, [walletId, userId, walletName, walletType, balance, currency, true]);
      
      console.log(`Created default wallet: ${insertResult.rows[0].name} (${insertResult.rows[0].id})`);
      
      // Now assign this wallet to all budgets with NULL wallet_id for this user
      const updateResult = await client.query(`
        UPDATE budgets
        SET wallet_id = $1
        WHERE user_id = $2 AND wallet_id IS NULL
      `, [walletId, userId]);
      
      console.log(`Assigned default wallet to ${updateResult.rowCount} budgets`);
      
      // Now try to set wallet_id to NOT NULL
      console.log('Setting wallet_id to NOT NULL...');
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
      console.log(`User ${userId} already has ${userWallets.rows.length} wallets:`);
      userWallets.rows.forEach(wallet => {
        console.log(`  ${wallet.name} (${wallet.id})`);
      });
      
      // Use the first wallet for existing budgets with NULL wallet_id
      const firstWallet = userWallets.rows[0];
      const updateResult = await client.query(`
        UPDATE budgets
        SET wallet_id = $1
        WHERE user_id = $2 AND wallet_id IS NULL
      `, [firstWallet.id, userId]);
      
      console.log(`Assigned existing wallet to ${updateResult.rowCount} budgets`);
    }
    
    console.log('\nDefault wallet creation process completed!');
    
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
  }
}

createDefaultWallet();