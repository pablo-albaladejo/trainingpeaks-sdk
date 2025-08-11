import { createLogger } from '@/adapters/logging/logger';
import { TrainingPeaksConfig } from '@/types';

// Create a test logger using the existing logging adapters
const testLogger = createLogger({
  level: 'info',
  enabled: true,
  prefix: 'TEST',
});

// Simple test logger that uses the existing logging adapters
const createTestLogger = () => ({
  info: (message: string, context?: Record<string, unknown>) => {
    testLogger.info(message, context);
  },
  error: (message: string, context?: Record<string, unknown>) => {
    testLogger.error(message, context);
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    testLogger.warn(message, context);
  },
  debug: (message: string, context?: Record<string, unknown>) => {
    testLogger.debug(message, context);
  },
  log: (level: string, message: string, context?: Record<string, unknown>) => {
    testLogger.info(`${level.toUpperCase()}: ${message}`, context);
  },
});

export type TestEnvironment = {
  trainingPeaksConfig: TrainingPeaksConfig;
  testUsername: string;
  testPassword: string;
  testTimeout: number;
  loginUrl: string;
  appUrl: string;
  errorHandlingTimeout: number;
};

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
  errorHandlingTimeout: parseInt(
    process.env.TRAININGPEAKS_ERROR_TIMEOUT || '15000',
    10
  ),
};

// Helper function to skip tests if environment is not configured
export function skipIfNotConfigured(): void {
  const logger = createTestLogger();

  if (!testEnvironment.testUsername || !testEnvironment.testPassword) {
    throw new Error(
      'Integration tests require TRAININGPEAKS_TEST_USERNAME and TRAININGPEAKS_TEST_PASSWORD environment variables. ' +
        'Please copy .env.example to .env and fill in your credentials.'
    );
  }

  if (testEnvironment.trainingPeaksConfig.authMethod === 'web') {
    logger.info('🌐 Using web authentication - this will launch a browser');
    logger.info(`🔗 Login URL: ${testEnvironment.loginUrl}`);
    logger.info(`🏠 Base URL: ${testEnvironment.trainingPeaksConfig.baseUrl}`);
  } else {
    logger.info(
      '📡 Using API authentication - this uses placeholder endpoints'
    );
  }
}
