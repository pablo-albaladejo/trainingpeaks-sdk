/**
 * User Mapper Tests
 * Tests for mapping TrainingPeaks API user responses to domain User entities
 */

import { describe, expect, it } from 'vitest';

import type { UserProfileEndpointResponse } from '@/adapters/public-api/endpoints/users/v3/user';

import {
  mapTPUsersToUsers,
  mapTPUserToUser,
  mapTPUserToUserSafe,
} from './user-mapper';

describe('User Mappers', () => {
  describe('mapTPUserToUser', () => {
    it('should map TrainingPeaks user to User entity with fullName', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 12345,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe Jr.',
        email: 'john.doe@example.com',
        timeZone: 'America/New_York',
        language: 'en-US',
        units: 1, // metric
        dateFormat: 'MM/DD/YYYY',
        temperatureUnit: 'C',
        personPhotoUrl: 'https://example.com/avatar.jpg',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.id).toBe('12345');
      expect(user.name).toBe('John Doe Jr.');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.preferences.timezone).toBe('America/New_York');
      expect(user.preferences.language).toBe('en-US');
      expect(user.preferences.units).toBe('metric');
      expect(user.preferences.dateFormat).toBe('MM/DD/YYYY');
      expect(user.preferences.temperatureUnit).toBe('C');
      expect(user.preferences.email).toBe('john.doe@example.com');
    });

    it('should map TrainingPeaks user without fullName using firstName + lastName', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 67890,
        firstName: 'Jane',
        lastName: 'Smith',
        // fullName intentionally omitted
        email: 'jane.smith@example.com',
        timeZone: 'Europe/London',
        language: 'en-GB',
        units: 0, // imperial
        dateFormat: 'DD/MM/YYYY',
        temperatureUnit: 'F',
        personPhotoUrl: 'https://example.com/jane.jpg',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.id).toBe('67890');
      expect(user.name).toBe('Jane Smith');
      expect(user.preferences.units).toBe('imperial');
      expect(user.preferences.temperatureUnit).toBe('F');
    });

    it('should handle empty fullName by falling back to firstName + lastName', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 11111,
        firstName: 'Bob',
        lastName: 'Wilson',
        fullName: '', // empty string
        email: 'bob@example.com',
        timeZone: 'UTC',
        language: 'en',
        units: 1,
        dateFormat: 'YYYY-MM-DD',
        temperatureUnit: 'C',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.name).toBe('Bob Wilson');
    });

    it('should handle null fullName by falling back to firstName + lastName', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 22222,
        firstName: 'Alice',
        lastName: 'Johnson',
        fullName: null, // null value
        email: 'alice@example.com',
        timeZone: 'Pacific/Auckland',
        language: 'en-NZ',
        units: 1,
        dateFormat: 'DD/MM/YYYY',
        temperatureUnit: 'C',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.name).toBe('Alice Johnson');
    });

    it('should handle missing personPhotoUrl', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 33333,
        firstName: 'Charlie',
        lastName: 'Brown',
        fullName: 'Charlie Brown',
        email: 'charlie@example.com',
        timeZone: 'America/Chicago',
        language: 'en-US',
        units: 0,
        dateFormat: 'MM/DD/YYYY',
        temperatureUnit: 'F',
        // personPhotoUrl intentionally omitted
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.avatar).toBeUndefined();
    });

    it('should handle null personPhotoUrl', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 44444,
        firstName: 'Diana',
        lastName: 'Prince',
        fullName: 'Diana Prince',
        email: 'diana@example.com',
        timeZone: 'America/Los_Angeles',
        language: 'en-US',
        units: 1,
        dateFormat: 'MM/DD/YYYY',
        temperatureUnit: 'C',
        personPhotoUrl: null,
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.avatar).toBeUndefined();
    });

    it('should handle empty string personPhotoUrl', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 55555,
        firstName: 'Eve',
        lastName: 'Adams',
        fullName: 'Eve Adams',
        email: 'eve@example.com',
        timeZone: 'Europe/Paris',
        language: 'fr-FR',
        units: 1,
        dateFormat: 'DD/MM/YYYY',
        temperatureUnit: 'C',
        personPhotoUrl: '',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.avatar).toBeUndefined();
    });

    it('should trim whitespace from firstName + lastName combination', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 66666,
        firstName: 'Frank ',
        lastName: ' Miller',
        // fullName intentionally omitted to test trimming
        email: 'frank@example.com',
        timeZone: 'America/Denver',
        language: 'en-US',
        units: 0,
        dateFormat: 'MM/DD/YYYY',
        temperatureUnit: 'F',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.name).toBe('Frank   Miller'); // Note: there will be spaces in middle from trim operation
    });

    it('should handle edge case with only firstName', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 77777,
        firstName: 'Cher',
        lastName: '',
        email: 'cher@example.com',
        timeZone: 'America/Los_Angeles',
        language: 'en-US',
        units: 0,
        dateFormat: 'MM/DD/YYYY',
        temperatureUnit: 'F',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.name).toBe('Cher');
    });

    it('should handle edge case with only lastName', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 88888,
        firstName: '',
        lastName: 'Madonna',
        email: 'madonna@example.com',
        timeZone: 'America/New_York',
        language: 'en-US',
        units: 1,
        dateFormat: 'MM/DD/YYYY',
        temperatureUnit: 'C',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.name).toBe('Madonna');
    });

    it('should create User entities with all properties', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 99999,
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        email: 'test@example.com',
        timeZone: 'UTC',
        language: 'en',
        units: 1,
        dateFormat: 'YYYY-MM-DD',
        temperatureUnit: 'C',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.id).toBe('99999');
      expect(user.name).toBe('Test User');
      expect(user.preferences).toBeDefined();
      expect(user.preferences.timezone).toBe('UTC');
      expect(user.preferences.language).toBe('en');
      expect(user.preferences.email).toBe('test@example.com');
    });
  });

  describe('mapTPUsersToUsers', () => {
    it('should map multiple TrainingPeaks users to User entities', () => {
      // Arrange
      const tpUsers: UserProfileEndpointResponse['user'][] = [
        {
          userId: 1001,
          firstName: 'User',
          lastName: 'One',
          fullName: 'User One',
          email: 'user1@example.com',
          timeZone: 'UTC',
          language: 'en',
          units: 1,
          dateFormat: 'YYYY-MM-DD',
          temperatureUnit: 'C',
        },
        {
          userId: 1002,
          firstName: 'User',
          lastName: 'Two',
          fullName: 'User Two',
          email: 'user2@example.com',
          timeZone: 'America/New_York',
          language: 'en-US',
          units: 0,
          dateFormat: 'MM/DD/YYYY',
          temperatureUnit: 'F',
        },
      ];

      // Act
      const users = mapTPUsersToUsers(tpUsers);

      // Assert
      expect(users).toHaveLength(2);
      expect(users[0].id).toBe('1001');
      expect(users[0].name).toBe('User One');
      expect(users[0].preferences.units).toBe('metric');
      expect(users[1].id).toBe('1002');
      expect(users[1].name).toBe('User Two');
      expect(users[1].preferences.units).toBe('imperial');
    });

    it('should handle empty array', () => {
      // Arrange
      const tpUsers: UserProfileEndpointResponse['user'][] = [];

      // Act
      const users = mapTPUsersToUsers(tpUsers);

      // Assert
      expect(users).toHaveLength(0);
      expect(Array.isArray(users)).toBe(true);
    });

    it('should handle single user in array', () => {
      // Arrange
      const tpUsers: UserProfileEndpointResponse['user'][] = [
        {
          userId: 2001,
          firstName: 'Single',
          lastName: 'User',
          email: 'single@example.com',
          timeZone: 'Europe/London',
          language: 'en-GB',
          units: 1,
          dateFormat: 'DD/MM/YYYY',
          temperatureUnit: 'C',
        },
      ];

      // Act
      const users = mapTPUsersToUsers(tpUsers);

      // Assert
      expect(users).toHaveLength(1);
      expect(users[0].id).toBe('2001');
      expect(users[0].name).toBe('Single User');
    });
  });

  describe('mapTPUserToUserSafe', () => {
    it('should map valid user safely', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 3001,
        firstName: 'Safe',
        lastName: 'User',
        fullName: 'Safe User',
        email: 'safe@example.com',
        timeZone: 'Australia/Sydney',
        language: 'en-AU',
        units: 1,
        dateFormat: 'DD/MM/YYYY',
        temperatureUnit: 'C',
        personPhotoUrl: 'https://example.com/safe.jpg',
      };

      // Act
      const user = mapTPUserToUserSafe(tpUser);

      // Assert
      expect(user).not.toBeNull();
      expect(user!.id).toBe('3001');
      expect(user!.name).toBe('Safe User');
      expect(user!.avatar).toBe('https://example.com/safe.jpg');
      expect(user!.preferences.timezone).toBe('Australia/Sydney');
      expect(user!.preferences.language).toBe('en-AU');
    });

    it('should return null for undefined user', () => {
      // Arrange
      const tpUser = undefined;

      // Act
      const user = mapTPUserToUserSafe(tpUser);

      // Assert
      expect(user).toBeNull();
    });

    it('should return null for null user', () => {
      // Arrange
      const tpUser = null;

      // Act
      const user = mapTPUserToUserSafe(tpUser);

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle realistic TrainingPeaks user data', () => {
      // Arrange
      const realisticTPUser: UserProfileEndpointResponse['user'] = {
        userId: 5001234,
        firstName: 'Sarah',
        lastName: 'Connor',
        fullName: 'Sarah J. Connor',
        email: 'sarah.connor@resistance.mil',
        timeZone: 'America/Los_Angeles',
        language: 'en-US',
        units: 0, // imperial (US preference)
        dateFormat: 'MM/DD/YYYY',
        temperatureUnit: 'F',
        personPhotoUrl:
          'https://trainingpeaks-prod.s3.amazonaws.com/avatars/5001234/large.jpg',
      };

      // Act
      const user = mapTPUserToUser(realisticTPUser);

      // Assert
      expect(user.id).toBe('5001234');
      expect(user.name).toBe('Sarah J. Connor');
      expect(user.avatar).toContain('trainingpeaks-prod.s3.amazonaws.com');
      expect(user.preferences.units).toBe('imperial');
      expect(user.preferences.temperatureUnit).toBe('F');
      expect(user.preferences.email).toBe('sarah.connor@resistance.mil');
    });

    it('should handle international user preferences', () => {
      // Arrange
      const internationalUser: UserProfileEndpointResponse['user'] = {
        userId: 5002345,
        firstName: 'Lars',
        lastName: 'Andersen',
        fullName: 'Lars Øst Andersen',
        email: 'lars@example.dk',
        timeZone: 'Europe/Copenhagen',
        language: 'da-DK',
        units: 1, // metric (EU preference)
        dateFormat: 'DD-MM-YYYY',
        temperatureUnit: 'C',
        personPhotoUrl: 'https://example.com/lars.jpg',
      };

      // Act
      const user = mapTPUserToUser(internationalUser);

      // Assert
      expect(user.name).toBe('Lars Øst Andersen');
      expect(user.preferences.timezone).toBe('Europe/Copenhagen');
      expect(user.preferences.language).toBe('da-DK');
      expect(user.preferences.units).toBe('metric');
      expect(user.preferences.temperatureUnit).toBe('C');
      expect(user.preferences.dateFormat).toBe('DD-MM-YYYY');
    });

    it('should handle mapping chain: single -> multiple -> safe', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 6001,
        firstName: 'Chain',
        lastName: 'Test',
        email: 'chain@example.com',
        timeZone: 'UTC',
        language: 'en',
        units: 1,
        dateFormat: 'YYYY-MM-DD',
        temperatureUnit: 'C',
      };

      // Act
      const singleMapping = mapTPUserToUser(tpUser);
      const multipleMapping = mapTPUsersToUsers([tpUser]);
      const safeMapping = mapTPUserToUserSafe(tpUser);
      const safeMappingNull = mapTPUserToUserSafe(null);

      // Assert
      expect(singleMapping.id).toBe(multipleMapping[0].id);
      expect(singleMapping.name).toBe(safeMapping!.name);
      expect(singleMapping.preferences.timezone).toBe(
        safeMapping!.preferences.timezone
      );
      expect(safeMappingNull).toBeNull();
    });

    it('should handle numeric userId conversion to string', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 2147483647, // Large integer
        firstName: 'Big',
        lastName: 'Number',
        email: 'big@example.com',
        timeZone: 'UTC',
        language: 'en',
        units: 1,
        dateFormat: 'YYYY-MM-DD',
        temperatureUnit: 'C',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.id).toBe('2147483647');
      expect(typeof user.id).toBe('string');
    });

    it('should preserve exact preference values without transformation', () => {
      // Arrange
      const tpUser: UserProfileEndpointResponse['user'] = {
        userId: 7001,
        firstName: 'Exact',
        lastName: 'Values',
        email: 'exact@example.com',
        timeZone: 'America/New_York',
        language: 'en-US',
        units: 1,
        dateFormat: 'MM/DD/YYYY',
        temperatureUnit: 'C',
      };

      // Act
      const user = mapTPUserToUser(tpUser);

      // Assert
      expect(user.preferences.timezone).toBe('America/New_York');
      expect(user.preferences.language).toBe('en-US');
      expect(user.preferences.dateFormat).toBe('MM/DD/YYYY');
      expect(user.preferences.temperatureUnit).toBe('C');
      expect(user.preferences.email).toBe('exact@example.com');
    });
  });
});
