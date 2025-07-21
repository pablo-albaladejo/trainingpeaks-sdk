#!/usr/bin/env node

/**
 * Basic E2E Test for Built NPM Package (CommonJS)
 * Tests fundamental package functionality and API surface
 * Based on integration test patterns
 */

const { TrainingPeaksClient } = require('../dist/index.cjs');

console.log('🧪 Testing NPM Package (CommonJS) - Basic Functionality\n');

async function runBasicE2ETest() {
  let client;

  try {
    console.log('📦 Step 1: Package Import and Instantiation');
    console.log('===========================================');

    // Test 1: Import and instantiation with configuration
    client = new TrainingPeaksClient({
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

    console.log('✅ Step 1: Client instantiation successful');

    console.log('\n⚙️  Step 2: Configuration Validation');
    console.log('=====================================');

    // Test 2: Configuration methods
    const config = client.getConfig();
    if (!config) {
      throw new Error('getConfig() returned null/undefined');
    }

    // Verify configuration structure (based on integration test patterns)
    if (!config.urls || !config.urls.baseUrl) {
      throw new Error('Configuration missing urls.baseUrl');
    }

    if (!config.timeouts || !config.timeouts.default) {
      throw new Error('Configuration missing timeouts.default');
    }

    if (!config.debug || typeof config.debug.enabled !== 'boolean') {
      throw new Error('Configuration missing debug.enabled');
    }

    console.log(`✅ Configuration loaded: ${config.urls.baseUrl}`);
    console.log(`✅ Default timeout: ${config.timeouts.default}ms`);
    console.log(`✅ Debug enabled: ${config.debug.enabled}`);

    console.log('\n🔐 Step 3: Authentication State Management');
    console.log('==========================================');

    // Test 3: Initial authentication state
    const initialAuthState = client.isAuthenticated();
    if (typeof initialAuthState !== 'boolean') {
      throw new Error('isAuthenticated() should return boolean');
    }

    if (initialAuthState !== false) {
      throw new Error('Client should not be authenticated initially');
    }

    console.log(`✅ Initial auth state: ${initialAuthState}`);

    // Test 4: User ID before authentication
    const initialUserId = client.getUserId();
    if (initialUserId !== null) {
      throw new Error('getUserId() should return null when not authenticated');
    }

    console.log(`✅ Initial user ID: ${initialUserId}`);

    console.log('\n🔧 Step 4: API Surface Verification');
    console.log('===================================');

    // Test 5: API surface verification (based on integration test patterns)
    const requiredMethods = [
      'login',
      'logout',
      'getCurrentUser',
      'getWorkoutManager',
      'isAuthenticated',
      'getUserId',
      'getConfig',
    ];

    requiredMethods.forEach((method) => {
      if (typeof client[method] !== 'function') {
        throw new Error(`Missing required method: ${method}`);
      }
    });

    console.log(`✅ All ${requiredMethods.length} required methods exist`);

    console.log('\n💪 Step 5: Workout Manager Interface');
    console.log('====================================');

    // Test 6: Workout manager
    const workoutManager = client.getWorkoutManager();
    if (!workoutManager) {
      throw new Error('getWorkoutManager() returned null/undefined');
    }

    // Verify workout manager methods exist
    const workoutManagerMethods = [
      'uploadWorkout',
      'getWorkout',
      'listWorkouts',
      'deleteWorkout',
    ];

    workoutManagerMethods.forEach((method) => {
      if (typeof workoutManager[method] !== 'function') {
        throw new Error(`Missing workout manager method: ${method}`);
      }
    });

    console.log(
      `✅ All ${workoutManagerMethods.length} workout manager methods exist`
    );

    console.log('\n🎯 Step 6: Type Safety Validation');
    console.log('================================');

    // Test 7: Type safety validation
    const authState = client.isAuthenticated();
    if (typeof authState !== 'boolean') {
      throw new Error('isAuthenticated() should return boolean');
    }

    const userId = client.getUserId();
    if (userId !== null && typeof userId !== 'string') {
      throw new Error('getUserId() should return string or null');
    }

    const configType = client.getConfig();
    if (typeof configType !== 'object') {
      throw new Error('getConfig() should return object');
    }

    console.log('✅ All return types are correct');

    console.log('\n🔄 Step 7: Configuration Override Test');
    console.log('=====================================');

    // Test 8: Configuration overrides (based on integration test patterns)
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

    console.log('✅ Configuration overrides work correctly');

    console.log('\n🎉 Basic E2E Test Completed Successfully!');
    console.log('==========================================');
    console.log('✅ Package import and instantiation');
    console.log('✅ Configuration validation');
    console.log('✅ Authentication state management');
    console.log('✅ API surface verification');
    console.log('✅ Workout manager interface');
    console.log('✅ Type safety validation');
    console.log('✅ Configuration override functionality');
    console.log('\n📦 SDK is ready for npm distribution!');
  } catch (error) {
    console.error('\n❌ Basic E2E test failed');
    console.error('========================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the basic test
runBasicE2ETest();
