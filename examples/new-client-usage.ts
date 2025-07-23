/**
 * Example: Using the new functional TrainingPeaks client
 * This demonstrates the new adapter-based client architecture
 */

import { createTrainingPeaksClient } from '../src/index';

async function main() {
  // Create a new client instance with configuration
  const client = createTrainingPeaksClient({
    // Optional configuration overrides
    apiKey: process.env.TRAINING_PEAKS_API_KEY,
    baseUrl: process.env.TRAINING_PEAKS_BASE_URL,
  });

  try {
    // Login with credentials
    console.log('Logging in...');
    const loginResult = await client.login('username', 'password');

    if (loginResult.success) {
      console.log('Login successful!');
      console.log('User:', loginResult.user);

      // Check authentication status
      console.log('Is authenticated:', client.isAuthenticated());

      // Get user information
      console.log('Getting user info...');
      const userResult = await client.getUser();

      if (userResult.success) {
        console.log('User info:', userResult.user);
      } else {
        console.error('Failed to get user:', userResult.error);
      }

      // Get user ID
      const userId = client.getUserId();
      console.log('User ID:', userId);
    } else {
      console.error('Login failed:', loginResult.error);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
