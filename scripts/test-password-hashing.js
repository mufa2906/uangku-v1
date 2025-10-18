const bcrypt = require('bcryptjs');

async function testPasswordHashing() {
  try {
    const password = 'testpassword123';
    console.log('Original password:', password);
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed password:', hashedPassword);
    
    // Verify the password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Password match:', isMatch);
    
    const isWrongMatch = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log('Wrong password match:', isWrongMatch);
    
  } catch (err) {
    console.error('Error testing password hashing:', err);
  }
}

testPasswordHashing();