/**
 * Usage Example
 * Demonstrates how to use the TrainingPeaks SDK with the clean client API
 */

import { createTrainingPeaksClient } from '@/index';

/**
 * Example: Basic usage of the TrainingPeaks client
 */
export const exampleBasicUsage = async () => {
  // Create client with configuration
  const client = createTrainingPeaksClient({
    debug: {
      enabled: false,
      logAuth: false,
      logNetwork: false,
      logBrowser: false,
    },
  });

  try {
    // Login with credentials
    console.log('Logging in...');
    const loginResult = await client.login('username', 'password');

    if (loginResult.success) {
      console.log('✅ Login successful!');
      console.log('User:', loginResult.user);

      // Get current user information
      console.log('Getting user info...');
      const userResult = await client.getUser();

      if (userResult.success) {
        console.log('✅ User info retrieved:', userResult.user);
      } else {
        console.error('❌ Failed to get user:', userResult.error);
      }

      // Check authentication status
      console.log('Is authenticated:', client.isAuthenticated());
      console.log('User ID:', client.getUserId());
    } else {
      console.error('❌ Login failed:', loginResult.error);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
};

/**
 * Example: Using the client with custom configuration
 */
export const exampleWithCustomConfig = async () => {
  // Create client with custom configuration
  const client = createTrainingPeaksClient({
    debug: {
      enabled: true,
      logAuth: true,
      logNetwork: true,
      logBrowser: false,
    },
    timeouts: {
      default: 10000,
      apiAuth: 5000,
    },
  });

  // Use the client
  const loginResult = await client.login('username', 'password');

  if (loginResult.success) {
    console.log('Login successful with custom config');
    return await client.getUser();
  } else {
    console.error('Login failed with custom config:', loginResult.error);
    return null;
  }
};

/**
 * Example: Error handling with the client
 */
export const exampleErrorHandling = async () => {
  const client = createTrainingPeaksClient();

  try {
    // Try to get user without being authenticated
    const userResult = await client.getUser();

    if (!userResult.success) {
      console.log('Expected error - not authenticated:', userResult.error);
    }

    // Check authentication status
    console.log('Is authenticated:', client.isAuthenticated());
    console.log('User ID:', client.getUserId());
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

/**
 * Example: Multiple client instances
 */
export const exampleMultipleClients = async () => {
  // Create multiple client instances with different configurations
  const client1 = createTrainingPeaksClient({
    debug: { enabled: true },
  });

  const client2 = createTrainingPeaksClient({
    debug: { enabled: false },
  });

  // Each client maintains its own state
  console.log('Client 1 authenticated:', client1.isAuthenticated());
  console.log('Client 2 authenticated:', client2.isAuthenticated());

  // Login with one client
  const loginResult = await client1.login('username', 'password');

  if (loginResult.success) {
    console.log('Client 1 authenticated:', client1.isAuthenticated());
    console.log('Client 2 authenticated:', client2.isAuthenticated()); // Still false
  }
};

/**
 * Example: Complete workflow
 */
export const exampleCompleteWorkflow = async () => {
  const client = createTrainingPeaksClient();

  try {
    // Step 1: Login
    console.log('Step 1: Logging in...');
    const loginResult = await client.login('username', 'password');

    if (!loginResult.success) {
      console.error('Login failed:', loginResult.error);
      return;
    }

    console.log('✅ Login successful');

    // Step 2: Verify authentication
    console.log('Step 2: Verifying authentication...');
    if (!client.isAuthenticated()) {
      console.error('❌ Authentication verification failed');
      return;
    }

    console.log('✅ Authentication verified');
    console.log('User ID:', client.getUserId());

    // Step 3: Get user information
    console.log('Step 3: Getting user information...');
    const userResult = await client.getUser();

    if (userResult.success) {
      console.log('✅ User information retrieved:', userResult.user);
    } else {
      console.error('❌ Failed to get user information:', userResult.error);
    }

    console.log('🎉 Complete workflow finished successfully!');
  } catch (error) {
    console.error('❌ Workflow failed:', error);
  }
};
