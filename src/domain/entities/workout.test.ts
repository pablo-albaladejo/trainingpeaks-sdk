/**
 * Workout Entity Tests
 * Tests for the Workout domain entity following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { Workout } from './workout';
import { WorkoutValidationError } from '@/domain/errors/workout-errors';
import { WorkoutFixture } from '../../__fixtures__/workout-entity.fixture';
import { StructuredWorkoutDataFixture } from '../../__fixtures__/structured-workout-data.fixture';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';

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
      const workout = Workout.create(id, name, description, date, duration);

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
      expect(workout.createdAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(workout.createdAt!.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(workout.updatedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
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
      const fileContent = '<TrainingCenterDatabase>...</TrainingCenterDatabase>';

      // Act
      const workout = Workout.fromFile(id, fileName, fileContent);

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
      const workout = Workout.fromFile(id, fileName, fileContent, metadata);

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
        { fileName: 'complex.file.name.tcx', expectedName: 'complex.file.name' },
      ];

      testCases.forEach(({ fileName, expectedName }) => {
        // Act
        const workout = Workout.fromFile(
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
      const workout = Workout.createStructured(
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
      const workout = Workout.createStructured(
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
          Workout.create('', 'Test', 'Description', new Date(), 3600);
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create('', 'Test', 'Description', new Date(), 3600);
        }).toThrow('Workout ID cannot be empty');
      });

      it('should throw error for whitespace-only id', () => {
        expect(() => {
          Workout.create('   ', 'Test', 'Description', new Date(), 3600);
        }).toThrow(WorkoutValidationError);
      });
    });

    describe('name validation', () => {
      it('should throw error for empty name', () => {
        expect(() => {
          Workout.create('id', '', 'Description', new Date(), 3600);
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create('id', '', 'Description', new Date(), 3600);
        }).toThrow('Workout name cannot be empty');
      });

      it('should throw error for whitespace-only name', () => {
        expect(() => {
          Workout.create('id', '   ', 'Description', new Date(), 3600);
        }).toThrow(WorkoutValidationError);
      });

      it('should throw error for name exceeding 255 characters', () => {
        const longName = 'a'.repeat(256);
        expect(() => {
          Workout.create('id', longName, 'Description', new Date(), 3600);
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create('id', longName, 'Description', new Date(), 3600);
        }).toThrow('Workout name cannot exceed 255 characters');
      });

      it('should accept name with exactly 255 characters', () => {
        const maxName = 'a'.repeat(255);
        expect(() => {
          Workout.create('id', maxName, 'Description', new Date(), 3600);
        }).not.toThrow();
      });
    });

    describe('date validation', () => {
      it('should throw error for invalid date', () => {
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date('invalid'), 3600);
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date('invalid'), 3600);
        }).toThrow('Workout date must be a valid date');
      });
    });

    describe('duration validation', () => {
      it('should throw error for negative duration', () => {
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), -1);
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), -1);
        }).toThrow('Workout duration cannot be negative');
      });

      it('should throw error for duration exceeding 24 hours', () => {
        const duration = 86401; // 24 hours + 1 second
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), duration);
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), duration);
        }).toThrow('Workout duration cannot exceed 24 hours');
      });

      it('should accept duration of exactly 24 hours', () => {
        const duration = 86400; // Exactly 24 hours
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), duration);
        }).not.toThrow();
      });

      it('should accept zero duration', () => {
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), 0);
        }).not.toThrow();
      });
    });

    describe('distance validation', () => {
      it('should throw error for negative distance', () => {
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), 3600, -1);
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), 3600, -1);
        }).toThrow('Workout distance cannot be negative');
      });

      it('should throw error for distance exceeding 1000km', () => {
        const distance = 1000001; // 1000km + 1m
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), 3600, distance);
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), 3600, distance);
        }).toThrow('Workout distance cannot exceed 1000km');
      });

      it('should accept distance of exactly 1000km', () => {
        const distance = 1000000; // Exactly 1000km
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), 3600, distance);
        }).not.toThrow();
      });

      it('should accept undefined distance', () => {
        expect(() => {
          Workout.create('id', 'Test', 'Description', new Date(), 3600, undefined);
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
          Workout.create(
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
        }).toThrow(WorkoutValidationError);
        expect(() => {
          Workout.create(
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
        }).toThrow(`Workout duration (${wrongDuration}s) doesn't match structure duration (${structureDuration}s)`);
      });

      it('should not throw error when duration matches structure duration', () => {
        // Arrange
        const structure = StructuredWorkoutDataFixture.default().structure;
        const structureDuration = structure.getTotalDuration();

        // Act & Assert
        expect(() => {
          Workout.create(
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

  describe('business logic methods', () => {
    describe('hasFile', () => {
      it('should return true when both fileContent and fileName are present', () => {
        // Arrange
        const workout = WorkoutFixture.fileBasedWorkout();

        // Act & Assert
        expect(workout.hasFile()).toBe(true);
      });

      it('should return false when fileContent is missing', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withFileName('workout.tcx')
          .build();

        // Act & Assert
        expect(workout.hasFile()).toBe(false);
      });

      it('should return false when fileName is missing', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withFileContent('<tcx>...</tcx>')
          .build();

        // Act & Assert
        expect(workout.hasFile()).toBe(false);
      });

      it('should return false when both are missing', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.hasFile()).toBe(false);
      });
    });

    describe('hasStructure', () => {
      it('should return true when structure is present', () => {
        // Arrange
        const workout = WorkoutFixture.structuredWorkout();

        // Act & Assert
        expect(workout.hasStructure()).toBe(true);
      });

      it('should return false when structure is not present', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.hasStructure()).toBe(false);
      });
    });

    describe('isStructured', () => {
      it('should return true when workout has structure', () => {
        // Arrange
        const workout = WorkoutFixture.structuredWorkout();

        // Act & Assert
        expect(workout.isStructured()).toBe(true);
      });

      it('should return false when workout has no structure', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.isStructured()).toBe(false);
      });
    });

    describe('isFileBasedWorkout', () => {
      it('should return true for file-based workout without structure', () => {
        // Arrange
        const workout = WorkoutFixture.fileBasedWorkout();

        // Act & Assert
        expect(workout.isFileBasedWorkout()).toBe(true);
      });

      it('should return false for structured workout with file', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withFileContent('<tcx>...</tcx>')
          .withFileName('workout.tcx')
          .withDefaultStructure()
          .build();

        // Act & Assert
        expect(workout.isFileBasedWorkout()).toBe(false);
      });

      it('should return false for workout without file', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.isFileBasedWorkout()).toBe(false);
      });
    });

    describe('isRecent', () => {
      it('should return true for workout within last 24 hours', () => {
        // Arrange
        const workout = WorkoutFixture.recentWorkout();

        // Act & Assert
        expect(workout.isRecent()).toBe(true);
      });

      it('should return false for workout older than 24 hours', () => {
        // Arrange
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const workout = new WorkoutFixture()
          .withDate(twoDaysAgo)
          .build();

        // Act & Assert
        expect(workout.isRecent()).toBe(false);
      });

      it('should return true for future workout', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withFutureDate()
          .build();

        // Act & Assert
        expect(workout.isRecent()).toBe(true);
      });
    });

    describe('isLongWorkout', () => {
      it('should return true for workout longer than 2 hours', () => {
        // Arrange
        const workout = WorkoutFixture.longWorkout();

        // Act & Assert
        expect(workout.isLongWorkout()).toBe(true);
      });

      it('should return false for workout of exactly 2 hours', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withDuration(7200) // Exactly 2 hours
          .build();

        // Act & Assert
        expect(workout.isLongWorkout()).toBe(false);
      });

      it('should return false for short workout', () => {
        // Arrange
        const workout = WorkoutFixture.shortWorkout();

        // Act & Assert
        expect(workout.isLongWorkout()).toBe(false);
      });
    });

    describe('isShortWorkout', () => {
      it('should return true for workout shorter than 30 minutes', () => {
        // Arrange
        const workout = WorkoutFixture.shortWorkout();

        // Act & Assert
        expect(workout.isShortWorkout()).toBe(true);
      });

      it('should return false for workout of exactly 30 minutes', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withDuration(1800) // Exactly 30 minutes
          .build();

        // Act & Assert
        expect(workout.isShortWorkout()).toBe(false);
      });

      it('should return false for long workout', () => {
        // Arrange
        const workout = WorkoutFixture.longWorkout();

        // Act & Assert
        expect(workout.isShortWorkout()).toBe(false);
      });
    });
  });

  describe('formatting methods', () => {
    describe('getFormattedDuration', () => {
      it('should format duration with hours, minutes, and seconds', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withDuration(3665) // 1h 1m 5s
          .build();

        // Act & Assert
        expect(workout.getFormattedDuration()).toBe('1h 1m 5s');
      });

      it('should format duration with minutes and seconds only', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withDuration(125) // 2m 5s
          .build();

        // Act & Assert
        expect(workout.getFormattedDuration()).toBe('2m 5s');
      });

      it('should format duration with seconds only', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withDuration(45) // 45s
          .build();

        // Act & Assert
        expect(workout.getFormattedDuration()).toBe('45s');
      });

      it('should handle zero duration', () => {
        // Arrange
        const workout = Workout.create(
          'id', 
          'Test', 
          'Description', 
          new Date(), 
          0
        );

        // Act & Assert
        expect(workout.getFormattedDuration()).toBe('0s');
      });
    });

    describe('getFormattedDistance', () => {
      it('should format distance in kilometers for distances >= 1000m', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withDistance(5500) // 5.5km
          .build();

        // Act & Assert
        expect(workout.getFormattedDistance()).toBe('5.50km');
      });

      it('should format distance in meters for distances < 1000m', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withDistance(750)
          .build();

        // Act & Assert
        expect(workout.getFormattedDistance()).toBe('750m');
      });

      it('should format exactly 1000m as 1.00km', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withDistance(1000)
          .build();

        // Act & Assert
        expect(workout.getFormattedDistance()).toBe('1.00km');
      });

      it('should return undefined when distance is not set', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.getFormattedDistance()).toBeUndefined();
      });
    });

    describe('getWorkoutType', () => {
      it('should return "structured" for structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.structuredWorkout();

        // Act & Assert
        expect(workout.getWorkoutType()).toBe('structured');
      });

      it('should return "file-based" for file-based workout', () => {
        // Arrange
        const workout = WorkoutFixture.fileBasedWorkout();

        // Act & Assert
        expect(workout.getWorkoutType()).toBe('file-based');
      });

      it('should return "simple" for simple workout', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.getWorkoutType()).toBe('simple');
      });

      it('should return "structured" when both structure and file are present', () => {
        // Arrange
        const workout = new WorkoutFixture()
          .withFileContent('<tcx>...</tcx>')
          .withFileName('workout.tcx')
          .withDefaultStructure()
          .build();

        // Act & Assert
        expect(workout.getWorkoutType()).toBe('structured');
      });
    });
  });

  describe('structure-related methods', () => {
    describe('getStructureStepsCount', () => {
      it('should return correct steps count for structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.structuredWorkout();

        // Act
        const stepsCount = workout.getStructureStepsCount();

        // Assert
        expect(stepsCount).toBeGreaterThan(0);
        expect(typeof stepsCount).toBe('number');
      });

      it('should return 0 for non-structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.getStructureStepsCount()).toBe(0);
      });
    });

    describe('getStructureActiveStepsCount', () => {
      it('should return correct active steps count for structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.structuredWorkout();

        // Act
        const activeStepsCount = workout.getStructureActiveStepsCount();

        // Assert
        expect(typeof activeStepsCount).toBe('number');
        expect(activeStepsCount).toBeGreaterThanOrEqual(0);
      });

      it('should return 0 for non-structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.getStructureActiveStepsCount()).toBe(0);
      });
    });

    describe('getStructureRepetitionsCount', () => {
      it('should return correct repetitions count for interval workout', () => {
        // Arrange
        const workout = WorkoutFixture.intervalWorkout();

        // Act
        const repetitionsCount = workout.getStructureRepetitionsCount();

        // Assert
        expect(typeof repetitionsCount).toBe('number');
        expect(repetitionsCount).toBeGreaterThanOrEqual(0);
      });

      it('should return 0 for non-structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.getStructureRepetitionsCount()).toBe(0);
      });
    });

    describe('isTimeBased', () => {
      it('should return correct time-based status for structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.structuredWorkout();

        // Act
        const isTimeBased = workout.isTimeBased();

        // Assert
        expect(typeof isTimeBased).toBe('boolean');
      });

      it('should return false for non-structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.isTimeBased()).toBe(false);
      });
    });

    describe('isDistanceBased', () => {
      it('should return correct distance-based status for structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.structuredWorkout();

        // Act
        const isDistanceBased = workout.isDistanceBased();

        // Assert
        expect(typeof isDistanceBased).toBe('boolean');
      });

      it('should return false for non-structured workout', () => {
        // Arrange
        const workout = WorkoutFixture.default();

        // Act & Assert
        expect(workout.isDistanceBased()).toBe(false);
      });
    });
  });

  describe('equality and mutation methods', () => {
    describe('equals', () => {
      it('should return true for workouts with same id', () => {
        // Arrange
        const id = faker.string.uuid();
        const workout1 = new WorkoutFixture().withId(id).build();
        const workout2 = new WorkoutFixture().withId(id).build();

        // Act & Assert
        expect(workout1.equals(workout2)).toBe(true);
      });

      it('should return false for workouts with different ids', () => {
        // Arrange
        const workout1 = WorkoutFixture.default();
        const workout2 = WorkoutFixture.default();

        // Act & Assert
        expect(workout1.equals(workout2)).toBe(false);
      });
    });

    describe('withUpdatedMetadata', () => {
      it('should return new workout with updated metadata', async () => {
        // Arrange
        const originalWorkout = WorkoutFixture.default();
        const updates = {
          name: 'Updated Name',
          description: 'Updated Description',
          activityType: 'bike',
          tags: ['updated', 'tags'],
        };

        // Wait a millisecond to ensure time difference
        await new Promise(resolve => setTimeout(resolve, 1));

        // Act
        const updatedWorkout = originalWorkout.withUpdatedMetadata(updates);

        // Assert
        expect(updatedWorkout).not.toBe(originalWorkout);
        expect(updatedWorkout.id).toBe(originalWorkout.id);
        expect(updatedWorkout.name).toBe('Updated Name');
        expect(updatedWorkout.description).toBe('Updated Description');
        expect(updatedWorkout.activityType).toBe('bike');
        expect(updatedWorkout.tags).toEqual(['updated', 'tags']);
        expect(updatedWorkout.updatedAt!.getTime()).toBeGreaterThanOrEqual(
          originalWorkout.updatedAt!.getTime()
        );
      });

      it('should preserve original values for non-updated fields', () => {
        // Arrange
        const originalWorkout = WorkoutFixture.default();
        const updates = { name: 'Updated Name' };

        // Act
        const updatedWorkout = originalWorkout.withUpdatedMetadata(updates);

        // Assert
        expect(updatedWorkout.description).toBe(originalWorkout.description);
        expect(updatedWorkout.activityType).toBe(originalWorkout.activityType);
        expect(updatedWorkout.tags).toBe(originalWorkout.tags);
        expect(updatedWorkout.duration).toBe(originalWorkout.duration);
      });
    });

    describe('withStructure', () => {
      it('should return new workout with structure and updated duration', async () => {
        // Arrange
        const originalWorkout = WorkoutFixture.default();
        const structure = StructuredWorkoutDataFixture.default().structure;
        const expectedDuration = structure.getTotalDuration();

        // Wait a millisecond to ensure time difference
        await new Promise(resolve => setTimeout(resolve, 1));

        // Act
        const structuredWorkout = originalWorkout.withStructure(structure);

        // Assert
        expect(structuredWorkout).not.toBe(originalWorkout);
        expect(structuredWorkout.id).toBe(originalWorkout.id);
        expect(structuredWorkout.structure).toBe(structure);
        expect(structuredWorkout.duration).toBe(expectedDuration);
        expect(structuredWorkout.updatedAt!.getTime()).toBeGreaterThanOrEqual(
          originalWorkout.updatedAt!.getTime()
        );
      });
    });

    describe('withoutStructure', () => {
      it('should return new workout without structure', async () => {
        // Arrange
        const originalWorkout = WorkoutFixture.structuredWorkout();

        // Wait a millisecond to ensure time difference
        await new Promise(resolve => setTimeout(resolve, 1));

        // Act
        const simpleWorkout = originalWorkout.withoutStructure();

        // Assert
        expect(simpleWorkout).not.toBe(originalWorkout);
        expect(simpleWorkout.id).toBe(originalWorkout.id);
        expect(simpleWorkout.structure).toBeUndefined();
        expect(simpleWorkout.updatedAt!.getTime()).toBeGreaterThanOrEqual(
          originalWorkout.updatedAt!.getTime()
        );
      });

      it('should preserve other workout properties', () => {
        // Arrange
        const originalWorkout = WorkoutFixture.structuredWorkout();

        // Act
        const simpleWorkout = originalWorkout.withoutStructure();

        // Assert
        expect(simpleWorkout.name).toBe(originalWorkout.name);
        expect(simpleWorkout.description).toBe(originalWorkout.description);
        expect(simpleWorkout.duration).toBe(originalWorkout.duration);
        expect(simpleWorkout.activityType).toBe(originalWorkout.activityType);
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
        const workout = Workout.fromFile(
          faker.string.uuid(),
          fileName,
          'content'
        );

        // Assert
        expect(workout.name).toBe(expectedName);
      });

      // Special case: only extension should result in empty name, but we need to provide a name
      // Act
      const workoutWithOnlyExtension = Workout.fromFile(
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
      const workouts = Array.from({ length: 10 }, () => WorkoutFixture.random());

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