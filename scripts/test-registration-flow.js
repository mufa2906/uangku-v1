const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function testUserRegistrationFlow() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Clean up any existing test data
    console.log('Cleaning up existing test data...');
    await client.query(`DELETE FROM _uangku_accounts WHERE user_id LIKE 'test-%'`);
    await client.query(`DELETE FROM _uangku_users WHERE id LIKE 'test-%'`);
    
    // Simulate what should happen during user registration
    const userId = 'test-user-registration-123';
    const userEmail = 'test-reg@example.com';
    const userName = 'Test Registration User';
    const userPassword = 'secure_test_password_123!';
    
    console.log('\\n1. Creating user record...');
    // Step 1: Create user in _uangku_users
    const userResult = await client.query(`
      INSERT INTO _uangku_users (id, email, name, email_verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET 
        updated_at = NOW()
      RETURNING id, email, name
    `, [userId, userEmail, userName, false]);
    
    console.log('User created:', userResult.rows[0]);
    
    console.log('\\n2. Creating account record with password...');
    // Step 2: Create account in _uangku_accounts with password
    const accountId = 'account-' + userId;
    const accountResult = await client.query(`
      INSERT INTO _uangku_accounts (
        id, account_id, provider_id, user_id, password, 
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, account_id, provider_id, user_id, password
    `, [accountId, accountId, 'credential', userId, userPassword]);
    
    console.log('Account created with password:', {
      ...accountResult.rows[0],
      password: accountResult.rows[0].password ? '[PASSWORD_SET]' : '[NO_PASSWORD]'
    });
    
    console.log('\\n3. Verifying data integrity...');
    // Step 3: Verify both records exist with proper relationship
    const verificationResult = await client.query(`
      SELECT 
        u.id as user_id,
        u.email as user_email,
        u.name as user_name,
        a.id as account_id,
        a.account_id as account_external_id,
        a.provider_id,
        a.password as account_password
      FROM _uangku_users u
      JOIN _uangku_accounts a ON u.id = a.user_id
      WHERE u.id = $1
    `, [userId]);
    
    if (verificationResult.rows.length > 0) {
      const row = verificationResult.rows[0];
      console.log('Verification successful:');
      console.log('  User ID:', row.user_id);
      console.log('  User Email:', row.user_email);
      console.log('  User Name:', row.user_name);
      console.log('  Account ID:', row.account_id);
      console.log('  Provider ID:', row.provider_id);
      console.log('  Password in Account:', row.account_password ? '[PASSWORD_STORED]' : '[NO_PASSWORD]');
    } else {
      console.log('Error: No matching user/account relationship found');
    }
    
    console.log('\\n4. Cleaning up test data...');
    // Clean up
    await client.query(`DELETE FROM _uangku_accounts WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM _uangku_users WHERE id = $1`, [userId]);
    console.log('Test records cleaned up');
    
    console.log('\\n✅ Test completed successfully!');
    
  } catch (err) {
    console.error('❌ Error in test:', err);
  } finally {
    await client.end();
  }
}

testUserRegistrationFlow();