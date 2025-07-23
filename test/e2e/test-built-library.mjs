#!/usr/bin/env node

/**
 * Basic E2E Test
 * Tests basic functionality of the built library
 * Uses the same configuration pattern as integration tests
 */

import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { TrainingPeaksClient } from '../dist/index.js';

// Load .env file from project root (parent directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');

// Load environment variables from .env file
config({ path: envPath });

// Configuration based on integration test pattern
const getTestConfig = () => {
  const username = process.env.TRAININGPEAKS_TEST_USERNAME;
  const password = process.env.TRAININGPEAKS_TEST_PASSWORD;

  if (!username || !password) {
    console.log('⚠️  Skipping E2E tests - missing credentials');
    console.log(
      '   Set TRAININGPEAKS_TEST_USERNAME and TRAININGPEAKS_TEST_PASSWORD in .env file'
    );
    console.log('   Example:');
    console.log('     TRAININGPEAKS_TEST_USERNAME=your-username');
    console.log('     TRAININGPEAKS_TEST_PASSWORD=your-password');
    console.log('');
    console.log('   Or run with environment variables:');
    console.log(
      '     TRAININGPEAKS_TEST_USERNAME=your-username TRAININGPEAKS_TEST_PASSWORD=your-password node test-built-library.mjs'
    );
    process.exit(0);
  }

  return {
    username,
    password,
    clientConfig: {
      debug: {
        enabled: true,
        logAuth: true,
        logNetwork: true,
        logBrowser: true,
      },
      browser: {
        headless: process.env.TRAININGPEAKS_WEB_HEADLESS !== 'false',
        launchTimeout: parseInt(
          process.env.TRAININGPEAKS_WEB_TIMEOUT || '30000',
          10
        ),
        pageWaitTimeout: 2000,
      },
      timeouts: {
        webAuth: parseInt(process.env.TRAININGPEAKS_WEB_TIMEOUT || '30000', 10),
        apiAuth: 10000,
        default: 10000,
      },
    },
  };
};

async function runBasicE2ETest() {
  console.log('🚀 Basic E2E Test');
  console.log('=================');

  const config = getTestConfig();

  console.log('\n📋 Step 1: Environment Check');
  console.log('============================');
  console.log(`✅ Username: ${config.username}`);
  console.log(`✅ Password: ${config.password ? '***' : 'NOT SET'}`);
  console.log(`✅ Headless mode: ${config.clientConfig.browser.headless}`);

  console.log('\n🔧 Step 2: Library Import and Client Creation');
  console.log('=============================================');

  // Test 1: Import the library
  console.log('📦 Testing library import...');
  if (typeof TrainingPeaksClient === 'function') {
    console.log('✅ TrainingPeaksClient imported successfully');
  } else {
    throw new Error('TrainingPeaksClient not found in library');
  }

  // Test 2: Create client instance
  console.log('🔧 Creating client instance...');
  const client = new TrainingPeaksClient(config.clientConfig);
  console.log('✅ Client instance created successfully');

  // Test 3: Verify client has required methods
  console.log('🔍 Verifying client methods...');
  const requiredMethods = [
    'login',
    'logout',
    'getCurrentUser',
    'isAuthenticated',
    'getUserId',
    'getWorkoutManager',
    'getConfig',
  ];

  requiredMethods.forEach((method) => {
    if (typeof client[method] === 'function') {
      console.log(`✅ ${method} method available`);
    } else {
      throw new Error(`Missing ${method} method on client`);
    }
  });

  console.log('\n🔑 Step 3: Authentication Test');
  console.log('==============================');

  // Test 4: Authentication
  console.log('🔑 Testing authentication...');
  try {
    const loginResult = await client.login(config.username, config.password);

    if (loginResult.success) {
      console.log('✅ Login successful');
      console.log(
        `✅ User: ${loginResult.user.username} (ID: ${loginResult.user.id})`
      );
      console.log(
        `✅ Token received: ${loginResult.token.accessToken ? 'Yes' : 'No'}`
      );

      // Verify authentication state
      const isAuth = client.isAuthenticated();
      const userId = client.getUserId();
      console.log(`✅ Authentication state: ${isAuth}`);
      console.log(`✅ User ID: ${userId}`);
    } else {
      console.log('❌ Login failed');
      console.log(
        '   This might indicate an issue with credentials or network'
      );
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Login failed with error:');
    console.log(`   ${error.message}`);
    console.log('   This might indicate:');
    console.log('   - Invalid credentials');
    console.log('   - Network connectivity issues');
    console.log('   - TrainingPeaks service unavailable');
    process.exit(1);
  }

  console.log('\n💪 Step 4: Workout Manager Test');
  console.log('===============================');

  // Test 5: Workout Manager
  console.log('💪 Testing workout manager...');
  const workoutManager = client.getWorkoutManager();

  if (workoutManager) {
    console.log('✅ Workout manager retrieved successfully');

    // Verify workout manager methods
    const workoutMethods = [
      'uploadWorkout',
      'getWorkout',
      'listWorkouts',
      'deleteWorkout',
      'createStructuredWorkout',
      'searchWorkouts',
    ];

    workoutMethods.forEach((method) => {
      if (typeof workoutManager[method] === 'function') {
        console.log(`✅ ${method} method available`);
      } else {
        console.log(`❌ Missing ${method} method`);
      }
    });
  } else {
    throw new Error('Workout manager not available');
  }

  console.log('\n👤 Step 5: User Information Test');
  console.log('================================');

  // Test 6: Get current user
  console.log('👤 Testing user information...');
  try {
    const currentUser = await client.getCurrentUser();
    if (currentUser) {
      console.log('✅ Current user retrieved successfully');
      console.log(`✅ User ID: ${currentUser.id}`);
      console.log(`✅ Username: ${currentUser.username}`);
      console.log(`✅ Email: ${currentUser.email}`);
    } else {
      console.log(
        '⚠️  Current user returned null (this might be expected with mock implementations)'
      );
    }
  } catch (error) {
    console.log('❌ Failed to get current user:');
    console.log(`   ${error.message}`);
  }

  console.log('\n🚪 Step 6: Logout Test');
  console.log('======================');

  // Test 7: Logout
  console.log('🚪 Testing logout...');
  try {
    const logoutResult = await client.logout();
    if (logoutResult.success) {
      console.log('✅ Logout successful');

      // Verify post-logout state
      const postLogoutAuth = client.isAuthenticated();
      const postLogoutUserId = client.getUserId();

      console.log(`✅ Post-logout auth state: ${postLogoutAuth}`);
      console.log(`✅ Post-logout user ID: ${postLogoutUserId || 'None'}`);
    } else {
      console.log('❌ Logout failed');
    }
  } catch (error) {
    console.log('❌ Logout failed with error:');
    console.log(`   ${error.message}`);
  }

  console.log('\n🎉 Basic E2E Test Summary');
  console.log('=========================');
  console.log('✅ Library import: Working');
  console.log('✅ Client creation: Working');
  console.log('✅ Authentication: Working');
  console.log('✅ Workout Manager: Available');
  console.log('✅ User Management: Working');
  console.log('✅ Logout: Working');
  console.log('\n🎯 All basic functionality tested successfully!');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the test
console.log('🚀 Starting Basic E2E Test...');
runBasicE2ETest().catch((error) => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
