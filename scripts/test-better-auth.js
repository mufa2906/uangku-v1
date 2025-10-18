// Test BetterAuth signup directly
import { serverAuth } from '@/lib/auth/server-config';

async function testSignup() {
  try {
    console.log('Testing BetterAuth signup...');
    
    // Mock request object for testing
    const mockRequest = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      json: async () => ({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    };
    
    // Try to call the signup handler directly
    console.log('Calling signup handler...');
    // This would require importing the handler and calling it properly
    
  } catch (error) {
    console.error('Error in test signup:', error);
  }
}

// Comment out for now since we can't easily test this way
// testSignup();
console.log('Direct BetterAuth testing script created');