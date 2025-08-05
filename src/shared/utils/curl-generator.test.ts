/**
 * cURL Generator Tests
 * Tests for the curl command generation utility
 */

import { describe, expect, it } from 'vitest';

import { type CurlRequestData, generateCurlCommand } from './curl-generator';

describe('generateCurlCommand', () => {
  describe('Basic HTTP Methods', () => {
    it('should generate curl command for GET request', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toBe("curl -X GET 'https://api.example.com/users'");
    });

    it('should generate curl command for POST request', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'post',
        url: 'https://api.example.com/users',
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toBe("curl -X POST 'https://api.example.com/users'");
    });

    it('should handle method case conversion', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'patch',
        url: 'https://api.example.com/users/123',
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toBe("curl -X PATCH 'https://api.example.com/users/123'");
    });
  });

  describe('Headers', () => {
    it('should add custom headers to curl command', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
        },
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain("-H 'Authorization: Bearer token123'");
      expect(result).toContain("-H 'Content-Type: application/json'");
    });

    it('should skip browser-specific headers', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          'user-agent': 'Mozilla/5.0...',
          'accept-encoding': 'gzip, deflate',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          Authorization: 'Bearer token123',
        },
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).not.toContain('user-agent');
      expect(result).not.toContain('accept-encoding');
      expect(result).not.toContain('accept-language');
      expect(result).not.toContain('cache-control');
      expect(result).toContain('Authorization');
    });

    it('should handle empty headers object', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {},
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toBe("curl -X GET 'https://api.example.com/users'");
    });

    it('should handle undefined headers', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        // headers intentionally undefined
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toBe("curl -X GET 'https://api.example.com/users'");
    });
  });

  describe('Cookies', () => {
    it('should add cookies to curl command', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        cookies: ['sessionId=abc123', 'auth=token456'],
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain("-H 'Cookie: sessionId=abc123; auth=token456'");
    });

    it('should handle single cookie', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        cookies: ['sessionId=abc123'],
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain("-H 'Cookie: sessionId=abc123'");
    });

    it('should handle empty cookies array', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        cookies: [],
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).not.toContain('Cookie');
    });

    it('should handle undefined cookies', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        // cookies intentionally undefined
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).not.toContain('Cookie');
    });
  });

  describe('Data Handling', () => {
    it('should handle JSON data', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'POST',
        url: 'https://api.example.com/users',
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
        },
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain(
        '-d \'{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "age": 30\n}\''
      );
    });

    it('should handle string data', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'POST',
        url: 'https://api.example.com/users',
        data: 'plain text data',
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain("-d 'plain text data'");
    });

    it('should handle URLSearchParams data', () => {
      // Arrange
      const formData = new URLSearchParams();
      formData.append('username', 'john_doe');
      formData.append('password', 'secret123');
      formData.append('special', 'value with spaces & symbols');

      const request: CurlRequestData = {
        method: 'POST',
        url: 'https://api.example.com/login',
        data: formData,
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain("-d 'username=john_doe'");
      expect(result).toContain("-d 'password=secret123'");
      expect(result).toContain(
        "-d 'special=value%20with%20spaces%20%26%20symbols'"
      );
    });

    it('should handle empty URLSearchParams', () => {
      // Arrange
      const formData = new URLSearchParams();
      const request: CurlRequestData = {
        method: 'POST',
        url: 'https://api.example.com/login',
        data: formData,
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toBe("curl -X POST 'https://api.example.com/login'");
    });

    it('should handle complex nested JSON data', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'POST',
        url: 'https://api.example.com/workout',
        data: {
          workout: {
            name: 'Morning Run',
            duration: 3600,
            exercises: [
              { name: 'Warm-up', duration: 300 },
              { name: 'Run', duration: 3000 },
              { name: 'Cool-down', duration: 300 },
            ],
          },
          metadata: {
            tags: ['cardio', 'morning'],
            difficulty: 'medium',
          },
        },
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain('workout');
      expect(result).toContain('Morning Run');
      expect(result).toContain('exercises');
      expect(result).toContain('metadata');
      expect(result).toContain('cardio');
    });

    it('should handle undefined data', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        // data intentionally undefined
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toBe("curl -X GET 'https://api.example.com/users'");
    });
  });

  describe('Complete curl commands', () => {
    it('should generate complete curl command with all components', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'POST',
        url: 'https://api.trainingpeaks.com/login',
        headers: {
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
          'X-Request-ID': 'req-456',
          'user-agent': 'Browser/1.0', // Should be filtered out
        },
        cookies: ['sessionId=abc123', 'auth=token456'],
        data: {
          username: 'athlete',
          password: 'secret',
        },
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain(
        "curl -X POST 'https://api.trainingpeaks.com/login'"
      );
      expect(result).toContain("-H 'Authorization: Bearer token123'");
      expect(result).toContain("-H 'Content-Type: application/json'");
      expect(result).toContain("-H 'X-Request-ID: req-456'");
      expect(result).toContain("-H 'Cookie: sessionId=abc123; auth=token456'");
      expect(result).toContain(
        '-d \'{\n  "username": "athlete",\n  "password": "secret"\n}\''
      );
      expect(result).not.toContain('user-agent');
    });

    it('should format multi-line curl command correctly', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'PUT',
        url: 'https://api.example.com/users/123',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        data: { name: 'Updated Name' },
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      const lines = result.split(' \\\n');
      expect(lines[0]).toBe("curl -X PUT 'https://api.example.com/users/123'");
      expect(lines).toContain("  -H 'Content-Type: application/json'");
      expect(lines).toContain("  -H 'Authorization: Bearer token'");
      expect(
        lines.some(
          (line) =>
            line.includes('-d \'{"name":"Updated Name"}\'') ||
            line.includes('-d \'{\n  "name": "Updated Name"\n}\'')
        )
      ).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in URL', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/search?q=hello world&filter=active',
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toBe(
        "curl -X GET 'https://api.example.com/search?q=hello world&filter=active'"
      );
    });

    it('should handle special characters in headers', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: {
          'X-Custom-Header': 'value with "quotes" and spaces',
        },
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain(
        '-H \'X-Custom-Header: value with "quotes" and spaces\''
      );
    });

    it('should handle boolean and number data types in JSON', () => {
      // Arrange
      const request: CurlRequestData = {
        method: 'POST',
        url: 'https://api.example.com/settings',
        data: {
          enabled: true,
          count: 42,
          ratio: 3.14,
          name: null,
        },
      };

      // Act
      const result = generateCurlCommand(request);

      // Assert
      expect(result).toContain('"enabled": true');
      expect(result).toContain('"count": 42');
      expect(result).toContain('"ratio": 3.14');
      expect(result).toContain('"name": null');
    });
  });
});
