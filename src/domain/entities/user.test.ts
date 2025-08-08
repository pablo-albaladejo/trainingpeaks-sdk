/**
 * User Entity Tests
 * Tests for the User domain entity and related utilities
 */

import { describe, expect, it } from 'vitest';

import { ValidationError } from '@/domain/errors/domain-errors';

import {
  createUser,
  getUserPreference,
  hasUserPreference,
  updateUserAvatar,
  updateUserName,
  updateUserPreferences,
} from './user';

describe('User Entity', () => {
  describe('createUser', () => {
    it('should create a valid User with all properties', () => {
      // Arrange
      const id = 'user123';
      const name = 'John Doe';
      const username = 'johndoe';
      const avatar = 'https://example.com/avatar.jpg';
      const preferences = { timezone: 'UTC', language: 'en' };

      // Act
      const user = createUser(id, name, username, avatar, preferences);

      // Assert
      expect(user.id).toBe('user123');
      expect(user.name).toBe('John Doe');
      expect(user.username).toBe('johndoe');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.preferences).toEqual({ timezone: 'UTC', language: 'en' });
    });

    it('should create User without optional properties', () => {
      // Arrange
      const id = 'user456';
      const name = 'Jane Smith';
      const username = 'janesmith';

      // Act
      const user = createUser(id, name, username);

      // Assert
      expect(user.id).toBe('user456');
      expect(user.name).toBe('Jane Smith');
      expect(user.username).toBe('janesmith');
      expect(user.avatar).toBeUndefined();
      expect(user.preferences).toBeUndefined();
    });

    it('should trim whitespace from id and name', () => {
      // Arrange
      const id = '  user789  ';
      const name = '  Bob Wilson  ';
      const username = 'bobwilson';

      // Act
      const user = createUser(id, name, username);

      // Assert
      expect(user.id).toBe('user789');
      expect(user.name).toBe('Bob Wilson');
    });

    it('should accept exactly 100 character name', () => {
      // Arrange
      const id = 'user123';
      const name = 'a'.repeat(100);
      const username = 'user123';

      // Act
      const user = createUser(id, name, username);

      // Assert
      expect(user.name).toBe(name);
      expect(user.name).toHaveLength(100);
    });

    describe('Validation Errors', () => {
      it('should throw ValidationError for empty id', () => {
        // Arrange
        const id = '';
        const name = 'John Doe';

        // Act & Assert
        expect(() => createUser(id, name)).toThrow(ValidationError);
        expect(() => createUser(id, name)).toThrow('User ID cannot be empty');
      });

      it('should throw ValidationError for whitespace-only id', () => {
        // Arrange
        const id = '   ';
        const name = 'John Doe';

        // Act & Assert
        expect(() => createUser(id, name)).toThrow(ValidationError);
        expect(() => createUser(id, name)).toThrow('User ID cannot be empty');
      });

      it('should throw ValidationError for empty name', () => {
        // Arrange
        const id = 'user123';
        const name = '';

        // Act & Assert
        expect(() => createUser(id, name)).toThrow(ValidationError);
        expect(() => createUser(id, name)).toThrow('User name cannot be empty');
      });

      it('should throw ValidationError for whitespace-only name', () => {
        // Arrange
        const id = 'user123';
        const name = '   ';

        // Act & Assert
        expect(() => createUser(id, name)).toThrow(ValidationError);
        expect(() => createUser(id, name)).toThrow('User name cannot be empty');
      });

      it('should throw ValidationError for name exceeding 100 characters', () => {
        // Arrange
        const id = 'user123';
        const name = 'a'.repeat(101);

        // Act & Assert
        expect(() => createUser(id, name)).toThrow(ValidationError);
        expect(() => createUser(id, name)).toThrow(
          'User name cannot exceed 100 characters'
        );
      });

      it('should throw ValidationError for invalid avatar URL', () => {
        // Arrange
        const id = 'user123';
        const name = 'John Doe';
        const username = 'johndoe';
        const avatar = 'not-a-valid-url';

        // Act & Assert
        expect(() => createUser(id, name, username, avatar)).toThrow(
          ValidationError
        );
        expect(() => createUser(id, name, username, avatar)).toThrow(
          'Avatar must be a valid URL'
        );
      });

      it('should include field context in validation errors', () => {
        // Arrange & Act & Assert
        try {
          createUser('', 'John Doe', 'johndoe');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('id');
        }

        try {
          createUser('user123', '', 'username');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('name');
        }

        try {
          createUser('user123', 'a'.repeat(101), 'username');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('name');
        }

        try {
          createUser('user123', 'John Doe', 'johndoe', 'invalid-url');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('avatar');
        }
      });
    });

    describe('Valid Avatar URLs', () => {
      it('should accept valid HTTP URL for avatar', () => {
        // Arrange
        const id = 'user123';
        const name = 'John Doe';
        const avatar = 'http://example.com/avatar.jpg';

        // Act
        const user = createUser(id, name, 'johndoe', avatar);

        // Assert
        expect(user.avatar).toBe('http://example.com/avatar.jpg');
      });

      it('should accept valid HTTPS URL for avatar', () => {
        // Arrange
        const id = 'user123';
        const name = 'John Doe';
        const avatar = 'https://secure.example.com/avatar.png';

        // Act
        const user = createUser(id, name, 'johndoe', avatar);

        // Assert
        expect(user.avatar).toBe('https://secure.example.com/avatar.png');
      });

      it('should accept data URL for avatar', () => {
        // Arrange
        const id = 'user123';
        const name = 'John Doe';
        const avatar =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

        // Act
        const user = createUser(id, name, 'johndoe', avatar);

        // Assert
        expect(user.avatar).toBe(avatar);
      });

      it('should accept complex URL with query parameters', () => {
        // Arrange
        const id = 'user123';
        const name = 'John Doe';
        const avatar =
          'https://api.example.com/avatar?user=123&size=large&format=jpg';

        // Act
        const user = createUser(id, name, 'johndoe', avatar);

        // Assert
        expect(user.avatar).toBe(avatar);
      });
    });
  });

  describe('updateUserName', () => {
    it('should update user name successfully', () => {
      // Arrange
      const originalUser = createUser('user123', 'John Doe', 'johndoe');
      const newName = 'John Smith';

      // Act
      const updatedUser = updateUserName(originalUser, newName);

      // Assert
      expect(updatedUser.id).toBe('user123');
      expect(updatedUser.name).toBe('John Smith');
      expect(updatedUser.avatar).toBe(originalUser.avatar);
      expect(updatedUser.preferences).toBe(originalUser.preferences);
    });

    it('should trim whitespace from new name', () => {
      // Arrange
      const originalUser = createUser('user123', 'John Doe', 'johndoe');
      const newName = '  Jane Smith  ';

      // Act
      const updatedUser = updateUserName(originalUser, newName);

      // Assert
      expect(updatedUser.name).toBe('Jane Smith');
    });

    it('should not mutate original user object', () => {
      // Arrange
      const originalUser = createUser('user123', 'John Doe', 'johndoe');
      const newName = 'John Smith';

      // Act
      const updatedUser = updateUserName(originalUser, newName);

      // Assert
      expect(originalUser.name).toBe('John Doe');
      expect(updatedUser.name).toBe('John Smith');
      expect(originalUser).not.toBe(updatedUser);
    });

    it('should preserve all other user properties', () => {
      // Arrange
      const originalUser = createUser(
        'user123',
        'John Doe',
        'johndoe',
        'https://example.com/avatar.jpg',
        { timezone: 'UTC' }
      );
      const newName = 'John Smith';

      // Act
      const updatedUser = updateUserName(originalUser, newName);

      // Assert
      expect(updatedUser.id).toBe(originalUser.id);
      expect(updatedUser.avatar).toBe(originalUser.avatar);
      expect(updatedUser.preferences).toBe(originalUser.preferences);
    });

    describe('Validation Errors', () => {
      it('should throw ValidationError for empty name', () => {
        // Arrange
        const user = createUser('user123', 'John Doe', 'johndoe');

        // Act & Assert
        expect(() => updateUserName(user, '')).toThrow(ValidationError);
        expect(() => updateUserName(user, '')).toThrow(
          'User name cannot be empty'
        );
      });

      it('should throw ValidationError for whitespace-only name', () => {
        // Arrange
        const user = createUser('user123', 'John Doe', 'johndoe');

        // Act & Assert
        expect(() => updateUserName(user, '   ')).toThrow(ValidationError);
        expect(() => updateUserName(user, '   ')).toThrow(
          'User name cannot be empty'
        );
      });

      it('should throw ValidationError for name exceeding 100 characters', () => {
        // Arrange
        const user = createUser('user123', 'John Doe', 'johndoe');
        const longName = 'a'.repeat(101);

        // Act & Assert
        expect(() => updateUserName(user, longName)).toThrow(ValidationError);
        expect(() => updateUserName(user, longName)).toThrow(
          'User name cannot exceed 100 characters'
        );
      });
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', () => {
      // Arrange
      const originalUser = createUser('user123', 'John Doe', 'johndoe');
      const newPreferences = {
        timezone: 'America/New_York',
        language: 'en-US',
        theme: 'dark',
      };

      // Act
      const updatedUser = updateUserPreferences(originalUser, newPreferences);

      // Assert
      expect(updatedUser.preferences).toEqual(newPreferences);
      expect(updatedUser.id).toBe(originalUser.id);
      expect(updatedUser.name).toBe(originalUser.name);
      expect(updatedUser.avatar).toBe(originalUser.avatar);
    });

    it('should replace existing preferences completely', () => {
      // Arrange
      const originalUser = createUser(
        'user123',
        'John Doe',
        'johndoe',
        undefined,
        {
          timezone: 'UTC',
          language: 'en',
        }
      );
      const newPreferences = { theme: 'dark', notifications: true };

      // Act
      const updatedUser = updateUserPreferences(originalUser, newPreferences);

      // Assert
      expect(updatedUser.preferences).toEqual({
        theme: 'dark',
        notifications: true,
      });
      expect(updatedUser.preferences).not.toHaveProperty('timezone');
      expect(updatedUser.preferences).not.toHaveProperty('language');
    });

    it('should not mutate original user object', () => {
      // Arrange
      const originalPreferences = { timezone: 'UTC' };
      const originalUser = createUser(
        'user123',
        'John Doe',
        'johndoe',
        undefined,
        originalPreferences
      );
      const newPreferences = { timezone: 'America/New_York' };

      // Act
      const updatedUser = updateUserPreferences(originalUser, newPreferences);

      // Assert
      expect(originalUser.preferences).toEqual({ timezone: 'UTC' });
      expect(updatedUser.preferences).toEqual({ timezone: 'America/New_York' });
      expect(originalUser).not.toBe(updatedUser);
    });

    it('should handle empty preferences object', () => {
      // Arrange
      const originalUser = createUser(
        'user123',
        'John Doe',
        'johndoe',
        undefined,
        {
          timezone: 'UTC',
        }
      );
      const newPreferences = {};

      // Act
      const updatedUser = updateUserPreferences(originalUser, newPreferences);

      // Assert
      expect(updatedUser.preferences).toEqual({});
    });

    it('should handle complex nested preferences', () => {
      // Arrange
      const originalUser = createUser('user123', 'John Doe', 'johndoe');
      const newPreferences = {
        ui: { theme: 'dark', sidebarCollapsed: true },
        notifications: { email: true, push: false, sms: true },
        training: { units: 'metric', autoSync: true },
      };

      // Act
      const updatedUser = updateUserPreferences(originalUser, newPreferences);

      // Assert
      expect(updatedUser.preferences).toEqual(newPreferences);
    });
  });

  describe('updateUserAvatar', () => {
    it('should update user avatar successfully', () => {
      // Arrange
      const originalUser = createUser('user123', 'John Doe', 'johndoe');
      const newAvatar = 'https://example.com/new-avatar.jpg';

      // Act
      const updatedUser = updateUserAvatar(originalUser, newAvatar);

      // Assert
      expect(updatedUser.avatar).toBe(newAvatar);
      expect(updatedUser.id).toBe(originalUser.id);
      expect(updatedUser.name).toBe(originalUser.name);
      expect(updatedUser.preferences).toBe(originalUser.preferences);
    });

    it('should remove avatar when undefined is passed', () => {
      // Arrange
      const originalUser = createUser(
        'user123',
        'John Doe',
        'https://example.com/avatar.jpg'
      );

      // Act
      const updatedUser = updateUserAvatar(originalUser, undefined);

      // Assert
      expect(updatedUser.avatar).toBeUndefined();
    });

    it('should not mutate original user object', () => {
      // Arrange
      const originalUser = createUser(
        'user123',
        'John Doe',
        'johndoe',
        'https://example.com/old-avatar.jpg'
      );
      const newAvatar = 'https://example.com/new-avatar.jpg';

      // Act
      const updatedUser = updateUserAvatar(originalUser, newAvatar);

      // Assert
      expect(originalUser.avatar).toBe('https://example.com/old-avatar.jpg');
      expect(updatedUser.avatar).toBe(newAvatar);
      expect(originalUser).not.toBe(updatedUser);
    });

    describe('Validation Errors', () => {
      it('should throw ValidationError for invalid avatar URL', () => {
        // Arrange
        const user = createUser('user123', 'John Doe', 'johndoe');
        const invalidUrl = 'not-a-valid-url';

        // Act & Assert
        expect(() => updateUserAvatar(user, invalidUrl)).toThrow(
          ValidationError
        );
        expect(() => updateUserAvatar(user, invalidUrl)).toThrow(
          'Avatar must be a valid URL'
        );
      });

      it('should include field context in validation error', () => {
        // Arrange
        const user = createUser('user123', 'John Doe', 'johndoe');

        // Act & Assert
        try {
          updateUserAvatar(user, 'invalid-url');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('avatar');
        }
      });
    });

    it('should accept valid URLs', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe');
      const validUrls = [
        'https://example.com/avatar.jpg',
        'http://example.com/avatar.png',
        'https://cdn.example.com/users/123/avatar.gif?v=2',
      ];

      // Act & Assert
      validUrls.forEach((url) => {
        const updatedUser = updateUserAvatar(user, url);
        expect(updatedUser.avatar).toBe(url);
      });
    });
  });

  describe('hasUserPreference', () => {
    it('should return true when preference exists', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        timezone: 'UTC',
        language: 'en',
      });

      // Act & Assert
      expect(hasUserPreference(user, 'timezone')).toBe(true);
      expect(hasUserPreference(user, 'language')).toBe(true);
    });

    it('should return false when preference does not exist', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        timezone: 'UTC',
      });

      // Act & Assert
      expect(hasUserPreference(user, 'language')).toBe(false);
      expect(hasUserPreference(user, 'theme')).toBe(false);
    });

    it('should return false when user has no preferences', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe');

      // Act & Assert
      expect(hasUserPreference(user, 'timezone')).toBe(false);
      expect(hasUserPreference(user, 'language')).toBe(false);
    });

    it('should return false when preferences is undefined', () => {
      // Arrange
      const user = createUser(
        'user123',
        'John Doe',
        'johndoe',
        undefined,
        undefined
      );

      // Act & Assert
      expect(hasUserPreference(user, 'timezone')).toBe(false);
    });

    it('should handle empty preferences object', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {});

      // Act & Assert
      expect(hasUserPreference(user, 'timezone')).toBe(false);
    });

    it('should check for exact key match', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        timezone: 'UTC',
        Timezone: 'America/New_York',
      });

      // Act & Assert
      expect(hasUserPreference(user, 'timezone')).toBe(true);
      expect(hasUserPreference(user, 'Timezone')).toBe(true);
      expect(hasUserPreference(user, 'TIMEZONE')).toBe(false);
    });
  });

  describe('getUserPreference', () => {
    it('should return preference value when it exists', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        timezone: 'UTC',
        language: 'en',
        notifications: true,
        maxWorkouts: 5,
      });

      // Act & Assert
      expect(getUserPreference(user, 'timezone')).toBe('UTC');
      expect(getUserPreference(user, 'language')).toBe('en');
      expect(getUserPreference(user, 'notifications')).toBe(true);
      expect(getUserPreference(user, 'maxWorkouts')).toBe(5);
    });

    it('should return undefined when preference does not exist', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        timezone: 'UTC',
      });

      // Act & Assert
      expect(getUserPreference(user, 'language')).toBeUndefined();
      expect(getUserPreference(user, 'theme')).toBeUndefined();
    });

    it('should return default value when preference does not exist', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        timezone: 'UTC',
      });

      // Act & Assert
      expect(getUserPreference(user, 'language', 'en')).toBe('en');
      expect(getUserPreference(user, 'theme', 'light')).toBe('light');
      expect(getUserPreference(user, 'notifications', false)).toBe(false);
    });

    it('should return undefined when user has no preferences', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe');

      // Act & Assert
      expect(getUserPreference(user, 'timezone')).toBeUndefined();
    });

    it('should return default value when user has no preferences', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe');

      // Act & Assert
      expect(getUserPreference(user, 'timezone', 'UTC')).toBe('UTC');
    });

    it('should handle typed return values correctly', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        stringValue: 'text',
        numberValue: 42,
        booleanValue: true,
        objectValue: { nested: true },
        arrayValue: [1, 2, 3],
      });

      // Act & Assert
      expect(getUserPreference<string>(user, 'stringValue')).toBe('text');
      expect(getUserPreference<number>(user, 'numberValue')).toBe(42);
      expect(getUserPreference<boolean>(user, 'booleanValue')).toBe(true);
      expect(getUserPreference<object>(user, 'objectValue')).toEqual({
        nested: true,
      });
      expect(getUserPreference<number[]>(user, 'arrayValue')).toEqual([
        1, 2, 3,
      ]);
    });

    it('should prefer existing value over default value', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        timezone: 'America/New_York',
      });

      // Act & Assert
      expect(getUserPreference(user, 'timezone', 'UTC')).toBe(
        'America/New_York'
      );
    });

    it('should handle null and undefined values in preferences', () => {
      // Arrange
      const user = createUser('user123', 'John Doe', 'johndoe', undefined, {
        nullValue: null,
        undefinedValue: undefined,
        falseValue: false,
        zeroValue: 0,
        emptyString: '',
      });

      // Act & Assert
      expect(getUserPreference(user, 'nullValue')).toBeNull();
      expect(getUserPreference(user, 'undefinedValue')).toBeUndefined();
      expect(getUserPreference(user, 'falseValue')).toBe(false);
      expect(getUserPreference(user, 'zeroValue')).toBe(0);
      expect(getUserPreference(user, 'emptyString')).toBe('');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user lifecycle', () => {
      // Arrange
      const id = 'athlete123';
      const initialName = 'John Athlete';
      const avatar = 'https://trainingpeaks.com/avatar.jpg';
      const initialPreferences = { timezone: 'UTC', units: 'metric' };

      // Act - Create user
      const user = createUser(
        id,
        initialName,
        'johndoe',
        avatar,
        initialPreferences
      );

      // Act - Update name
      const userWithNewName = updateUserName(user, 'John Pro Athlete');

      // Act - Update preferences
      const userWithNewPrefs = updateUserPreferences(userWithNewName, {
        timezone: 'America/Denver',
        units: 'imperial',
        theme: 'dark',
      });

      // Act - Update avatar
      const finalUser = updateUserAvatar(
        userWithNewPrefs,
        'https://trainingpeaks.com/new-avatar.jpg'
      );

      // Assert
      expect(finalUser.id).toBe('athlete123');
      expect(finalUser.name).toBe('John Pro Athlete');
      expect(finalUser.avatar).toBe('https://trainingpeaks.com/new-avatar.jpg');
      expect(finalUser.preferences).toEqual({
        timezone: 'America/Denver',
        units: 'imperial',
        theme: 'dark',
      });

      // Act & Assert - Check preferences
      expect(hasUserPreference(finalUser, 'timezone')).toBe(true);
      expect(hasUserPreference(finalUser, 'units')).toBe(true);
      expect(hasUserPreference(finalUser, 'theme')).toBe(true);
      expect(hasUserPreference(finalUser, 'language')).toBe(false);

      expect(getUserPreference(finalUser, 'timezone')).toBe('America/Denver');
      expect(getUserPreference(finalUser, 'units')).toBe('imperial');
      expect(getUserPreference(finalUser, 'language', 'en')).toBe('en');
    });

    it('should handle user without preferences throughout lifecycle', () => {
      // Arrange & Act
      let user = createUser('user123', 'John Doe', 'johndoe');

      // Act - Update name
      user = updateUserName(user, 'Jane Doe');

      // Act - Update avatar
      user = updateUserAvatar(user, 'https://example.com/avatar.jpg');

      // Act - Add preferences
      user = updateUserPreferences(user, { timezone: 'UTC', language: 'en' });

      // Assert
      expect(user.id).toBe('user123');
      expect(user.name).toBe('Jane Doe');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(hasUserPreference(user, 'timezone')).toBe(true);
      expect(getUserPreference(user, 'timezone')).toBe('UTC');
    });

    it('should maintain immutability throughout operations', () => {
      // Arrange
      const originalUser = createUser(
        'user123',
        'John Doe',
        'johndoe',
        'https://example.com/avatar.jpg',
        { timezone: 'UTC' }
      );

      // Act
      const nameUpdated = updateUserName(originalUser, 'Jane Doe');
      const avatarUpdated = updateUserAvatar(
        originalUser,
        'https://example.com/new-avatar.jpg'
      );
      const prefsUpdated = updateUserPreferences(originalUser, {
        language: 'es',
      });

      // Assert - Original user unchanged
      expect(originalUser.name).toBe('John Doe');
      expect(originalUser.avatar).toBe('https://example.com/avatar.jpg');
      expect(originalUser.preferences).toEqual({ timezone: 'UTC' });

      // Assert - Each operation creates new object
      expect(nameUpdated).not.toBe(originalUser);
      expect(avatarUpdated).not.toBe(originalUser);
      expect(prefsUpdated).not.toBe(originalUser);

      // Assert - Updates are isolated
      expect(nameUpdated.name).toBe('Jane Doe');
      expect(nameUpdated.avatar).toBe(originalUser.avatar);
      expect(nameUpdated.preferences).toBe(originalUser.preferences);
    });
  });
});
