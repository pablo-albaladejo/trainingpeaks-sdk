/**
 * @vitest-environment node
 */

import {
  authTokenBuilder,
  credentialsBuilder,
  userBuilder,
  userPreferencesBuilder,
} from '@/__fixtures__/auth.fixture';
import type { UserRepository } from '@/application/repositories';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticateUser } from './authenticate-user';
import { getCurrentUser } from './get-current-user';
import { getUserSettings } from './get-user-settings';
import { refreshUserToken } from './refresh-user-token';
import { updateUserPreferences } from './update-user-preferences';

// Mock the config
vi.mock('@/config', () => ({
  getSDKConfig: vi.fn(() => ({
    tokens: {
      defaultExpiration: 3600000, // 1 hour in milliseconds
    },
  })),
}));

describe('User Service Implementations', () => {
  let mockUserRepository: UserRepository;

  beforeEach(() => {
    mockUserRepository = {
      authenticate: vi.fn(),
      getUserInfo: vi.fn(),
      refreshToken: vi.fn(),
      updatePreferences: vi.fn(),
      getUserSettings: vi.fn(),
    };
  });

  describe('authenticateUser', () => {
    it('should authenticate user and return domain objects', async () => {
      const credentials = credentialsBuilder.build();
      const mockToken = authTokenBuilder.build();
      const mockUser = userBuilder.build();

      const mockRawData = {
        token: mockToken,
        user: mockUser,
      };

      vi.mocked(mockUserRepository.authenticate).mockResolvedValue(mockRawData);

      const service = authenticateUser(mockUserRepository);
      const result = await service(credentials);

      expect(mockUserRepository.authenticate).toHaveBeenCalledWith(credentials);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token.accessToken).toBe(mockToken.accessToken);
      expect(result.token.tokenType).toBe(mockToken.tokenType);
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.name).toBe(mockUser.name);
    });

    it('should handle repository errors', async () => {
      const credentials = credentialsBuilder.build();

      const error = new Error('Authentication failed');
      vi.mocked(mockUserRepository.authenticate).mockRejectedValue(error);

      const service = authenticateUser(mockUserRepository);

      await expect(service(credentials)).rejects.toThrow(
        'Authentication failed'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user and return domain object', async () => {
      const mockToken = authTokenBuilder.build();
      const mockRawUser = userBuilder.build();

      vi.mocked(mockUserRepository.getUserInfo).mockResolvedValue(mockRawUser);

      const service = getCurrentUser(mockUserRepository);
      const result = await service(mockToken);

      expect(mockUserRepository.getUserInfo).toHaveBeenCalledWith(mockToken);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockRawUser.id);
      expect(result.name).toBe(mockRawUser.name);
    });

    it('should handle repository errors', async () => {
      const mockToken = authTokenBuilder.build();

      const error = new Error('User not found');
      vi.mocked(mockUserRepository.getUserInfo).mockRejectedValue(error);

      const service = getCurrentUser(mockUserRepository);

      await expect(service(mockToken)).rejects.toThrow('User not found');
    });
  });

  describe('refreshUserToken', () => {
    it('should refresh token and return domain object', async () => {
      const refreshToken = 'refresh123';
      const mockRawToken = authTokenBuilder.build();

      vi.mocked(mockUserRepository.refreshToken).mockResolvedValue(
        mockRawToken
      );

      const service = refreshUserToken(mockUserRepository);
      const result = await service(refreshToken);

      expect(mockUserRepository.refreshToken).toHaveBeenCalledWith(
        refreshToken
      );
      expect(result).toBeDefined();
      expect(result.accessToken).toBe(mockRawToken.accessToken);
      expect(result.tokenType).toBe(mockRawToken.tokenType);
    });

    it('should handle repository errors', async () => {
      const refreshToken = 'refresh123';

      const error = new Error('Token refresh failed');
      vi.mocked(mockUserRepository.refreshToken).mockRejectedValue(error);

      const service = refreshUserToken(mockUserRepository);

      await expect(service(refreshToken)).rejects.toThrow(
        'Token refresh failed'
      );
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', async () => {
      const mockToken = authTokenBuilder.build();
      const preferences = userPreferencesBuilder.build();

      vi.mocked(mockUserRepository.updatePreferences).mockResolvedValue();

      const service = updateUserPreferences(mockUserRepository);
      await service(mockToken, preferences);

      expect(mockUserRepository.updatePreferences).toHaveBeenCalledWith(
        mockToken,
        preferences
      );
    });

    it('should handle repository errors', async () => {
      const mockToken = authTokenBuilder.build();
      const preferences = userPreferencesBuilder.build();

      const error = new Error('Update failed');
      vi.mocked(mockUserRepository.updatePreferences).mockRejectedValue(error);

      const service = updateUserPreferences(mockUserRepository);

      await expect(service(mockToken, preferences)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('getUserSettings', () => {
    it('should get user settings successfully', async () => {
      const mockToken = authTokenBuilder.build();

      const mockSettings = userPreferencesBuilder.build();

      vi.mocked(mockUserRepository.getUserSettings).mockResolvedValue(
        mockSettings
      );

      const service = getUserSettings(mockUserRepository);
      const result = await service(mockToken);

      expect(mockUserRepository.getUserSettings).toHaveBeenCalledWith(
        mockToken
      );
      expect(result).toEqual(mockSettings);
    });

    it('should handle repository errors', async () => {
      const mockToken = authTokenBuilder.build();

      const error = new Error('Settings not found');
      vi.mocked(mockUserRepository.getUserSettings).mockRejectedValue(error);

      const service = getUserSettings(mockUserRepository);

      await expect(service(mockToken)).rejects.toThrow('Settings not found');
    });
  });
});
