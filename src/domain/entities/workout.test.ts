/**
 * Workout Entity Tests
 * Tests for the Workout domain entity following @unit-test-rule.mdc
 */

import { faker } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import { StructuredWorkoutDataFixture } from '../../__fixtures__/structured-workout-data.fixture';
import { WorkoutFixture } from '../../__fixtures__/workout-entity.fixture';
import { ValidationError } from '../../domain/errors';
import {
  createStructuredWorkout,
  createWorkout,
  createWorkoutFromFile,
} from '../../infrastructure/services/domain-factories';

describe('Workout Entity', () => {
  describe('create', () => {
    it('should create a workout with all required fields', () => {
      // Arrange
      const id = faker.string.uuid();
      const name = 'Test Workout';
      const description = 'A test workout';
      const date = new Date();
      const duration = 3600;

      // Act
      const workout = createWorkout(id, name, description, date, duration);

      // Assert
      expect(workout.id).toBe(id);
      expect(workout.name).toBe(name);
      expect(workout.description).toBe(description);
      expect(workout.date).toBe(date);
      expect(workout.duration).toBe(duration);
      expect(workout.createdAt).toBeInstanceOf(Date);
      expect(workout.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a workout with optional fields', () => {
      // Arrange
      const fixture = new WorkoutFixture()
        .withRandomId()
        .withName('Complete Workout')
        .withDescription('Full featured workout')
        .withRandomDate()
        .withDuration(3600)
        .withDistance(10000)
        .withActivityType('run')
        .withTags(['interval', 'endurance']);

      // Act
      const workout = fixture.build();

      // Assert
      expect(workout.distance).toBe(10000);
      expect(workout.activityType).toBe('run');
      expect(workout.tags).toEqual(['interval', 'endurance']);
    });

    it('should set default createdAt and updatedAt when not provided', () => {
      // Arrange
      const before = new Date();

      // Act
      const workout = WorkoutFixture.default();

      // Assert
      const after = new Date();
      expect(workout.createdAt!.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(workout.createdAt!.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(workout.updatedAt!.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(workout.updatedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided createdAt and updatedAt', () => {
      // Arrange
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      // Act
      const workout = new WorkoutFixture()
        .withCreatedAt(createdAt)
        .withUpdatedAt(updatedAt)
        .build();

      // Assert
      expect(workout.createdAt).toBe(createdAt);
      expect(workout.updatedAt).toBe(updatedAt);
    });
  });

  describe('fromFile', () => {
    it('should create a workout from file with minimal metadata', () => {
      // Arrange
      const id = faker.string.uuid();
      const fileName = 'workout.tcx';
      const fileContent =
        '<TrainingCenterDatabase>...</TrainingCenterDatabase>';

      // Act
      const workout = createWorkoutFromFile(id, fileName, fileContent);

      // Assert
      expect(workout.id).toBe(id);
      expect(workout.fileName).toBe(fileName);
      expect(workout.fileContent).toBe(fileContent);
      expect(workout.name).toBe('workout'); // Extension removed
      expect(workout.description).toBe('');
      expect(workout.duration).toBe(0);
      expect(workout.date).toBeInstanceOf(Date);
    });

    it('should create a workout from file with full metadata', () => {
      // Arrange
      const id = faker.string.uuid();
      const fileName = 'morning_run.gpx';
      const fileContent = '<gpx>...</gpx>';
      const metadata = {
        name: 'Morning Run',
        description: 'Early morning jog',
        date: new Date('2024-01-15'),
        duration: 1800,
        distance: 5000,
        activityType: 'run',
        tags: ['morning', 'easy'],
      };

      // Act
      const workout = createWorkoutFromFile(
        id,
        fileName,
        fileContent,
        metadata
      );

      // Assert
      expect(workout.name).toBe('Morning Run');
      expect(workout.description).toBe('Early morning jog');
      expect(workout.date).toEqual(new Date('2024-01-15'));
      expect(workout.duration).toBe(1800);
      expect(workout.distance).toBe(5000);
      expect(workout.activityType).toBe('run');
      expect(workout.tags).toEqual(['morning', 'easy']);
    });

    it('should remove file extension from name when no name provided', () => {
      // Arrange
      const testCases = [
        { fileName: 'workout.tcx', expectedName: 'workout' },
        { fileName: 'morning_run.gpx', expectedName: 'morning_run' },
        { fileName: 'cycling.fit', expectedName: 'cycling' },
        {
          fileName: 'complex.file.name.tcx',
          expectedName: 'complex.file.name',
        },
      ];

      testCases.forEach(({ fileName, expectedName }) => {
        // Act
        const workout = createWorkoutFromFile(
          faker.string.uuid(),
          fileName,
          'content'
        );

        // Assert
        expect(workout.name).toBe(expectedName);
      });
    });
  });

  describe('createStructured', () => {
    it('should create a structured workout', () => {
      // Arrange
      const id = faker.string.uuid();
      const name = 'Structured Workout';
      const description = 'A structured workout';
      const date = new Date();
      const structure = StructuredWorkoutDataFixture.default().structure;
      const expectedDuration = structure.getTotalDuration();

      // Act
      const workout = createStructuredWorkout(
        id,
        name,
        description,
        date,
        structure
      );

      // Assert
      expect(workout.id).toBe(id);
      expect(workout.name).toBe(name);
      expect(workout.description).toBe(description);
      expect(workout.date).toBe(date);
      expect(workout.duration).toBe(expectedDuration);
      expect(workout.structure).toBe(structure);
      expect(workout.distance).toBeUndefined();
      expect(workout.fileContent).toBeUndefined();
      expect(workout.fileName).toBeUndefined();
    });

    it('should create a structured workout with optional fields', () => {
      // Arrange
      const structure = StructuredWorkoutDataFixture.withIntervals().structure;
      const activityType = 'run';
      const tags = ['interval', 'high-intensity'];
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      // Act
      const workout = createStructuredWorkout(
        faker.string.uuid(),
        'Interval Session',
        'High intensity intervals',
        new Date(),
        structure,
        activityType,
        tags,
        createdAt,
        updatedAt
      );

      // Assert
      expect(workout.activityType).toBe(activityType);
      expect(workout.tags).toEqual(tags);
      expect(workout.createdAt).toBe(createdAt);
      expect(workout.updatedAt).toBe(updatedAt);
    });
  });

  describe('validation', () => {
    describe('id validation', () => {
      it('should throw error for empty id', () => {
        expect(() => {
          createWorkout('', 'Test', 'Description', new Date(), 3600);
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout('', 'Test', 'Description', new Date(), 3600);
        }).toThrow('Workout ID cannot be empty');
      });

      it('should throw error for whitespace-only id', () => {
        expect(() => {
          createWorkout('   ', 'Test', 'Description', new Date(), 3600);
        }).toThrow(ValidationError);
      });
    });

    describe('name validation', () => {
      it('should throw error for empty name', () => {
        expect(() => {
          createWorkout('id', '', 'Description', new Date(), 3600);
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout('id', '', 'Description', new Date(), 3600);
        }).toThrow('Workout name cannot be empty');
      });

      it('should throw error for whitespace-only name', () => {
        expect(() => {
          createWorkout('id', '   ', 'Description', new Date(), 3600);
        }).toThrow(ValidationError);
      });

      it('should throw error for name exceeding 255 characters', () => {
        const longName = 'a'.repeat(256);
        expect(() => {
          createWorkout('id', longName, 'Description', new Date(), 3600);
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout('id', longName, 'Description', new Date(), 3600);
        }).toThrow('Workout name cannot exceed 255 characters');
      });

      it('should accept name with exactly 255 characters', () => {
        const maxName = 'a'.repeat(255);
        expect(() => {
          createWorkout('id', maxName, 'Description', new Date(), 3600);
        }).not.toThrow();
      });
    });

    describe('date validation', () => {
      it('should throw error for invalid date', () => {
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date('invalid'), 3600);
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date('invalid'), 3600);
        }).toThrow('Workout date must be a valid date');
      });
    });

    describe('duration validation', () => {
      it('should throw error for negative duration', () => {
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date(), -1);
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date(), -1);
        }).toThrow('Workout duration cannot be negative');
      });

      it('should throw error for duration exceeding 24 hours', () => {
        const duration = 86401; // 24 hours + 1 second
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date(), duration);
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date(), duration);
        }).toThrow('Workout duration cannot exceed 24 hours');
      });

      it('should accept duration of exactly 24 hours', () => {
        const duration = 86400; // Exactly 24 hours
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date(), duration);
        }).not.toThrow();
      });

      it('should accept zero duration', () => {
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date(), 0);
        }).not.toThrow();
      });
    });

    describe('distance validation', () => {
      it('should throw error for negative distance', () => {
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date(), 3600, -1);
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout('id', 'Test', 'Description', new Date(), 3600, -1);
        }).toThrow('Workout distance cannot be negative');
      });

      it('should throw error for distance exceeding 1000km', () => {
        const distance = 1000001; // 1000km + 1m
        expect(() => {
          createWorkout(
            'id',
            'Test',
            'Description',
            new Date(),
            3600,
            distance
          );
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout(
            'id',
            'Test',
            'Description',
            new Date(),
            3600,
            distance
          );
        }).toThrow('Workout distance cannot exceed 1000km');
      });

      it('should accept distance of exactly 1000km', () => {
        const distance = 1000000; // Exactly 1000km
        expect(() => {
          createWorkout(
            'id',
            'Test',
            'Description',
            new Date(),
            3600,
            distance
          );
        }).not.toThrow();
      });

      it('should accept undefined distance', () => {
        expect(() => {
          createWorkout(
            'id',
            'Test',
            'Description',
            new Date(),
            3600,
            undefined
          );
        }).not.toThrow();
      });
    });

    describe('structure validation', () => {
      it('should throw error when duration does not match structure duration', () => {
        // Arrange
        const structure = StructuredWorkoutDataFixture.default().structure;
        const structureDuration = structure.getTotalDuration();
        const wrongDuration = structureDuration + 100; // Different duration

        // Act & Assert
        expect(() => {
          createWorkout(
            'id',
            'Test',
            'Description',
            new Date(),
            wrongDuration,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            structure
          );
        }).toThrow(ValidationError);
        expect(() => {
          createWorkout(
            'id',
            'Test',
            'Description',
            new Date(),
            wrongDuration,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            structure
          );
        }).toThrow(
          `Workout duration (${wrongDuration}s) doesn't match structure duration (${structureDuration}s)`
        );
      });

      it('should not throw error when duration matches structure duration', () => {
        // Arrange
        const structure = StructuredWorkoutDataFixture.default().structure;
        const structureDuration = structure.getTotalDuration();

        // Act & Assert
        expect(() => {
          createWorkout(
            'id',
            'Test',
            'Description',
            new Date(),
            structureDuration,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            structure
          );
        }).not.toThrow();
      });
    });
  });

  describe('factory method edge cases', () => {
    it('should handle file extension edge cases', () => {
      // Arrange
      const testCases = [
        { fileName: 'workout', expectedName: 'workout' }, // No extension
        { fileName: 'workout.', expectedName: 'workout.' }, // Ending with dot (regex doesn't match)
      ];

      testCases.forEach(({ fileName, expectedName }) => {
        // Act
        const workout = createWorkoutFromFile(
          faker.string.uuid(),
          fileName,
          'content'
        );

        // Assert
        expect(workout.name).toBe(expectedName);
      });

      // Special case: only extension should result in empty name, but we need to provide a name
      // Act
      const workoutWithOnlyExtension = createWorkoutFromFile(
        faker.string.uuid(),
        '.tcx',
        'content',
        { name: 'Workout' } // Provide a name to avoid validation error
      );

      // Assert
      expect(workoutWithOnlyExtension.name).toBe('Workout');
    });

    it('should handle random workout creation with various combinations', () => {
      // Act
      const workouts = Array.from({ length: 10 }, () =>
        WorkoutFixture.random()
      );

      // Assert
      workouts.forEach((workout) => {
        expect(workout.id).toBeDefined();
        expect(workout.name).toBeDefined();
        expect(workout.description).toBeDefined();
        expect(workout.date).toBeInstanceOf(Date);
        expect(workout.duration).toBeGreaterThanOrEqual(0);
        expect(workout.createdAt).toBeInstanceOf(Date);
        expect(workout.updatedAt).toBeInstanceOf(Date);
      });
    });
  });
});
