import { describe, expect, it, vi } from 'vitest';

import type { AuthRepository, WorkoutRepository } from '@/domain';

import { createTrainingPeaksRepository } from './trainingpeaks-repository';

describe('TrainingPeaksRepository', () => {
  const mockAuthRepository: AuthRepository = {
    login: vi.fn(),
    logout: vi.fn(),
  };

  const mockWorkoutRepository: WorkoutRepository = {
    getWorkoutsList: vi.fn(),
  };

  const dependencies = {
    authRepository: mockAuthRepository,
    workoutRepository: mockWorkoutRepository,
  };

  describe('createTrainingPeaksRepository', () => {
    it('should create repository with auth and workout methods', () => {
      const repository = createTrainingPeaksRepository(dependencies);

      expect(repository).toHaveProperty('login');
      expect(repository).toHaveProperty('logout');
      expect(repository).toHaveProperty('getWorkoutsList');
    });

    it('should delegate login to auth repository', () => {
      const repository = createTrainingPeaksRepository(dependencies);

      expect(repository.login).toBe(mockAuthRepository.login);
    });

    it('should delegate logout to auth repository', () => {
      const repository = createTrainingPeaksRepository(dependencies);

      expect(repository.logout).toBe(mockAuthRepository.logout);
    });

    it('should delegate getWorkoutsList to workout repository', () => {
      const repository = createTrainingPeaksRepository(dependencies);

      expect(repository.getWorkoutsList).toBe(mockWorkoutRepository.getWorkoutsList);
    });

    it('should create different instances for different dependencies', () => {
      const otherAuthRepository: AuthRepository = {
        login: vi.fn(),
        logout: vi.fn(),
      };

      const otherWorkoutRepository: WorkoutRepository = {
        getWorkoutsList: vi.fn(),
      };

      const repository1 = createTrainingPeaksRepository(dependencies);
      const repository2 = createTrainingPeaksRepository({
        authRepository: otherAuthRepository,
        workoutRepository: otherWorkoutRepository,
      });

      expect(repository1.login).not.toBe(repository2.login);
      expect(repository1.logout).not.toBe(repository2.logout);
      expect(repository1.getWorkoutsList).not.toBe(repository2.getWorkoutsList);
    });

    it('should maintain proper typing', () => {
      const repository = createTrainingPeaksRepository(dependencies);

      // TypeScript compilation validates the types
      expect(typeof repository.login).toBe('function');
      expect(typeof repository.logout).toBe('function');
      expect(typeof repository.getWorkoutsList).toBe('function');
    });
  });

  describe('Repository Interface Compliance', () => {
    it('should implement TrainingPeaksRepository interface', () => {
      const repository = createTrainingPeaksRepository(dependencies);

      // Verify all required methods exist
      const requiredMethods = ['login', 'logout', 'getWorkoutsList'];
      
      requiredMethods.forEach(method => {
        expect(repository).toHaveProperty(method);
        expect(typeof repository[method as keyof typeof repository]).toBe('function');
      });
    });

    it('should not add extra methods beyond interface', () => {
      const repository = createTrainingPeaksRepository(dependencies);
      const repositoryKeys = Object.keys(repository);

      expect(repositoryKeys).toHaveLength(3);
      expect(repositoryKeys).toEqual(['login', 'logout', 'getWorkoutsList']);
    });
  });

  describe('Dependencies Management', () => {
    it('should handle auth repository replacement', () => {
      const newAuthRepository: AuthRepository = {
        login: vi.fn(),
        logout: vi.fn(),
      };

      const repository = createTrainingPeaksRepository({
        ...dependencies,
        authRepository: newAuthRepository,
      });

      expect(repository.login).toBe(newAuthRepository.login);
      expect(repository.logout).toBe(newAuthRepository.logout);
      expect(repository.getWorkoutsList).toBe(mockWorkoutRepository.getWorkoutsList);
    });

    it('should handle workout repository replacement', () => {
      const newWorkoutRepository: WorkoutRepository = {
        getWorkoutsList: vi.fn(),
      };

      const repository = createTrainingPeaksRepository({
        ...dependencies,
        workoutRepository: newWorkoutRepository,
      });

      expect(repository.login).toBe(mockAuthRepository.login);
      expect(repository.logout).toBe(mockAuthRepository.logout);
      expect(repository.getWorkoutsList).toBe(newWorkoutRepository.getWorkoutsList);
    });
  });
});