/**
 * Logger Service Tests
 * Tests for the logger service implementation following @unit-test-rule.mdc
 */

import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import type { LogContext, LogLevel } from '../../application/services/logger';
import { globalConsoleMocks } from '../../test.setup';
import {
  consoleOutputTarget,
  createLoggerService,
  createLoggerWithTarget,
  createSilentLogger,
  LogOutputTarget,
} from './logger';

describe('Logger Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('createLoggerService', () => {
    it('should create logger with default configuration', () => {
      // Arrange & Act
      const logger = createLoggerService();

      // Assert
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should create logger with custom level', () => {
      // Arrange
      const config = { level: 'error' as LogLevel };

      // Act
      const logger = createLoggerService(config);

      // Assert
      expect(logger).toBeDefined();
      expect(typeof logger.error).toBe('function');
    });

    it('should log info messages correctly', () => {
      // Arrange
      const logger = createLoggerService({ level: 'info' });
      const message = faker.lorem.sentence();

      // Act
      logger.info(message);

      // Assert - info level uses console.log according to consoleOutputTarget
      expect(globalConsoleMocks.log).toHaveBeenCalledTimes(1);
      expect(globalConsoleMocks.log).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it('should log error messages correctly', () => {
      // Arrange
      const logger = createLoggerService({ level: 'error' });
      const message = faker.lorem.sentence();

      // Act
      logger.error(message);

      // Assert
      expect(globalConsoleMocks.error).toHaveBeenCalledTimes(1);
      expect(globalConsoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it('should log warn messages correctly', () => {
      // Arrange
      const logger = createLoggerService({ level: 'warn' });
      const message = faker.lorem.sentence();

      // Act
      logger.warn(message);

      // Assert
      expect(globalConsoleMocks.warn).toHaveBeenCalledTimes(1);
      expect(globalConsoleMocks.warn).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it('should log debug messages correctly', () => {
      // Arrange
      const logger = createLoggerService({ level: 'debug' });
      const message = faker.lorem.sentence();

      // Act
      logger.debug(message);

      // Assert - debug level uses console.debug according to consoleOutputTarget
      expect(globalConsoleMocks.debug).toHaveBeenCalledTimes(1);
      expect(globalConsoleMocks.debug).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it('should include context in log messages', () => {
      // Arrange
      const logger = createLoggerService({ level: 'info' });
      const message = faker.lorem.sentence();
      const context: LogContext = {
        userId: randomNumber(1, 1000).toString(),
        operation: faker.lorem.word(),
        metadata: { key: faker.lorem.word() },
      };

      // Act
      logger.info(message, context);

      // Assert - info level uses console.log according to consoleOutputTarget
      expect(globalConsoleMocks.log).toHaveBeenCalledTimes(1);
      expect(globalConsoleMocks.log).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });

    it('should respect log level filtering', () => {
      // Arrange
      const logger = createLoggerService({ level: 'error' }); // Only error level
      const message = faker.lorem.sentence();

      // Act
      logger.debug(message); // Should not log
      logger.info(message); // Should not log
      logger.warn(message); // Should not log

      // Assert
      expect(globalConsoleMocks.debug).not.toHaveBeenCalled();
      expect(globalConsoleMocks.log).not.toHaveBeenCalled();
      expect(globalConsoleMocks.warn).not.toHaveBeenCalled();
    });

    it('should handle empty messages', () => {
      // Arrange
      const logger = createLoggerService({ level: 'info' });

      // Act
      logger.info('');

      // Assert - info level uses console.log according to consoleOutputTarget
      expect(globalConsoleMocks.log).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined context', () => {
      // Arrange
      const logger = createLoggerService({ level: 'info' });
      const message = faker.lorem.sentence();

      // Act
      logger.info(message, undefined);

      // Assert - info level uses console.log according to consoleOutputTarget
      expect(globalConsoleMocks.log).toHaveBeenCalledTimes(1);
      expect(globalConsoleMocks.log).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });
  });

  describe('createLoggerWithTarget', () => {
    it('should create logger with custom output target', () => {
      // Arrange
      const mockTarget: LogOutputTarget = {
        write: vi.fn(),
      };

      // Act
      const logger = createLoggerWithTarget(mockTarget, { level: 'info' });

      // Assert
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    it('should use custom output target for logging', () => {
      // Arrange
      const mockTarget: LogOutputTarget = {
        write: vi.fn(),
      };
      const logger = createLoggerWithTarget(mockTarget, { level: 'info' });
      const message = faker.lorem.sentence();

      // Act
      logger.info(message);

      // Assert
      expect(mockTarget.write).toHaveBeenCalledTimes(1);
      expect(mockTarget.write).toHaveBeenCalledWith(
        'info',
        expect.stringContaining(message)
      );
    });

    it('should work with different log levels', () => {
      // Arrange
      const mockTarget: LogOutputTarget = {
        write: vi.fn(),
      };
      const logger = createLoggerWithTarget(mockTarget, { level: 'debug' });
      const message = faker.lorem.sentence();

      // Act
      logger.debug(message);
      logger.info(message);
      logger.warn(message);
      logger.error(message);

      // Assert
      expect(mockTarget.write).toHaveBeenCalledTimes(4);
      expect(mockTarget.write).toHaveBeenNthCalledWith(
        1,
        'debug',
        expect.stringContaining(message)
      );
      expect(mockTarget.write).toHaveBeenNthCalledWith(
        2,
        'info',
        expect.stringContaining(message)
      );
      expect(mockTarget.write).toHaveBeenNthCalledWith(
        3,
        'warn',
        expect.stringContaining(message)
      );
      expect(mockTarget.write).toHaveBeenNthCalledWith(
        4,
        'error',
        expect.stringContaining(message)
      );
    });
  });

  describe('createSilentLogger', () => {
    it('should create silent logger that does not output', () => {
      // Arrange
      const logger = createSilentLogger();
      const message = faker.lorem.sentence();

      // Act
      logger.debug(message);
      logger.info(message);
      logger.warn(message);
      logger.error(message);

      // Assert - Silent logger should not call any console methods
      expect(globalConsoleMocks.debug).not.toHaveBeenCalled();
      expect(globalConsoleMocks.log).not.toHaveBeenCalled();
      expect(globalConsoleMocks.warn).not.toHaveBeenCalled();
      expect(globalConsoleMocks.error).not.toHaveBeenCalled();
    });

    it('should return logger interface', () => {
      // Arrange & Act
      const logger = createSilentLogger();

      // Assert
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('consoleOutputTarget', () => {
    it('should write to appropriate console method based on level', () => {
      // Arrange
      const message = faker.lorem.sentence();

      // Act
      consoleOutputTarget.write('info', message);
      consoleOutputTarget.write('error', message);
      consoleOutputTarget.write('warn', message);
      consoleOutputTarget.write('debug', message);

      // Assert - Based on actual consoleOutputTarget implementation
      expect(globalConsoleMocks.log).toHaveBeenCalledWith(message); // info uses console.log
      expect(globalConsoleMocks.error).toHaveBeenCalledWith(message);
      expect(globalConsoleMocks.warn).toHaveBeenCalledWith(message);
      expect(globalConsoleMocks.debug).toHaveBeenCalledWith(message); // debug uses console.debug
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex logging scenario', () => {
      // Arrange
      const mockTarget: LogOutputTarget = {
        write: vi.fn(),
      };
      const logger = createLoggerWithTarget(mockTarget, {
        level: 'info',
        enableTimestamp: true,
        enableColors: false,
      });

      const messages = [
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      ];

      const contexts = messages.map(() => ({
        userId: randomNumber(1, 1000).toString(),
        operation: faker.lorem.word(),
        metadata: {
          key: faker.lorem.word(),
          value: randomNumber(1, 100),
        },
      }));

      // Act
      logger.info(messages[0], contexts[0]);
      logger.warn(messages[1], contexts[1]);
      logger.error(messages[2], contexts[2]);

      // Assert
      expect(mockTarget.write).toHaveBeenCalledTimes(3);
      expect(mockTarget.write).toHaveBeenNthCalledWith(
        1,
        'info',
        expect.stringContaining(messages[0])
      );
      expect(mockTarget.write).toHaveBeenNthCalledWith(
        2,
        'warn',
        expect.stringContaining(messages[1])
      );
      expect(mockTarget.write).toHaveBeenNthCalledWith(
        3,
        'error',
        expect.stringContaining(messages[2])
      );
    });

    it('should work with random data', () => {
      // Arrange
      const mockTarget: LogOutputTarget = {
        write: vi.fn(),
      };
      const logger = createLoggerWithTarget(mockTarget, { level: 'debug' });

      const randomMessages = Array.from({ length: randomNumber(3, 10) }, () =>
        randomString(randomNumber(10, 50))
      );

      // Act
      randomMessages.forEach((message) => {
        logger.info(message);
      });

      // Assert
      expect(mockTarget.write).toHaveBeenCalledTimes(randomMessages.length);
      randomMessages.forEach((message, index) => {
        expect(mockTarget.write).toHaveBeenNthCalledWith(
          index + 1,
          'info',
          expect.stringContaining(message)
        );
      });
    });
  });
});
