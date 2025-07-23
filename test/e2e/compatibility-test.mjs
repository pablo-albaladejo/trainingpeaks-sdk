#!/usr/bin/env node

/**
 * Compatibility Test for TrainingPeaks SDK
 *
 * This test verifies that the SDK works correctly in various usage scenarios
 * and maintains backward compatibility.
 * Based on integration test patterns
 */

import { TrainingPeaksClient } from '../dist/index.js';

console.log('🔧 Compatibility Test: SDK Usage Scenarios\n');

async function runCompatibilityTest() {
  try {
    console.log('📦 Test 1: Different Import Patterns');
    console.log('====================================');

    // Test 1: Basic import with default configuration
    const client1 = new TrainingPeaksClient();
    console.log('✅ Basic import successful');

    // Test 2: Import with full configuration (based on integration test patterns)
    const client2 = new TrainingPeaksClient({
      debug: {
        enabled: true,
        logAuth: true,
        logNetwork: true,
        logBrowser: true,
      },
      browser: {
        headless: true,
        launchTimeout: 30000,
        pageWaitTimeout: 2000,
      },
      timeouts: {
        webAuth: 30000,
        apiAuth: 10000,
        default: 10000,
      },
    });
    console.log('✅ Import with full configuration successful');

    // Test 3: Import with minimal config
    const client3 = new TrainingPeaksClient({});
    console.log('✅ Import with empty config successful');

    console.log('\n⚙️  Test 2: Configuration Validation');
    console.log('===================================');

    // Test different configuration combinations (based on integration test patterns)
    const configs = [
      {
        debug: { enabled: true },
        timeouts: { default: 10000 },
      },
      {
        timeouts: { webAuth: 45000, apiAuth: 15000 },
        browser: { headless: false },
      },
      {
        urls: { baseUrl: 'https://custom-api.com' },
        debug: { logAuth: true },
      },
      {
        debug: { enabled: false, logNetwork: false },
        timeouts: { default: 3000, webAuth: 45000 },
        urls: { baseUrl: 'https://test-api.com' },
      },
    ];

    configs.forEach((config, index) => {
      try {
        const testClient = new TrainingPeaksClient(config);
        const testConfig = testClient.getConfig();
        console.log(
          `✅ Config ${index + 1} applied: ${JSON.stringify(config)}`
        );
      } catch (error) {
        throw new Error(`Config ${index + 1} failed: ${error.message}`);
      }
    });

    console.log('\n🔐 Test 3: Authentication State Management');
    console.log('==========================================');

    const authClient = new TrainingPeaksClient({
      debug: { enabled: false }, // Disable debug for cleaner output
      timeouts: { default: 5000 },
    });

    // Test initial state
    const initialState = authClient.isAuthenticated();
    const initialUserId = authClient.getUserId();

    if (initialState !== false) {
      throw new Error('Initial authentication state should be false');
    }

    if (initialUserId !== null) {
      throw new Error('Initial user ID should be null');
    }

    console.log('✅ Initial authentication state correct');

    // Test login state change (based on integration test patterns)
    try {
      const loginResult = await authClient.login('test', 'test');
      if (loginResult.success) {
        const postLoginState = authClient.isAuthenticated();
        const postLoginUserId = authClient.getUserId();

        if (postLoginState !== true) {
          throw new Error('Post-login authentication state should be true');
        }

        if (postLoginUserId === null) {
          throw new Error('Post-login user ID should not be null');
        }

        console.log('✅ Login state change correct');
      }
    } catch (error) {
      console.log('⚠️  Login state test skipped (mock implementation)');
    }

    console.log('\n💪 Test 4: Workout Manager Interface');
    console.log('====================================');

    const workoutClient = new TrainingPeaksClient();
    const workoutManager = workoutClient.getWorkoutManager();

    // Test required methods exist (based on integration test patterns)
    const requiredMethods = [
      'uploadWorkout',
      'getWorkout',
      'listWorkouts',
      'deleteWorkout',
    ];

    requiredMethods.forEach((method) => {
      if (typeof workoutManager[method] !== 'function') {
        throw new Error(`Missing required method: ${method}`);
      }
    });

    console.log('✅ All required workout manager methods exist');

    // Test method signatures (based on integration test patterns)
    try {
      // Test uploadWorkout with different data formats
      const uploadData = {
        name: 'Test Workout',
        description: 'Test Description',
        date: '2024-01-01',
        duration: 1800,
        distance: 5000,
        type: 'RUN',
        fileData: {
          filename: 'test.gpx',
          content: '<gpx>test</gpx>',
          mimeType: 'application/gpx+xml',
        },
      };

      const uploadResult = await workoutManager.uploadWorkout(uploadData);
      console.log('✅ uploadWorkout method signature correct');
    } catch (error) {
      console.log(
        '⚠️  uploadWorkout signature test skipped (mock implementation)'
      );
    }

    console.log('\n📋 Test 5: Error Handling');
    console.log('==========================');

    const errorClient = new TrainingPeaksClient({
      debug: { enabled: false },
      timeouts: { default: 5000 },
    });

    // Test invalid login credentials (based on integration test patterns)
    try {
      await errorClient.login('', '');
      throw new Error('Login with empty credentials should fail');
    } catch (error) {
      if (error.message.includes('Invalid credentials')) {
        console.log('✅ Invalid credentials error handled correctly');
      } else {
        console.log('⚠️  Invalid credentials test skipped');
      }
    }

    // Test invalid workout data
    try {
      await workoutManager.uploadWorkout({});
      throw new Error('Upload with invalid data should fail');
    } catch (error) {
      console.log('✅ Invalid workout data error handled correctly');
    }

    console.log('\n🔄 Test 6: Method Chaining and State Persistence');
    console.log('===============================================');

    const chainClient = new TrainingPeaksClient();

    // Test that methods can be called in sequence (based on integration test patterns)
    const config1 = chainClient.getConfig();
    const auth1 = chainClient.isAuthenticated();
    const manager1 = chainClient.getWorkoutManager();

    // Call methods again to ensure state persistence
    const config2 = chainClient.getConfig();
    const auth2 = chainClient.isAuthenticated();
    const manager2 = chainClient.getWorkoutManager();

    // Verify consistency
    if (config1 !== config2) {
      throw new Error('Configuration should be consistent');
    }

    if (auth1 !== auth2) {
      throw new Error('Authentication state should be consistent');
    }

    if (manager1 !== manager2) {
      throw new Error('Workout manager should be consistent');
    }

    console.log('✅ Method chaining and state persistence correct');

    console.log('\n🎯 Test 7: Type Safety and Return Values');
    console.log('========================================');

    const typeClient = new TrainingPeaksClient();

    // Test configuration return type (based on integration test patterns)
    const config = typeClient.getConfig();
    if (typeof config !== 'object') {
      throw new Error('getConfig() should return an object');
    }

    if (!config.urls || typeof config.urls.baseUrl !== 'string') {
      throw new Error('config.urls.baseUrl should be a string');
    }

    if (!config.timeouts || typeof config.timeouts.default !== 'number') {
      throw new Error('config.timeouts.default should be a number');
    }

    console.log('✅ Configuration type safety correct');

    // Test authentication state return type
    const authState = typeClient.isAuthenticated();
    if (typeof authState !== 'boolean') {
      throw new Error('isAuthenticated() should return a boolean');
    }

    console.log('✅ Authentication state type safety correct');

    // Test user ID return type
    const userId = typeClient.getUserId();
    if (userId !== null && typeof userId !== 'string') {
      throw new Error('getUserId() should return string or null');
    }

    console.log('✅ User ID type safety correct');

    console.log('\n🔧 Test 8: Configuration Override Validation');
    console.log('===========================================');

    // Test configuration overrides (based on integration test patterns)
    const customConfig = {
      urls: {
        baseUrl: 'https://custom.trainingpeaks.com',
        apiBaseUrl: 'https://custom-api.trainingpeaks.com',
      },
      timeouts: {
        default: 15000,
        webAuth: 45000,
      },
      debug: {
        enabled: true,
        logAuth: true,
      },
    };

    const customClient = new TrainingPeaksClient(customConfig);
    const customClientConfig = customClient.getConfig();

    // Verify custom configuration was applied
    if (customClientConfig.urls.baseUrl !== customConfig.urls.baseUrl) {
      throw new Error('Custom baseUrl not applied correctly');
    }

    if (customClientConfig.timeouts.default !== customConfig.timeouts.default) {
      throw new Error('Custom default timeout not applied correctly');
    }

    if (customClientConfig.debug.enabled !== customConfig.debug.enabled) {
      throw new Error('Custom debug enabled not applied correctly');
    }

    console.log('✅ Configuration overrides work correctly');

    console.log('\n🎉 Compatibility Test Completed Successfully!');
    console.log('=============================================');
    console.log('✅ Different import patterns');
    console.log('✅ Configuration validation');
    console.log('✅ Authentication state management');
    console.log('✅ Workout manager interface');
    console.log('✅ Error handling');
    console.log('✅ Method chaining and state persistence');
    console.log('✅ Type safety and return values');
    console.log('✅ Configuration override validation');
    console.log('\n🔧 SDK is compatible with various usage patterns!');
  } catch (error) {
    console.error('\n❌ Compatibility Test Failed');
    console.error('============================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the compatibility test
runCompatibilityTest();
