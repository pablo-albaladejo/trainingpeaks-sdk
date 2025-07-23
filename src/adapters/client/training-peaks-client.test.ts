/**
 * TrainingPeaks Client Tests
 * Tests for the new functional client implementation
 */

import { describe, expect, it, vi } from 'vitest';
import { createTrainingPeaksClient } from './training-peaks-client';

// Mock the dependencies
vi.mock('@/application/use-cases/login', () => ({
  executeLoginUseCase: vi.fn(() => vi.fn()),
}));

vi.mock('@/application/use-cases/get-user', () => ({
  executeGetUserUseCase: vi.fn(() => vi.fn()),
}));

vi.mock('@/adapters/services/auth-service', () => ({
  createAuthService: vi.fn(() => ({
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  })),
}));

vi.mock('@/adapters/repositories/auth-repository', () => ({
  createAuthRepository: vi.fn(() => ({})),
}));

vi.mock('@/adapters/repositories/workout-repository', () => ({
  createWorkoutRepository: vi.fn(() => ({})),
}));

vi.mock('@/config', () => ({
  getSDKConfig: vi.fn(() => ({
    urls: { apiBaseUrl: 'https://api.trainingpeaks.com' },
    timeouts: { apiAuth: 5000 },
  })),
}));

describe('createTrainingPeaksClient', () => {
  it('should create a client instance with all required methods', () => {
    const client = createTrainingPeaksClient();

    expect(client).toBeDefined();
    expect(typeof client.login).toBe('function');
    expect(typeof client.getUser).toBe('function');
    expect(typeof client.isAuthenticated).toBe('function');
    expect(typeof client.getUserId).toBe('function');
  });

  it('should accept configuration options', () => {
    const config = {
      apiKey: 'test-api-key',
      baseUrl: 'https://test-api.trainingpeaks.com',
    };

    expect(() => createTrainingPeaksClient(config)).not.toThrow();
  });

  it('should return false for isAuthenticated initially', () => {
    const client = createTrainingPeaksClient();
    expect(client.isAuthenticated()).toBe(false);
  });

  it('should return null for getUserId when not authenticated', () => {
    const client = createTrainingPeaksClient();
    expect(client.getUserId()).toBe(null);
  });

  it('should have async methods that return promises', () => {
    const client = createTrainingPeaksClient();

    const loginPromise = client.login('username', 'password');
    expect(loginPromise).toBeInstanceOf(Promise);

    const getUserPromise = client.getUser();
    expect(getUserPromise).toBeInstanceOf(Promise);
  });
});
