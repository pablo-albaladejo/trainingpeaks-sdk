/**
 * Request ID Generator Tests
 * Tests for the request ID generation and parsing utilities
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateRequestId, getRequestTimestamp } from './request-id';

describe('Request ID Utilities', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.restoreAllMocks();
  });

  describe('generateRequestId', () => {
    it('should generate a request ID with correct format', () => {
      // Arrange & Act
      const requestId = generateRequestId();

      // Assert
      expect(requestId).toMatch(/^req_[a-z0-9]+_[a-z0-9]{6}$/);
      expect(requestId.startsWith('req_')).toBe(true);
    });

    it('should generate unique request IDs on subsequent calls', () => {
      // Arrange & Act
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      const id3 = generateRequestId();

      // Assert
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate request IDs with consistent structure', () => {
      // Arrange & Act
      const requestIds = Array.from({ length: 10 }, () => generateRequestId());

      // Assert
      requestIds.forEach((id) => {
        const parts = id.split('_');
        expect(parts).toHaveLength(3);
        expect(parts[0]).toBe('req');
        expect(parts[1]).toMatch(/^[a-z0-9]+$/); // timestamp part
        expect(parts[2]).toMatch(/^[a-z0-9]{6}$/); // random part
      });
    });

    it('should include timestamp component that increases over time', () => {
      // Arrange
      const mockTime1 = 1609459200000; // 2021-01-01 00:00:00 UTC
      const mockTime2 = 1609459260000; // 2021-01-01 00:01:00 UTC

      // Act
      vi.spyOn(Date, 'now').mockReturnValueOnce(mockTime1);
      const id1 = generateRequestId();

      vi.spyOn(Date, 'now').mockReturnValueOnce(mockTime2);
      const id2 = generateRequestId();

      // Assert
      const timestamp1 = id1.split('_')[1];
      const timestamp2 = id2.split('_')[1];

      const time1 = parseInt(timestamp1, 36);
      const time2 = parseInt(timestamp2, 36);

      expect(time2).toBeGreaterThan(time1);
    });

    it('should generate random parts that are different', () => {
      // Arrange
      const mockTime = 1609459200000;
      vi.spyOn(Date, 'now').mockReturnValue(mockTime);

      // Act
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      const id3 = generateRequestId();

      // Assert
      const randomPart1 = id1.split('_')[2];
      const randomPart2 = id2.split('_')[2];
      const randomPart3 = id3.split('_')[2];

      expect(randomPart1).not.toBe(randomPart2);
      expect(randomPart2).not.toBe(randomPart3);
      expect(randomPart1).not.toBe(randomPart3);
    });

    it('should handle edge case with Math.random returning 0', () => {
      // Arrange
      vi.spyOn(Math, 'random').mockReturnValue(0);

      // Act
      const requestId = generateRequestId();

      // Assert
      expect(requestId).toMatch(/^req_[a-z0-9]+_$/);
      const parts = requestId.split('_');
      expect(parts[2]).toBe(''); // When Math.random() returns 0, substring(2, 8) of "0." is empty
    });

    it('should handle edge case with Math.random returning close to 1', () => {
      // Arrange
      vi.spyOn(Math, 'random').mockReturnValue(0.999999);

      // Act
      const requestId = generateRequestId();

      // Assert
      expect(requestId).toMatch(/^req_[a-z0-9]+_[a-z0-9]{6}$/);
      const parts = requestId.split('_');
      expect(parts[2]).toHaveLength(6);
    });

    it('should generate IDs with consistent length for different timestamps', () => {
      // Arrange
      const timestamps = [
        1609459200000, // 2021-01-01
        1640995200000, // 2022-01-01
        1672531200000, // 2023-01-01
        4102444800000, // 2100-01-01
      ];

      // Act & Assert
      timestamps.forEach((timestamp) => {
        vi.spyOn(Date, 'now').mockReturnValueOnce(timestamp);
        const requestId = generateRequestId();

        expect(requestId).toMatch(/^req_[a-z0-9]+_[a-z0-9]{6}$/);
        const parts = requestId.split('_');
        expect(parts).toHaveLength(3);
        expect(parts[2]).toHaveLength(6);
      });
    });
  });

  describe('getRequestTimestamp', () => {
    it('should extract timestamp from valid request ID', () => {
      // Arrange
      const mockTime = 1609459200000; // 2021-01-01 00:00:00 UTC
      vi.spyOn(Date, 'now').mockReturnValue(mockTime);
      const requestId = generateRequestId();

      // Act
      const extractedDate = getRequestTimestamp(requestId);

      // Assert
      expect(extractedDate).toBeInstanceOf(Date);
      expect(extractedDate!.getTime()).toBe(mockTime);
    });

    it('should extract correct timestamp from manually constructed request ID', () => {
      // Arrange
      const timestamp = 1609459200000; // 2021-01-01 00:00:00 UTC
      const timestampBase36 = timestamp.toString(36);
      const requestId = `req_${timestampBase36}_abc123`;

      // Act
      const extractedDate = getRequestTimestamp(requestId);

      // Assert
      expect(extractedDate).toBeInstanceOf(Date);
      expect(extractedDate!.getTime()).toBe(timestamp);
    });

    it('should return null for invalid request ID format', () => {
      // Arrange
      const invalidIds = [
        'req__missing_timestamp', // Empty timestamp part
        '', // Empty string
      ];

      // Act & Assert
      invalidIds.forEach((invalidId) => {
        const result = getRequestTimestamp(invalidId);
        expect(result).toBeNull();
      });
    });

    it('should handle invalid formats that still extract timestamps', () => {
      // Arrange
      const testCases = [
        { id: 'invalid_format', expectedTimestamp: parseInt('format', 36) },
        { id: 'req_only_two_parts', expectedTimestamp: parseInt('only', 36) },
        { id: 'not_a_request_id', expectedTimestamp: parseInt('a', 36) },
      ];

      // Act & Assert
      testCases.forEach(({ id, expectedTimestamp }) => {
        const result = getRequestTimestamp(id);
        expect(result).toBeInstanceOf(Date);
        expect(result!.getTime()).toBe(expectedTimestamp);
      });
    });

    it('should handle request ID with valid base36 characters', () => {
      // Arrange
      const requestId = 'req_zzz999_abc123'; // Valid base36 characters

      // Act
      const result = getRequestTimestamp(requestId);

      // Assert
      expect(result).toBeInstanceOf(Date);
      expect(result!.getTime()).toBe(parseInt('zzz999', 36));
    });

    it('should return null for malformed request ID structure', () => {
      // Arrange
      const malformedIds = ['req', 'req_'];

      // Act & Assert
      malformedIds.forEach((id) => {
        const result = getRequestTimestamp(id);
        expect(result).toBeNull();
      });
    });

    it('should handle partial request ID structures', () => {
      // Arrange
      const partialIds = ['req_abc', 'req_abc_'];

      // Act & Assert
      partialIds.forEach((id) => {
        const result = getRequestTimestamp(id);
        expect(result).toBeInstanceOf(Date);
        expect(result!.getTime()).toBe(parseInt('abc', 36));
      });
    });

    it('should handle request ID with extra underscores', () => {
      // Arrange
      const timestamp = 1609459200000;
      const timestampBase36 = timestamp.toString(36);
      const requestId = `req_${timestampBase36}_abc123_extra_parts`;

      // Act
      const extractedDate = getRequestTimestamp(requestId);

      // Assert
      expect(extractedDate).toBeInstanceOf(Date);
      expect(extractedDate!.getTime()).toBe(timestamp);
    });

    it('should handle edge case timestamps', () => {
      // Arrange
      const edgeTimestamps = [
        0, // Unix epoch
        1, // Minimum positive timestamp
        Date.now(), // Current time
        2147483647000, // Year 2038 problem
      ];

      // Act & Assert
      edgeTimestamps.forEach((timestamp) => {
        const timestampBase36 = timestamp.toString(36);
        const requestId = `req_${timestampBase36}_abc123`;

        const extractedDate = getRequestTimestamp(requestId);
        expect(extractedDate).toBeInstanceOf(Date);
        expect(extractedDate!.getTime()).toBe(timestamp);
      });
    });

    it('should handle request ID with text that parseInt can parse', () => {
      // Arrange
      const requestId = 'req_not_a_number_abc123';

      // Act
      const result = getRequestTimestamp(requestId);

      // Assert
      expect(result).toBeInstanceOf(Date);
      expect(result!.getTime()).toBe(parseInt('not_a_number', 36));
    });

    it('should handle very large timestamps correctly', () => {
      // Arrange
      const largeTimestamp = 9999999999999; // Far future timestamp
      const timestampBase36 = largeTimestamp.toString(36);
      const requestId = `req_${timestampBase36}_abc123`;

      // Act
      const extractedDate = getRequestTimestamp(requestId);

      // Assert
      expect(extractedDate).toBeInstanceOf(Date);
      expect(extractedDate!.getTime()).toBe(largeTimestamp);
    });
  });

  describe('Integration Tests', () => {
    it('should create request ID and extract timestamp correctly', () => {
      // Arrange
      const mockTime = 1609459200000; // 2021-01-01 00:00:00 UTC
      vi.spyOn(Date, 'now').mockReturnValue(mockTime);

      // Act
      const requestId = generateRequestId();
      const extractedDate = getRequestTimestamp(requestId);

      // Assert
      expect(extractedDate).toBeInstanceOf(Date);
      expect(extractedDate!.getTime()).toBe(mockTime);
    });

    it('should handle multiple request IDs with different timestamps', () => {
      // Arrange
      const timestamps = [
        1609459200000, // 2021-01-01 00:00:00 UTC
        1609459260000, // 2021-01-01 00:01:00 UTC
        1609459320000, // 2021-01-01 00:02:00 UTC
      ];

      // Act & Assert
      timestamps.forEach((timestamp) => {
        vi.spyOn(Date, 'now').mockReturnValueOnce(timestamp);

        const requestId = generateRequestId();
        const extractedDate = getRequestTimestamp(requestId);

        expect(extractedDate).toBeInstanceOf(Date);
        expect(extractedDate!.getTime()).toBe(timestamp);

        // Verify format
        expect(requestId).toMatch(/^req_[a-z0-9]+_[a-z0-9]{6}$/);
      });
    });

    it('should maintain timestamp ordering in generated IDs', () => {
      // Arrange
      const baseTime = 1609459200000;
      const timestamps = [
        baseTime,
        baseTime + 1000,
        baseTime + 2000,
        baseTime + 3000,
      ];

      // Act
      const requestIds = timestamps.map((timestamp) => {
        vi.spyOn(Date, 'now').mockReturnValueOnce(timestamp);
        return generateRequestId();
      });

      const extractedTimestamps = requestIds.map((id) =>
        getRequestTimestamp(id)!.getTime()
      );

      // Assert
      expect(extractedTimestamps).toEqual(timestamps);

      // Verify ordering
      for (let i = 1; i < extractedTimestamps.length; i++) {
        expect(extractedTimestamps[i]).toBeGreaterThan(
          extractedTimestamps[i - 1]
        );
      }
    });

    it('should handle realistic request tracing scenario', () => {
      // Arrange - Simulate request processing over time
      const startTime = Date.now();

      // Act - Generate request ID at start
      vi.spyOn(Date, 'now').mockReturnValue(startTime);
      const requestId = generateRequestId();

      // Act - Extract timestamp later for logging/debugging
      const extractedDate = getRequestTimestamp(requestId);

      // Assert
      expect(extractedDate).toBeInstanceOf(Date);
      expect(extractedDate!.getTime()).toBe(startTime);
      expect(requestId).toMatch(/^req_[a-z0-9]+_[a-z0-9]{6}$/);

      // Verify we can use this for correlation
      expect(typeof requestId).toBe('string');
      expect(requestId.length).toBeGreaterThan(10);
    });

    it('should demonstrate request ID uniqueness over time', () => {
      // Arrange
      const requestIds = new Set<string>();
      const baseTime = 1609459200000;

      // Act - Generate many IDs over simulated time
      for (let i = 0; i < 100; i++) {
        vi.spyOn(Date, 'now').mockReturnValueOnce(baseTime + i * 100);
        const id = generateRequestId();
        requestIds.add(id);
      }

      // Assert
      expect(requestIds.size).toBe(100); // All IDs should be unique

      // Verify all follow the expected format
      requestIds.forEach((id) => {
        expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]{6}$/);
        const extractedDate = getRequestTimestamp(id);
        expect(extractedDate).toBeInstanceOf(Date);
      });
    });
  });
});
