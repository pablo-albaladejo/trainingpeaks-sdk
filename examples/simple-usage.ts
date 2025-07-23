/**
 * Simple Usage Example
 * Shows how to use the TrainingPeaks SDK with the clean API
 */

import { createTrainingPeaksClient } from '../src/index';

async function main() {
  // Create client with configuration
  const client = createTrainingPeaksClient({
    // Optional: Override default configuration
    debug: {
      enabled: false,
    },
  });

  try {
    // Login
    console.log('Logging in...');
    const loginResult = await client.login('username', 'password');

    if (loginResult.success) {
      console.log('✅ Login successful!');

      // Get user information
      const userResult = await client.getUser();
      if (userResult.success) {
        console.log('✅ User info retrieved:', userResult.user);
      }

      // Check authentication status
      console.log('Is authenticated:', client.isAuthenticated());
      console.log('User ID:', client.getUserId());
    } else {
      console.log('❌ Login failed:', loginResult.error);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
