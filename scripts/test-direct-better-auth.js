// Test BetterAuth directly
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function testDirectBetterAuth() {
  try {
    console.log('Testing BetterAuth database flow...');
    
    // Clean up any existing test data
    await client.connect();
    console.log('Connected to database');
    
    console.log('Cleaning up existing test data...');
    await client.query(`DELETE FROM _uangku_accounts WHERE user_id LIKE 'test-%'`);
    await client.query(`DELETE FROM _uangku_users WHERE id LIKE 'test-%'`);
    
    // Simulate what BetterAuth should do during registration
    const userId = 'test-better-auth-123';
    const userEmail = 'test-better@example.com';
    const userName = 'Test BetterAuth User';
    const rawPassword = 'secure_test_password_123!';
    
    console.log('\\n1. Hashing password...');
    // Hash the password as BetterAuth would
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);
    console.log('Password hashed successfully');
    
    console.log('\\n2. Creating user record...');
    // Create user in _uangku_users (BetterAuth does this)
    const userResult = await client.query(`
      INSERT INTO _uangku_users (id, email, name, email_verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET 
        updated_at = NOW()
      RETURNING id, email, name
    `, [userId, userEmail, userName, false]);
    
    console.log('User created:', userResult.rows[0]);
    
    console.log('\\n3. Creating account record with hashed password...');
    // Create account in _uangku_accounts with hashed password (BetterAuth does this)
    const accountId = 'account-' + userId;
    const accountResult = await client.query(`
      INSERT INTO _uangku_accounts (
        id, 
        account_id, 
        provider_id, 
        user_id, 
        password, 
        created_at, 
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, account_id, provider_id, user_id
    `, [accountId, accountId, 'credential', userId, hashedPassword]);
    
    console.log('Account created with hashed password:', accountResult.rows[0]);
    
    console.log('\\n4. Verifying login process...');
    // Simulate login verification
    const loginEmail = userEmail;
    const loginPassword = rawPassword;
    
    // Retrieve account for verification
    const verifyResult = await client.query(`
      SELECT 
        a.password as account_password,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name
      FROM _uangku_accounts a
      JOIN _uangku_users u ON a.user_id = u.id
      WHERE u.email = $1 AND a.provider_id = 'credential'
    `, [loginEmail]);
    
    if (verifyResult.rows.length > 0) {
      const account = verifyResult.rows[0];
      console.log('Account found for login');
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(loginPassword, account.account_password);
      console.log('Password verification result:', isPasswordValid ? '✅ VALID' : '❌ INVALID');
      
      if (isPasswordValid) {
        console.log('\\n🎉 Login successful!');
        console.log('   User ID:', account.user_id);
        console.log('   User Email:', account.user_email);
        console.log('   User Name:', account.user_name);
      }
    } else {
      console.log('❌ No account found for email:', loginEmail);
    }
    
    console.log('\\n5. Cleaning up test data...');
    // Clean up
    await client.query(`DELETE FROM _uangku_accounts WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM _uangku_users WHERE id = $1`, [userId]);
    console.log('Test records cleaned up');
    
    console.log('\\n✅ BetterAuth simulation completed successfully!');
    
  } catch (err) {
    console.error('❌ Error in BetterAuth simulation:', err);
  } finally {
    await client.end();
  }
}

// Run the test
testDirectBetterAuth();