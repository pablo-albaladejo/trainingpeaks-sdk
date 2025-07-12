import dotenv from 'dotenv';
import { beforeEach, vi } from 'vitest';

// Load environment variables first
dotenv.config();

// Global test configuration
vi.setConfig({ testTimeout: 10000 });

// Shared logger mock
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
});

// Export for use in tests
export { logger as mockLogger };
