import { describe, expect, it } from 'vitest';

import { SDKError, type SDKErrorContext } from './sdk-error';

describe('SDKError', () => {
  describe('Constructor', () => {
    it('should create SDKError with message and code', () => {
      const error = new SDKError('Test error', 'TEST_001');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_001');
      expect(error.name).toBe('SDKError');
      expect(error.context).toBeUndefined();
    });

    it('should create SDKError with context', () => {
      const context: SDKErrorContext = {
        userId: '123',
        operation: 'login',
        timestamp: Date.now(),
      };

      const error = new SDKError(
        'Test error with context',
        'TEST_002',
        context
      );

      expect(error.message).toBe('Test error with context');
      expect(error.code).toBe('TEST_002');
      expect(error.context).toEqual(context);
    });

    it('should extend Error class', () => {
      const error = new SDKError('Test error', 'TEST_003');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SDKError);
    });

    it('should have correct error name', () => {
      const error = new SDKError('Test error', 'TEST_004');

      expect(error.name).toBe('SDKError');
    });
  });

  describe('Properties', () => {
    it('should have readonly code property', () => {
      const error = new SDKError('Test error', 'TEST_005');

      expect(error.code).toBe('TEST_005');
      // TypeScript ensures readonly at compile time
    });

    it('should have readonly context property', () => {
      const context: SDKErrorContext = { test: 'value' };
      const error = new SDKError('Test error', 'TEST_006', context);

      expect(error.context).toEqual(context);
      // TypeScript ensures readonly at compile time
    });

    it('should handle empty context object', () => {
      const error = new SDKError('Test error', 'TEST_007', {});

      expect(error.context).toEqual({});
    });

    it('should handle complex context objects', () => {
      const context: SDKErrorContext = {
        requestId: 'req_123',
        user: { id: '456', name: 'John Doe' },
        metadata: { version: '1.0.0', debug: true },
        headers: { 'user-agent': 'test-client' },
        timestamp: new Date().toISOString(),
      };

      const error = new SDKError('Complex error', 'TEST_008', context);

      expect(error.context).toEqual(context);
      expect(error.context?.requestId).toBe('req_123');
      expect(error.context?.user).toEqual({ id: '456', name: 'John Doe' });
    });
  });

  describe('Error Message and Stack', () => {
    it('should preserve error message', () => {
      const message = 'Custom error message with details';
      const error = new SDKError(message, 'TEST_009');

      expect(error.message).toBe(message);
    });

    it('should have stack trace', () => {
      const error = new SDKError('Test error', 'TEST_010');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  describe('Serialization', () => {
    it('should be JSON serializable', () => {
      const context: SDKErrorContext = {
        id: 'test',
        timestamp: Date.now(),
      };
      const error = new SDKError('Serializable error', 'TEST_011', context);

      const serialized = JSON.stringify(error);

      expect(() => JSON.parse(serialized) as unknown).not.toThrow();

      const parsed = JSON.parse(serialized) as {
        name: string;
        message: string;
        code: string;
        context: unknown;
      };
      expect(parsed.name).toBe('SDKError');
      expect(parsed.message).toBe('Serializable error');
      expect(parsed.code).toBe('TEST_011');
      expect(parsed.context).toEqual(context);
    });
  });

  describe('Type Safety', () => {
    it('should enforce SDKErrorContext type', () => {
      const validContext: SDKErrorContext = {
        stringValue: 'test',
        numberValue: 123,
        booleanValue: true,
        arrayValue: [1, 2, 3],
        objectValue: { nested: 'value' },
        nullValue: null,
        undefinedValue: undefined,
      };

      const error = new SDKError('Type test', 'TEST_012', validContext);

      expect(error.context).toEqual(validContext);
    });
  });
});
