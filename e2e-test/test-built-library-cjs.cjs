#!/usr/bin/env node

/**
 * E2E Test for Built Library (CommonJS)
 *
 * This test verifies that the built library can be required and used correctly
 * in a CommonJS environment.
 */

const { TrainingPeaksClient } = require('../dist/index.cjs');

console.log('🧪 Testing TrainingPeaks SDK (CommonJS)...\n');

async function runE2ETests() {
  try {
    console.log('✅ Step 1: Require successful');

    // Test client instantiation
    const client = new TrainingPeaksClient({
      debug: true,
      timeout: 5000,
      webAuth: {
        headless: true,
        timeout: 10000,
      },
    });

    console.log('✅ Step 2: Client instantiation successful');

    // Test that essential methods exist
    const methods = [
      'login',
      'logout',
      'isAuthenticated',
      'getCurrentUser',
      'getConfig',
    ];
    for (const method of methods) {
      if (typeof client[method] !== 'function') {
        throw new Error(`Method ${method} is not available or not a function`);
      }
    }

    console.log('✅ Step 3: Essential methods exist');

    // Test authentication state (should be false initially)
    const initialAuthState = client.isAuthenticated();
    if (initialAuthState !== false) {
      throw new Error('Initial authentication state should be false');
    }

    console.log('✅ Step 4: Authentication state management works');

    // Test getCurrentUser (should return null when not authenticated)
    const currentUser = await client.getCurrentUser();
    if (currentUser !== null) {
      throw new Error(
        'getCurrentUser should return null when not authenticated'
      );
    }

    console.log(
      '✅ Step 5: getCurrentUser works correctly when not authenticated'
    );

    // Test configuration access
    const config = client.getConfig();
    if (!config || typeof config !== 'object') {
      throw new Error('getConfig should return a configuration object');
    }

    console.log('✅ Step 6: Configuration access works');

    // Test SDK configuration access
    const sdkConfig = client.getSDKConfig();
    if (!sdkConfig || typeof sdkConfig !== 'object') {
      throw new Error('getSDKConfig should return a configuration object');
    }

    console.log('✅ Step 7: SDK configuration access works');

    // Test authentication with mock credentials (should fail gracefully)
    try {
      await client.login('mock-username', 'mock-password');
      console.log(
        '⚠️  Warning: Login succeeded with mock credentials (unexpected)'
      );
    } catch (error) {
      console.log('✅ Step 8: Login fails gracefully with mock credentials');
    }

    console.log('\n🎉 All E2E tests passed! (CommonJS)\n');
  } catch (error) {
    console.error('❌ E2E test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

runE2ETests();
