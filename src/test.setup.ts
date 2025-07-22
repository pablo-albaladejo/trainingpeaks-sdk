import dotenv from 'dotenv';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';
import { configureLogger, LogLevel } from './infrastructure/logging/logger';

// Load environment variables first
dotenv.config();

// Global test configuration
vi.setConfig({ testTimeout: 10000 });

// Configure logger to be silent during tests
configureLogger({
  level: LogLevel.SILENT,
  outputTarget: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
});

// Global console mocks to prevent any output during tests
export const globalConsoleMocks = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  dir: vi.fn(),
  table: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
  time: vi.fn(),
  timeEnd: vi.fn(),
};

// Store original console methods
const originalConsole = { ...console };

// Setup global console mocking before all tests
beforeAll(() => {
  // Replace all console methods with mocks
  Object.assign(console, globalConsoleMocks);
});

// Restore original console methods after all tests
afterAll(() => {
  Object.assign(console, originalConsole);
});

// Shared logger mock (for application layer tests)
export const mockLogInfo = vi.fn();
export const mockLogError = vi.fn();
export const mockLogWarn = vi.fn();
export const mockLogDebug = vi.fn();

// Mock logger instance
export const logger = {
  info: mockLogInfo,
  error: mockLogError,
  warn: mockLogWarn,
  debug: mockLogDebug,
};

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  // Also clear global console mocks
  Object.values(globalConsoleMocks).forEach((mock) => mock.mockClear());
});

// Export for use in tests
export { logger as mockLogger };

// Helper to temporarily restore console for specific tests if needed
export const withRealConsole = (callback: () => void) => {
  Object.assign(console, originalConsole);
  try {
    callback();
  } finally {
    Object.assign(console, globalConsoleMocks);
  }
};

// Helper to get console mock calls
export const getConsoleCalls = () => ({
  log: globalConsoleMocks.log.mock.calls,
  info: globalConsoleMocks.info.mock.calls,
  warn: globalConsoleMocks.warn.mock.calls,
  error: globalConsoleMocks.error.mock.calls,
  debug: globalConsoleMocks.debug.mock.calls,
});
