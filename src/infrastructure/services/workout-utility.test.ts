/**
 * Workout Utility Service Tests
 * Tests for workout utility functions
 */

import type {
  SimpleWorkoutElement,
  WorkoutType,
} from '@/application/services/workout-utility';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildStructureFromSimpleElements,
  generateWorkoutId,
  getMimeTypeFromFileName,
  mapWorkoutTypeToActivityType,
} from './workout-utility';

describe('Workout Utility Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateWorkoutId', () => {
    it('should generate a unique workout ID', () => {
      // Act
      const id1 = generateWorkoutId();
      const id2 = generateWorkoutId();

      // Assert
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^workout_\d+_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^workout_\d+_\d+_[a-z0-9]{9}$/);
    });

    it('should start with workout prefix', () => {
      // Act
      const id = generateWorkoutId();

      // Assert
      expect(id).toMatch(/^workout_/);
    });

    it('should include timestamp and random component', () => {
      // Arrange
      const mockDate = 1234567890123;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);
      vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

      // Act
      const id = generateWorkoutId();

      // Assert
      expect(id).toContain('1234567890123');
      expect(Date.now).toHaveBeenCalled();
      expect(Math.random).toHaveBeenCalled();
    });

    it('should generate different IDs when called multiple times', () => {
      // Act
      const ids = Array.from({ length: 10 }, () => generateWorkoutId());
      const uniqueIds = new Set(ids);

      // Assert
      expect(uniqueIds.size).toBe(10);
    });
  });

  describe('getMimeTypeFromFileName', () => {
    it('should return correct MIME type for TCX files', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('workout.tcx')).toBe(
        'application/tcx+xml'
      );
      expect(getMimeTypeFromFileName('WORKOUT.TCX')).toBe(
        'application/tcx+xml'
      );
      expect(getMimeTypeFromFileName('complex.workout.tcx')).toBe(
        'application/tcx+xml'
      );
    });

    it('should return correct MIME type for GPX files', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('workout.gpx')).toBe(
        'application/gpx+xml'
      );
      expect(getMimeTypeFromFileName('WORKOUT.GPX')).toBe(
        'application/gpx+xml'
      );
      expect(getMimeTypeFromFileName('track.gpx')).toBe('application/gpx+xml');
    });

    it('should return correct MIME type for FIT files', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('workout.fit')).toBe('application/fit');
      expect(getMimeTypeFromFileName('WORKOUT.FIT')).toBe('application/fit');
      expect(getMimeTypeFromFileName('activity.fit')).toBe('application/fit');
    });

    it('should return correct MIME type for JSON files', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('workout.json')).toBe('application/json');
      expect(getMimeTypeFromFileName('data.json')).toBe('application/json');
    });

    it('should return correct MIME type for XML files', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('workout.xml')).toBe('application/xml');
      expect(getMimeTypeFromFileName('data.xml')).toBe('application/xml');
    });

    it('should return default MIME type for unknown extensions', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('workout.unknown')).toBe(
        'application/octet-stream'
      );
      expect(getMimeTypeFromFileName('workout.txt')).toBe(
        'application/octet-stream'
      );
      expect(getMimeTypeFromFileName('workout.pdf')).toBe(
        'application/octet-stream'
      );
    });

    it('should handle files without extensions', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('workout')).toBe(
        'application/octet-stream'
      );
      expect(getMimeTypeFromFileName('')).toBe('application/octet-stream');
    });

    it('should handle files with multiple dots', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('my.workout.data.tcx')).toBe(
        'application/tcx+xml'
      );
      expect(getMimeTypeFromFileName('test.backup.gpx')).toBe(
        'application/gpx+xml'
      );
    });

    it('should handle case insensitive extensions', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('workout.TCX')).toBe(
        'application/tcx+xml'
      );
      expect(getMimeTypeFromFileName('workout.Gpx')).toBe(
        'application/gpx+xml'
      );
      expect(getMimeTypeFromFileName('workout.FIT')).toBe('application/fit');
      expect(getMimeTypeFromFileName('workout.JSON')).toBe('application/json');
      expect(getMimeTypeFromFileName('workout.XML')).toBe('application/xml');
    });

    it('should handle edge cases', () => {
      // Act & Assert
      expect(getMimeTypeFromFileName('.')).toBe('application/octet-stream');
      expect(getMimeTypeFromFileName('.tcx')).toBe('application/tcx+xml');
      expect(getMimeTypeFromFileName('..tcx')).toBe('application/tcx+xml');
    });
  });

  describe('mapWorkoutTypeToActivityType', () => {
    it('should map structured workout type to run', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('structured' as WorkoutType)).toBe(
        'run'
      );
      expect(mapWorkoutTypeToActivityType('STRUCTURED' as WorkoutType)).toBe(
        'run'
      );
    });

    it('should map file workout type to bike', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('file' as WorkoutType)).toBe('bike');
      expect(mapWorkoutTypeToActivityType('FILE' as WorkoutType)).toBe('bike');
    });

    it('should map manual workout type to other', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('manual' as WorkoutType)).toBe(
        'other'
      );
      expect(mapWorkoutTypeToActivityType('MANUAL' as WorkoutType)).toBe(
        'other'
      );
    });

    it('should map running workout type to run', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('running' as WorkoutType)).toBe(
        'run'
      );
      expect(mapWorkoutTypeToActivityType('RUNNING' as WorkoutType)).toBe(
        'run'
      );
    });

    it('should map cycling workout type to bike', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('cycling' as WorkoutType)).toBe(
        'bike'
      );
      expect(mapWorkoutTypeToActivityType('CYCLING' as WorkoutType)).toBe(
        'bike'
      );
    });

    it('should map swimming workout type to swim', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('swimming' as WorkoutType)).toBe(
        'swim'
      );
      expect(mapWorkoutTypeToActivityType('SWIMMING' as WorkoutType)).toBe(
        'swim'
      );
    });

    it('should map strength workout type to strength', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('strength' as WorkoutType)).toBe(
        'strength'
      );
      expect(mapWorkoutTypeToActivityType('STRENGTH' as WorkoutType)).toBe(
        'strength'
      );
    });

    it('should map unknown workout types to other', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('unknown' as WorkoutType)).toBe(
        'other'
      );
      expect(mapWorkoutTypeToActivityType('invalid' as WorkoutType)).toBe(
        'other'
      );
      expect(mapWorkoutTypeToActivityType('' as WorkoutType)).toBe('other');
      expect(mapWorkoutTypeToActivityType('yoga' as WorkoutType)).toBe('other');
    });

    it('should handle mixed case workout types', () => {
      // Act & Assert
      expect(mapWorkoutTypeToActivityType('Structured' as WorkoutType)).toBe(
        'run'
      );
      expect(mapWorkoutTypeToActivityType('File' as WorkoutType)).toBe('bike');
      expect(mapWorkoutTypeToActivityType('Manual' as WorkoutType)).toBe(
        'other'
      );
      expect(mapWorkoutTypeToActivityType('Running' as WorkoutType)).toBe(
        'run'
      );
      expect(mapWorkoutTypeToActivityType('Cycling' as WorkoutType)).toBe(
        'bike'
      );
      expect(mapWorkoutTypeToActivityType('Swimming' as WorkoutType)).toBe(
        'swim'
      );
      expect(mapWorkoutTypeToActivityType('Strength' as WorkoutType)).toBe(
        'strength'
      );
    });
  });

  describe('buildStructureFromSimpleElements', () => {
    it('should build structure from simple elements', () => {
      // Arrange
      const elements: SimpleWorkoutElement[] = [
        {
          type: 'warmup',
          duration: 600, // 10 minutes
          intensity: 'easy',
          description: 'Easy warm-up',
        },
        {
          type: 'interval',
          duration: 300, // 5 minutes
          intensity: 'hard',
          description: 'High intensity interval',
        },
        {
          type: 'cooldown',
          duration: 300, // 5 minutes
          intensity: 'easy',
          description: 'Cool down',
        },
      ];

      // Act
      const result = buildStructureFromSimpleElements(elements);

      // Assert
      expect(result.elements).toHaveLength(3);
      expect(result.totalDuration).toBe(1200); // 20 minutes total
      expect(result.totalSteps).toBe(3);

      // Check first element
      expect(result.elements[0]).toEqual({
        type: 'warmup',
        duration: 600,
        intensity: 'easy',
        description: 'Easy warm-up',
        begin: 0,
        end: 600,
      });

      // Check second element
      expect(result.elements[1]).toEqual({
        type: 'interval',
        duration: 300,
        intensity: 'hard',
        description: 'High intensity interval',
        begin: 600,
        end: 900,
      });

      // Check third element
      expect(result.elements[2]).toEqual({
        type: 'cooldown',
        duration: 300,
        intensity: 'easy',
        description: 'Cool down',
        begin: 900,
        end: 1200,
      });
    });

    it('should handle single element', () => {
      // Arrange
      const elements: SimpleWorkoutElement[] = [
        {
          type: 'main',
          duration: 1800, // 30 minutes
          intensity: 'moderate',
          description: 'Steady workout',
        },
      ];

      // Act
      const result = buildStructureFromSimpleElements(elements);

      // Assert
      expect(result.elements).toHaveLength(1);
      expect(result.totalDuration).toBe(1800);
      expect(result.totalSteps).toBe(1);
      expect(result.elements[0]).toEqual({
        type: 'main',
        duration: 1800,
        intensity: 'moderate',
        description: 'Steady workout',
        begin: 0,
        end: 1800,
      });
    });

    it('should handle empty elements array', () => {
      // Arrange
      const elements: SimpleWorkoutElement[] = [];

      // Act
      const result = buildStructureFromSimpleElements(elements);

      // Assert
      expect(result.elements).toHaveLength(0);
      expect(result.totalDuration).toBe(0);
      expect(result.totalSteps).toBe(0);
    });

    it('should calculate correct begin and end times for multiple elements', () => {
      // Arrange
      const elements: SimpleWorkoutElement[] = [
        {
          type: 'phase1',
          duration: 100,
          intensity: 'low',
          description: 'Phase 1',
        },
        {
          type: 'phase2',
          duration: 200,
          intensity: 'medium',
          description: 'Phase 2',
        },
        {
          type: 'phase3',
          duration: 300,
          intensity: 'high',
          description: 'Phase 3',
        },
        {
          type: 'phase4',
          duration: 150,
          intensity: 'low',
          description: 'Phase 4',
        },
      ];

      // Act
      const result = buildStructureFromSimpleElements(elements);

      // Assert
      expect(result.totalDuration).toBe(750);
      expect(result.totalSteps).toBe(4);

      expect(result.elements[0].begin).toBe(0);
      expect(result.elements[0].end).toBe(100);

      expect(result.elements[1].begin).toBe(100);
      expect(result.elements[1].end).toBe(300);

      expect(result.elements[2].begin).toBe(300);
      expect(result.elements[2].end).toBe(600);

      expect(result.elements[3].begin).toBe(600);
      expect(result.elements[3].end).toBe(750);
    });

    it('should handle elements with zero duration', () => {
      // Arrange
      const elements: SimpleWorkoutElement[] = [
        {
          type: 'start',
          duration: 0,
          intensity: 'none',
          description: 'Start marker',
        },
        {
          type: 'main',
          duration: 1000,
          intensity: 'moderate',
          description: 'Main workout',
        },
        {
          type: 'end',
          duration: 0,
          intensity: 'none',
          description: 'End marker',
        },
      ];

      // Act
      const result = buildStructureFromSimpleElements(elements);

      // Assert
      expect(result.totalDuration).toBe(1000);
      expect(result.totalSteps).toBe(3);

      expect(result.elements[0].begin).toBe(0);
      expect(result.elements[0].end).toBe(0);

      expect(result.elements[1].begin).toBe(0);
      expect(result.elements[1].end).toBe(1000);

      expect(result.elements[2].begin).toBe(1000); // After the main workout
      expect(result.elements[2].end).toBe(1000); // Same as begin since duration is 0
    });

    it('should preserve element properties in the structure', () => {
      // Arrange
      const elements: SimpleWorkoutElement[] = [
        {
          type: 'custom-type',
          duration: 500,
          intensity: 'custom-intensity',
          description: 'Custom description with special chars: @#$%',
        },
      ];

      // Act
      const result = buildStructureFromSimpleElements(elements);

      // Assert
      expect(result.elements[0].type).toBe('custom-type');
      expect(result.elements[0].intensity).toBe('custom-intensity');
      expect(result.elements[0].description).toBe(
        'Custom description with special chars: @#$%'
      );
    });

    it('should handle large number of elements efficiently', () => {
      // Arrange
      const elements: SimpleWorkoutElement[] = Array.from(
        { length: 100 },
        (_, i) => ({
          type: `element-${i}`,
          duration: 60, // 1 minute each
          intensity: i % 2 === 0 ? 'easy' : 'hard',
          description: `Element ${i}`,
        })
      );

      // Act
      const result = buildStructureFromSimpleElements(elements);

      // Assert
      expect(result.elements).toHaveLength(100);
      expect(result.totalDuration).toBe(6000); // 100 minutes
      expect(result.totalSteps).toBe(100);

      // Check first and last elements
      expect(result.elements[0].begin).toBe(0);
      expect(result.elements[0].end).toBe(60);
      expect(result.elements[99].begin).toBe(99 * 60);
      expect(result.elements[99].end).toBe(100 * 60);
    });
  });

  describe('integration scenarios', () => {
    it('should work together to process workout data', () => {
      // Arrange
      const fileName = 'workout.tcx';
      const workoutType = 'cycling' as WorkoutType;
      const elements: SimpleWorkoutElement[] = [
        {
          type: 'warmup',
          duration: 300,
          intensity: 'easy',
          description: 'Warmup',
        },
        {
          type: 'main',
          duration: 1200,
          intensity: 'moderate',
          description: 'Main set',
        },
      ];

      // Act
      const workoutId = generateWorkoutId();
      const mimeType = getMimeTypeFromFileName(fileName);
      const activityType = mapWorkoutTypeToActivityType(workoutType);
      const structure = buildStructureFromSimpleElements(elements);

      // Assert
      expect(workoutId).toMatch(/^workout_\d+_\d+_[a-z0-9]{9}$/);
      expect(mimeType).toBe('application/tcx+xml');
      expect(activityType).toBe('bike');
      expect(structure.totalDuration).toBe(1500);
      expect(structure.totalSteps).toBe(2);
    });
  });
});
