import { TrainingPeaksConfig } from '../types';

export interface TestEnvironment {
  trainingPeaksConfig: TrainingPeaksConfig;
  testUsername: string;
  testPassword: string;
  testTimeout: number;
  loginUrl: string;
  appUrl: string;
}

export const testEnvironment: TestEnvironment = {
  trainingPeaksConfig: {
    baseUrl:
      process.env.TRAININGPEAKS_BASE_URL || 'https://www.trainingpeaks.com',
    timeout: parseInt(process.env.TRAININGPEAKS_TEST_TIMEOUT || '30000', 10),
    debug: true, // Always enable debug for integration tests
    // Use web authentication by default for real testing
    authMethod:
      (process.env.TRAININGPEAKS_AUTH_METHOD as 'web' | 'api') || 'web',
    webAuth: {
      headless: process.env.TRAININGPEAKS_WEB_HEADLESS !== 'false',
      timeout: parseInt(process.env.TRAININGPEAKS_WEB_TIMEOUT || '30000', 10),
      executablePath: process.env.TRAININGPEAKS_WEB_EXECUTABLE_PATH || '',
    },
  },
  testUsername: process.env.TRAININGPEAKS_TEST_USERNAME || '',
  testPassword: process.env.TRAININGPEAKS_TEST_PASSWORD || '',
  testTimeout: parseInt(process.env.TRAININGPEAKS_TEST_TIMEOUT || '30000', 10),
  loginUrl:
    process.env.TRAININGPEAKS_LOGIN_URL ||
    'https://home.trainingpeaks.com/login',
  appUrl: process.env.TRAININGPEAKS_APP_URL || 'https://app.trainingpeaks.com',
};

// Helper function to skip tests if environment is not configured
export function skipIfNotConfigured(): void {
  if (!testEnvironment.testUsername || !testEnvironment.testPassword) {
    throw new Error(
      'Integration tests require TRAININGPEAKS_TEST_USERNAME and TRAININGPEAKS_TEST_PASSWORD environment variables. ' +
        'Please copy .env.example to .env and fill in your credentials.'
    );
  }

  if (testEnvironment.trainingPeaksConfig.authMethod === 'web') {
    console.log('🌐 Using web authentication - this will launch a browser');
    console.log(`🔗 Login URL: ${testEnvironment.loginUrl}`);
    console.log(`🏠 Base URL: ${testEnvironment.trainingPeaksConfig.baseUrl}`);
  } else {
    console.log(
      '📡 Using API authentication - this uses placeholder endpoints'
    );
  }
}
