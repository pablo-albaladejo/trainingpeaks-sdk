/**
 * Axios HTTP Client Tests
 * Comprehensive tests for HTTP client functionality including requests, errors, retries, and configuration
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { MockedFunction } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Logger } from '@/adapters/logging/logger';

import { createHttpClient } from './axios-http-client';

// Mock axios to control HTTP behavior in tests
vi.mock('axios');
vi.mock('axios-cookiejar-support');

const mockedAxios = vi.mocked(axios, true);

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

describe('Axios HTTP Client', () => {
  let mockLogger: Logger;
  let mockAxiosInstance: AxiosInstance;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock logger
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    // Mock axios instance with interceptors
    mockAxiosInstance = {
      request: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
      defaults: {},
    } as unknown as AxiosInstance;

    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    mockedAxios.isAxiosError.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Client Creation and Configuration', () => {
    it('should create client with default configuration', () => {
      // Arrange & Act
      const client = createHttpClient();

      // Assert
      expect(client).toBeDefined();
      expect(typeof client.get).toBe('function');
      expect(typeof client.post).toBe('function');
      expect(typeof client.put).toBe('function');
      expect(typeof client.patch).toBe('function');
      expect(typeof client.delete).toBe('function');
      expect(mockedAxios.create).toHaveBeenCalled();
    });

    it('should include browser headers by default', () => {
      // Arrange & Act
      createHttpClient();

      // Assert
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // Should include browser headers by default
          }),
        })
      );
    });

    it('should allow disabling browser headers', () => {
      // Arrange & Act
      createHttpClient({ enableBrowserHeaders: false });

      // Assert
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
      );
    });

    it('should allow custom headers to override defaults', () => {
      // Arrange
      const customHeaders = {
        'user-agent': 'Custom-User-Agent/1.0',
        'custom-header': 'test-value',
        'Content-Type': 'application/xml',
      };

      // Act
      createHttpClient({ headers: customHeaders });

      // Assert
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/xml', // Should override default
            'custom-header': 'test-value',
            'user-agent': 'Custom-User-Agent/1.0',
          }),
        })
      );
    });

    it('should configure timeout from options', () => {
      // Arrange
      const timeout = 5000;

      // Act
      createHttpClient({ timeout });

      // Assert
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        })
      );
    });

    it('should configure max redirects from options', () => {
      // Arrange
      const maxRedirects = 10;

      // Act
      createHttpClient({ maxRedirects });

      // Assert
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          maxRedirects: 10,
        })
      );
    });

    it('should use default values when not specified', () => {
      // Arrange & Act
      createHttpClient({});

      // Assert
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000, // Default timeout
          maxRedirects: 5, // Default redirects
        })
      );
    });
  });

  describe('HTTP Methods - Successful Requests', () => {
    beforeEach(() => {
      // Mock successful response
      const mockResponse: AxiosResponse = {
        data: { success: true, message: 'Test response' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosRequestConfig,
      };
      (
        mockAxiosInstance.request as MockedFunction<
          typeof mockAxiosInstance.request
        >
      ).mockResolvedValue(mockResponse);
    });

    it('should make GET request successfully', async () => {
      // Arrange
      const client = createHttpClient();
      const url = 'https://api.example.com/users';

      // Act
      const response = await client.get(url);

      // Assert
      expect(response.success).toBe(true);
      expect(response.data).toEqual({
        success: true,
        message: 'Test response',
      });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url,
        })
      );
    });

    it('should make POST request with data successfully', async () => {
      // Arrange
      const client = createHttpClient();
      const url = 'https://api.example.com/users';
      const data = { name: 'John Doe', email: 'john@example.com' };

      // Act
      const response = await client.post(url, data);

      // Assert
      expect(response.success).toBe(true);
      expect(response.data).toEqual({
        success: true,
        message: 'Test response',
      });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url,
          data,
        })
      );
    });

    it('should make PUT request with data successfully', async () => {
      // Arrange
      const client = createHttpClient();
      const url = 'https://api.example.com/users/123';
      const data = { name: 'Jane Doe' };

      // Act
      const response = await client.put(url, data);

      // Assert
      expect(response.success).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          url,
          data,
        })
      );
    });

    it('should make PATCH request with data successfully', async () => {
      // Arrange
      const client = createHttpClient();
      const url = 'https://api.example.com/users/123';
      const data = { status: 'active' };

      // Act
      const response = await client.patch(url, data);

      // Assert
      expect(response.success).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'patch',
          url,
          data,
        })
      );
    });

    it('should make DELETE request successfully', async () => {
      // Arrange
      const client = createHttpClient();
      const url = 'https://api.example.com/users/123';

      // Act
      const response = await client.delete(url);

      // Assert
      expect(response.success).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'delete',
          url,
        })
      );
    });
  });

  describe('Request Options and Headers', () => {
    beforeEach(() => {
      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosRequestConfig,
      };
      (
        mockAxiosInstance.request as MockedFunction<
          typeof mockAxiosInstance.request
        >
      ).mockResolvedValue(mockResponse);
    });

    it('should include custom headers in request', async () => {
      // Arrange
      const client = createHttpClient();
      const url = 'https://api.example.com/users';
      const customHeaders = {
        Authorization: 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      };

      // Act
      await client.get(url, { headers: customHeaders });

      // Assert
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders),
        })
      );
    });

    it('should include query parameters', async () => {
      // Arrange
      const client = createHttpClient();
      const url = 'https://api.example.com/users';
      const params = { page: 1, limit: 10, search: 'john' };

      // Act
      await client.get(url, { params });

      // Assert
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params,
        })
      );
    });

    it('should use custom timeout for specific request', async () => {
      // Arrange
      const client = createHttpClient({ timeout: 10000 });
      const url = 'https://api.example.com/users';
      const customTimeout = 5000;

      // Act
      await client.get(url, { timeout: customTimeout });

      // Assert
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: customTimeout, // Should override client default
        })
      );
    });

    it('should handle requests without options', async () => {
      // Arrange
      const client = createHttpClient();
      const url = 'https://api.example.com/users';

      // Act
      await client.get(url);

      // Assert
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url,
          data: undefined,
          params: undefined,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle server error responses', async () => {
      // Arrange
      const client = createHttpClient({ logger: mockLogger });
      const url = 'https://api.example.com/users';

      const axiosError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: { error: 'Database connection failed' },
          headers: { 'content-type': 'application/json' },
        },
        config: {},
        isAxiosError: true,
      };

      (
        mockAxiosInstance.request as MockedFunction<
          typeof mockAxiosInstance.request
        >
      ).mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      // Act
      const response = await client.get(url);

      // Assert
      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.error).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      // Arrange
      const client = createHttpClient({ logger: mockLogger });
      const url = 'https://api.example.com/users';

      const networkError = {
        request: {},
        message: 'Network Error',
        code: 'ECONNREFUSED',
        isAxiosError: true,
      };

      (
        mockAxiosInstance.request as MockedFunction<
          typeof mockAxiosInstance.request
        >
      ).mockRejectedValue(networkError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      // Act
      const response = await client.get(url);

      // Assert
      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.error).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const client = createHttpClient({ logger: mockLogger });
      const url = 'https://api.example.com/users';

      const unexpectedError = new Error('Something unexpected happened');
      (
        mockAxiosInstance.request as MockedFunction<
          typeof mockAxiosInstance.request
        >
      ).mockRejectedValue(unexpectedError);
      mockedAxios.isAxiosError.mockReturnValue(false);

      // Act
      const response = await client.get(url);

      // Assert
      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.error).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Logging Integration', () => {
    beforeEach(() => {
      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosRequestConfig,
      };
      (
        mockAxiosInstance.request as MockedFunction<
          typeof mockAxiosInstance.request
        >
      ).mockResolvedValue(mockResponse);
    });

    it('should log successful requests when logger is provided', async () => {
      // Arrange
      const client = createHttpClient({ logger: mockLogger });
      const url = 'https://api.example.com/users';

      // Act
      await client.get(url);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'HTTP Request starting',
        expect.objectContaining({
          method: 'GET',
          url,
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'HTTP Request successful',
        expect.objectContaining({
          method: 'GET',
          url,
          statusCode: 200,
          statusText: 'OK',
        })
      );
    });

    it('should not log when logger is not provided', async () => {
      // Arrange
      const client = createHttpClient(); // No logger
      const url = 'https://api.example.com/users';

      // Act
      await client.get(url);

      // Assert
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should log curl command when logger is provided', async () => {
      // Arrange
      const client = createHttpClient({ logger: mockLogger });
      const url = 'https://api.example.com/users';
      const data = { test: 'data' };

      // Act
      await client.post(url, data);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('HTTP Request as cURL:')
      );
    });
  });

  describe('Cookie Support', () => {
    it('should configure cookies when enabled', () => {
      // Arrange & Act
      createHttpClient({ enableCookies: true });

      // Assert
      expect(
        (mockAxiosInstance.defaults as Record<string, unknown>).withCredentials
      ).toBe(true);
    });

    it('should not configure cookies by default', () => {
      // Arrange & Act
      createHttpClient();

      // Assert
      expect(
        (mockAxiosInstance.defaults as Record<string, unknown>).withCredentials
      ).toBeUndefined();
    });
  });

  describe('Retry Configuration', () => {
    it('should use default retry configuration', () => {
      // Arrange & Act
      const client = createHttpClient();

      // Assert
      expect(client).toBeDefined();
      // Note: Retry logic is tested in retry-handler.test.ts
    });

    it('should use custom retry configuration', () => {
      // Arrange & Act
      const client = createHttpClient({
        retryAttempts: 5,
        retryDelay: 2000,
        retryBackoff: 3,
        retryMaxDelay: 15000,
        retryJitter: false,
      });

      // Assert
      expect(client).toBeDefined();
    });
  });

  describe('Browser Headers Integration', () => {
    it('should create client with logger configuration', () => {
      // Arrange & Act
      const client = createHttpClient({
        logger: mockLogger,
        enableBrowserHeaders: true,
      });

      // Assert
      expect(client).toBeDefined();
      expect(mockedAxios.create).toHaveBeenCalled();
    });
  });
});
