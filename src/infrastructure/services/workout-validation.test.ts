/**
 * Workout Validation Service Tests
 * Comprehensive tests for all validation functions
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { structuredWorkoutRequestBuilder } from '../../__fixtures__/structured-workout-data.fixture';
import { workoutDataBuilder } from '../../__fixtures__/workout-data.fixture';
import {
  WorkoutFileProcessingError,
  WorkoutQuotaExceededError,
  WorkoutValidationError,
} from '../../domain/errors/workout-errors';
import { createWorkoutFile } from '../../infrastructure/services/domain-factories';
import {
  validateAthleteId,
  validateFileUpload,
  validateListWorkoutsFilters,
  validatePagination,
  validateStructuredWorkoutRequest,
  validateWorkoutCoachComments,
  validateWorkoutComments,
  validateWorkoutData,
  validateWorkoutDateRange,
  validateWorkoutDescription,
  validateWorkoutDistance,
  validateWorkoutDuration,
  validateWorkoutEquipment,
  validateWorkoutFile,
  validateWorkoutFileConstraints,
  validateWorkoutId,
  validateWorkoutMetadata,
  validateWorkoutName,
  validateWorkoutPlannedMetrics,
  validateWorkoutPublicSettings,
  validateWorkoutSearch,
  validateWorkoutStatsFilters,
  validateWorkoutSteps,
  validateWorkoutStructure,
  validateWorkoutTags,
  validateWorkoutTargets,
  validateWorkoutType,
  validateWorkoutUpdate,
  validateWorkoutUpload,
  validateWorkoutUserTags,
} from './workout-validation';

describe('Workout Validation Service', () => {
  beforeEach(() => {
    // Any setup needed
  });

  describe('validateWorkoutId', () => {
    it('should pass validation for valid workout ID', () => {
      expect(() => validateWorkoutId('workout-123')).not.toThrow();
      expect(() => validateWorkoutId('workout_123')).not.toThrow();
      expect(() => validateWorkoutId('123ABC')).not.toThrow();
    });

    it('should throw error for missing workout ID', () => {
      expect(() => validateWorkoutId('')).toThrow(WorkoutValidationError);
      expect(() => validateWorkoutId('   ')).toThrow(WorkoutValidationError);
      expect(() => validateWorkoutId(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutId(undefined as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-string workout ID', () => {
      expect(() => validateWorkoutId(123 as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutId({} as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutId([] as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for workout ID too long', () => {
      const longId = 'a'.repeat(101); // Exceeds max length
      expect(() => validateWorkoutId(longId)).toThrow(WorkoutValidationError);
    });

    it('should throw error for invalid characters', () => {
      expect(() => validateWorkoutId('workout@123')).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutId('workout 123')).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutId('workout#123')).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutFile', () => {
    it('should pass validation for valid workout file', () => {
      const file = createWorkoutFile(
        'test.tcx',
        '<tcx>...</tcx>',
        'application/tcx+xml'
      );
      expect(() => validateWorkoutFile(file)).not.toThrow();
    });

    it('should throw error for missing file', () => {
      expect(() => validateWorkoutFile(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutFile(undefined as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid file object', () => {
      expect(() => validateWorkoutFile('not-a-file' as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutFile(123 as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing fileName', () => {
      const invalidFile = {
        content: 'content',
        mimeType: 'application/tcx+xml',
      } as any;
      expect(() => validateWorkoutFile(invalidFile)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing content', () => {
      const invalidFile = {
        fileName: 'test.tcx',
        mimeType: 'application/tcx+xml',
      } as any;
      expect(() => validateWorkoutFile(invalidFile)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing mimeType', () => {
      const invalidFile = { fileName: 'test.tcx', content: 'content' } as any;
      expect(() => validateWorkoutFile(invalidFile)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for file too large', () => {
      // Create a mock file that would be too large without actually creating the content
      const mockLargeFile = {
        fileName: 'test.tcx',
        content: 'a'.repeat(51 * 1024 * 1024), // Just over 50MB limit
        mimeType: 'application/tcx+xml',
      } as any;
      expect(() => validateWorkoutFile(mockLargeFile)).toThrow(
        WorkoutFileProcessingError
      );
    });

    it('should throw error for invalid MIME type', () => {
      // Create a mock file with invalid MIME type without using WorkoutFile.create
      const mockInvalidFile = {
        fileName: 'test.txt',
        content: 'content',
        mimeType: 'text/plain',
      } as any;
      expect(() => validateWorkoutFile(mockInvalidFile)).toThrow(
        WorkoutFileProcessingError
      );
    });
  });

  describe('validateWorkoutData', () => {
    it('should pass validation for valid workout data', () => {
      const data = workoutDataBuilder.build();
      expect(() => validateWorkoutData(data)).not.toThrow();
    });

    it('should throw error for missing workout data', () => {
      expect(() => validateWorkoutData(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutData(undefined as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutData('not-object' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing name', () => {
      const data = { ...workoutDataBuilder.build(), name: '' };
      expect(() => validateWorkoutData(data)).toThrow(WorkoutValidationError);
    });

    it('should validate optional fields when present', () => {
      const data = {
        ...workoutDataBuilder.build(),
        description: 'a'.repeat(1001), // Too long
      };
      expect(() => validateWorkoutData(data)).toThrow(WorkoutValidationError);
    });
  });

  describe('validateListWorkoutsFilters', () => {
    it('should pass validation for undefined filters', () => {
      expect(() => validateListWorkoutsFilters()).not.toThrow();
      expect(() => validateListWorkoutsFilters(undefined)).not.toThrow();
    });

    it('should pass validation for valid filters', () => {
      const filters = {
        limit: 10,
        offset: 0,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };
      expect(() => validateListWorkoutsFilters(filters)).not.toThrow();
    });

    it('should throw error for non-object filters', () => {
      expect(() => validateListWorkoutsFilters('not-object' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid date objects', () => {
      expect(() =>
        validateListWorkoutsFilters({ startDate: 'not-date' as any })
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateListWorkoutsFilters({ endDate: 'not-date' as any })
      ).toThrow(WorkoutValidationError);
    });
  });

  describe('validateStructuredWorkoutRequest', () => {
    it('should pass validation for valid request', () => {
      const request = structuredWorkoutRequestBuilder.build();
      expect(() => validateStructuredWorkoutRequest(request)).not.toThrow();
    });

    it('should throw error for missing request', () => {
      expect(() => validateStructuredWorkoutRequest(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateStructuredWorkoutRequest(undefined as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing required fields', () => {
      const baseRequest = structuredWorkoutRequestBuilder.build();

      expect(() =>
        validateStructuredWorkoutRequest({ ...baseRequest, title: '' })
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateStructuredWorkoutRequest({
          ...baseRequest,
          athleteId: null as any,
        })
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateStructuredWorkoutRequest({
          ...baseRequest,
          workoutTypeValueId: null as any,
        })
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateStructuredWorkoutRequest({
          ...baseRequest,
          workoutDay: null as any,
        })
      ).toThrow(WorkoutValidationError);
    });
  });

  describe('validateWorkoutUpload', () => {
    it('should pass validation for workout without file', () => {
      const data = workoutDataBuilder.build();
      expect(() => validateWorkoutUpload(data)).not.toThrow();
    });

    it('should pass validation for workout with file', () => {
      const data = workoutDataBuilder.build();
      const file = createWorkoutFile(
        'test.tcx',
        '<tcx>...</tcx>',
        'application/tcx+xml'
      );
      expect(() => validateWorkoutUpload(data, file)).not.toThrow();
    });

    it('should throw error for invalid workout data', () => {
      expect(() => validateWorkoutUpload(null as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid file', () => {
      const data = workoutDataBuilder.build();
      const invalidFile = {
        fileName: 'test.txt',
        content: 'content',
        mimeType: 'text/plain',
      } as any;
      expect(() => validateWorkoutUpload(data, invalidFile)).toThrow(
        WorkoutFileProcessingError
      );
    });
  });

  describe('validateWorkoutSearch', () => {
    it('should pass validation for valid search query', () => {
      const query = {
        name: 'test',
        type: 'RUN',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        limit: 10,
        offset: 0,
      };
      expect(() => validateWorkoutSearch(query)).not.toThrow();
    });

    it('should throw error for non-object query', () => {
      expect(() => validateWorkoutSearch(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutSearch('not-object' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid name type', () => {
      expect(() => validateWorkoutSearch({ name: 123 as any })).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid workout type', () => {
      expect(() => validateWorkoutSearch({ type: 'INVALID' })).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutStatsFilters', () => {
    it('should pass validation for undefined filters', () => {
      expect(() => validateWorkoutStatsFilters()).not.toThrow();
      expect(() => validateWorkoutStatsFilters(undefined)).not.toThrow();
    });

    it('should pass validation for valid filters', () => {
      const filters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        workoutType: 'RUN',
      };
      expect(() => validateWorkoutStatsFilters(filters)).not.toThrow();
    });

    it('should throw error for non-object filters', () => {
      expect(() => validateWorkoutStatsFilters('not-object' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid workout type', () => {
      expect(() =>
        validateWorkoutStatsFilters({ workoutType: 'INVALID' })
      ).toThrow(WorkoutValidationError);
    });
  });

  describe('validateFileUpload', () => {
    it('should pass validation for valid file upload', () => {
      const buffer = Buffer.from('<tcx>...</tcx>');
      expect(() =>
        validateFileUpload('test.tcx', buffer, 'application/tcx+xml')
      ).not.toThrow();
    });

    it('should throw error for missing filename', () => {
      const buffer = Buffer.from('content');
      expect(() =>
        validateFileUpload('', buffer, 'application/tcx+xml')
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateFileUpload(null as any, buffer, 'application/tcx+xml')
      ).toThrow(WorkoutValidationError);
    });

    it('should throw error for invalid buffer', () => {
      expect(() =>
        validateFileUpload(
          'test.tcx',
          'not-buffer' as any,
          'application/tcx+xml'
        )
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateFileUpload('test.tcx', null as any, 'application/tcx+xml')
      ).toThrow(WorkoutValidationError);
    });

    it('should throw error for missing MIME type', () => {
      const buffer = Buffer.from('content');
      expect(() => validateFileUpload('test.tcx', buffer, '')).toThrow(
        WorkoutValidationError
      );
      expect(() => validateFileUpload('test.tcx', buffer, null as any)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutUpdate', () => {
    it('should pass validation for valid update', () => {
      const data = {
        name: 'Updated Workout',
        description: 'Updated description',
      };
      expect(() => validateWorkoutUpdate('workout-123', data)).not.toThrow();
    });

    it('should throw error for invalid workout ID', () => {
      expect(() => validateWorkoutUpdate('', {})).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-object data', () => {
      expect(() => validateWorkoutUpdate('workout-123', null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() =>
        validateWorkoutUpdate('workout-123', 'not-object' as any)
      ).toThrow(WorkoutValidationError);
    });

    it('should validate individual fields when provided', () => {
      expect(() => validateWorkoutUpdate('workout-123', { name: '' })).toThrow(
        WorkoutValidationError
      );
      expect(() =>
        validateWorkoutUpdate('workout-123', { duration: -1 })
      ).toThrow(WorkoutValidationError);
    });
  });

  describe('validateAthleteId', () => {
    it('should pass validation for valid athlete ID string', () => {
      expect(() => validateAthleteId('athlete-123')).not.toThrow();
      expect(() => validateAthleteId('123')).not.toThrow();
    });

    it('should pass validation for valid athlete ID number', () => {
      expect(() => validateAthleteId(123)).not.toThrow();
      expect(() => validateAthleteId(1)).not.toThrow();
    });

    it('should throw error for missing athlete ID', () => {
      expect(() => validateAthleteId('')).toThrow(WorkoutValidationError);
      expect(() => validateAthleteId(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateAthleteId(undefined as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for empty string athlete ID', () => {
      expect(() => validateAthleteId('   ')).toThrow(WorkoutValidationError);
    });

    it('should throw error for athlete ID string too long', () => {
      const longId = 'a'.repeat(51);
      expect(() => validateAthleteId(longId)).toThrow(WorkoutValidationError);
    });

    it('should throw error for zero or negative number athlete ID', () => {
      expect(() => validateAthleteId(0)).toThrow(WorkoutValidationError);
      expect(() => validateAthleteId(-1)).toThrow(WorkoutValidationError);
    });

    it('should throw error for invalid type athlete ID', () => {
      expect(() => validateAthleteId({} as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateAthleteId([] as any)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutType', () => {
    it('should pass validation for valid workout types', () => {
      ['RUN', 'BIKE', 'SWIM', 'WALK', 'OTHER'].forEach((type) => {
        expect(() => validateWorkoutType(type)).not.toThrow();
      });
    });

    it('should throw error for invalid workout type', () => {
      expect(() => validateWorkoutType('INVALID')).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutType('run')).toThrow(WorkoutValidationError); // Case sensitive
    });

    it('should throw error for missing workout type', () => {
      expect(() => validateWorkoutType('')).toThrow(WorkoutValidationError);
      expect(() => validateWorkoutType(null as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-string workout type', () => {
      expect(() => validateWorkoutType(123 as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for workout type too long', () => {
      const longType = 'a'.repeat(51);
      expect(() => validateWorkoutType(longType)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutDateRange', () => {
    it('should pass validation for valid date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      expect(() => validateWorkoutDateRange(startDate, endDate)).not.toThrow();
    });

    it('should throw error for invalid start date', () => {
      const endDate = new Date('2024-01-31');
      expect(() =>
        validateWorkoutDateRange(new Date('invalid') as any, endDate)
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateWorkoutDateRange('not-date' as any, endDate)
      ).toThrow(WorkoutValidationError);
    });

    it('should throw error for invalid end date', () => {
      const startDate = new Date('2024-01-01');
      expect(() =>
        validateWorkoutDateRange(startDate, new Date('invalid') as any)
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateWorkoutDateRange(startDate, 'not-date' as any)
      ).toThrow(WorkoutValidationError);
    });

    it('should throw error when start date is after end date', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');
      expect(() => validateWorkoutDateRange(startDate, endDate)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error when start date equals end date', () => {
      const date = new Date('2024-01-01');
      expect(() => validateWorkoutDateRange(date, date)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for date range too large', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-01-02'); // More than 365 days
      expect(() => validateWorkoutDateRange(startDate, endDate)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validatePagination', () => {
    it('should pass validation for valid pagination', () => {
      expect(() => validatePagination(10, 0)).not.toThrow();
      expect(() => validatePagination(100, 100)).not.toThrow();
      expect(() => validatePagination(undefined, undefined)).not.toThrow();
    });

    it('should throw error for invalid limit', () => {
      expect(() => validatePagination(0, 0)).toThrow(WorkoutValidationError);
      expect(() => validatePagination(-1, 0)).toThrow(WorkoutValidationError);
      expect(() => validatePagination('10' as any, 0)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for limit too large', () => {
      expect(() => validatePagination(1001, 0)).toThrow(WorkoutValidationError);
    });

    it('should throw error for invalid offset', () => {
      expect(() => validatePagination(10, -1)).toThrow(WorkoutValidationError);
      expect(() => validatePagination(10, '0' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for offset too large', () => {
      expect(() => validatePagination(10, 10001)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutMetadata', () => {
    it('should pass validation for valid metadata', () => {
      const metadata = { key1: 'value1', key2: 123, key3: true };
      expect(() => validateWorkoutMetadata(metadata)).not.toThrow();
    });

    it('should throw error for non-object metadata', () => {
      expect(() => validateWorkoutMetadata(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutMetadata('not-object' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for too many keys', () => {
      const metadata = {};
      for (let i = 0; i < 51; i++) {
        (metadata as any)[`key${i}`] = `value${i}`;
      }
      expect(() => validateWorkoutMetadata(metadata)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for key too long', () => {
      const longKey = 'a'.repeat(51);
      const metadata = { [longKey]: 'value' };
      expect(() => validateWorkoutMetadata(metadata)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for string value too long', () => {
      const longValue = 'a'.repeat(1001);
      const metadata = { key: longValue };
      expect(() => validateWorkoutMetadata(metadata)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutStructure', () => {
    it('should pass validation for valid structure', () => {
      const structure = {
        structure: [
          {
            type: 'step' as const,
            length: { value: 600, unit: 'second' as const },
            steps: [],
            begin: 0,
            end: 600,
          },
        ],
        polyline: [[1.0, 2.0]],
        primaryLengthMetric: 'duration' as const,
        primaryIntensityMetric: 'heartRate' as const,
        primaryIntensityTargetOrRange: 'target' as const,
      };
      expect(() => validateWorkoutStructure(600, structure)).not.toThrow();
    });

    it('should throw error when duration does not match structure duration', () => {
      const structure = {
        structure: [
          {
            type: 'step' as const,
            length: { value: 600, unit: 'second' as const },
            steps: [],
            begin: 0,
            end: 600,
          },
        ],
        polyline: [[1.0, 2.0]],
        primaryLengthMetric: 'duration' as const,
        primaryIntensityMetric: 'heartRate' as const,
        primaryIntensityTargetOrRange: 'target' as const,
      };
      expect(() => validateWorkoutStructure(300, structure)).toThrow(
        WorkoutValidationError
      );
    });

    it('should pass validation when structure is undefined', () => {
      expect(() => validateWorkoutStructure(600, undefined)).not.toThrow();
    });

    it('should pass validation for non-object structure (undefined)', () => {
      expect(() => validateWorkoutStructure(600, null)).not.toThrow();
    });

    it('should pass validation for non-object structure (string)', () => {
      expect(() => validateWorkoutStructure(600, 'not-object')).not.toThrow();
    });

    it('should pass validation for non-array elements', () => {
      const structure = {
        structure: 'not-array',
        polyline: [],
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'heartRate',
        primaryIntensityTargetOrRange: 'target',
      };
      expect(() => validateWorkoutStructure(600, structure)).not.toThrow();
    });

    it('should throw error for non-array polyline', () => {
      const structure = {
        structure: [],
        polyline: 'not-array',
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'heartRate',
        primaryIntensityTargetOrRange: 'target',
      };
      expect(() => validateWorkoutStructure(600, structure)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-object metrics', () => {
      const structure = {
        structure: [],
        polyline: [],
        primaryLengthMetric: 'not-object',
        primaryIntensityMetric: 'heartRate',
        primaryIntensityTargetOrRange: 'target',
      };
      expect(() => validateWorkoutStructure(600, structure)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid element', () => {
      const structure = {
        structure: ['not-object'],
        polyline: [],
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'heartRate',
        primaryIntensityTargetOrRange: 'target',
      };
      expect(() => validateWorkoutStructure(600, structure)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid polyline point', () => {
      const structure = {
        structure: [],
        polyline: [[1.0]], // Only one coordinate
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'heartRate',
        primaryIntensityTargetOrRange: 'target',
      };
      expect(() => validateWorkoutStructure(600, structure)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-numeric polyline coordinates', () => {
      const structure = {
        structure: [],
        polyline: [['1.0', 2.0]], // String coordinate
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'heartRate',
        primaryIntensityTargetOrRange: 'target',
      };
      expect(() => validateWorkoutStructure(600, structure)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutTargets', () => {
    it('should pass validation for valid targets', () => {
      const targets = [
        { minValue: 0, maxValue: 100, unit: 'bpm' },
        { minValue: 10, maxValue: 20, unit: 'mph' },
      ];
      expect(() => validateWorkoutTargets(targets)).not.toThrow();
    });

    it('should throw error for non-array targets', () => {
      expect(() => validateWorkoutTargets('not-array' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid target object', () => {
      expect(() => validateWorkoutTargets(['not-object'] as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid minValue', () => {
      const targets = [{ minValue: -1, maxValue: 100, unit: 'bpm' }];
      expect(() => validateWorkoutTargets(targets)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid maxValue', () => {
      const targets = [{ minValue: 0, maxValue: -1, unit: 'bpm' }];
      expect(() => validateWorkoutTargets(targets)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error when minValue > maxValue', () => {
      const targets = [{ minValue: 100, maxValue: 50, unit: 'bpm' }];
      expect(() => validateWorkoutTargets(targets)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing unit', () => {
      const targets = [{ minValue: 0, maxValue: 100, unit: '' }];
      expect(() => validateWorkoutTargets(targets)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutSteps', () => {
    it('should pass validation for valid steps', () => {
      const steps = [
        {
          name: 'Warmup',
          length: { value: 300, unit: 'seconds' },
          targets: [{ minValue: 60, maxValue: 80 }],
          intensityClass: 'easy',
        },
      ];
      expect(() => validateWorkoutSteps(steps)).not.toThrow();
    });

    it('should throw error for non-array steps', () => {
      expect(() => validateWorkoutSteps('not-array' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid step object', () => {
      expect(() => validateWorkoutSteps(['not-object'] as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing step name', () => {
      const steps = [
        {
          length: { value: 300, unit: 'seconds' },
          targets: [],
          intensityClass: 'easy',
        },
      ];
      expect(() => validateWorkoutSteps(steps as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid step length', () => {
      const steps = [
        {
          name: 'Test',
          length: 'not-object',
          targets: [],
          intensityClass: 'easy',
        },
      ];
      expect(() => validateWorkoutSteps(steps as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid length value', () => {
      const steps = [
        {
          name: 'Test',
          length: { value: -1, unit: 'seconds' },
          targets: [],
          intensityClass: 'easy',
        },
      ];
      expect(() => validateWorkoutSteps(steps as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing length unit', () => {
      const steps = [
        {
          name: 'Test',
          length: { value: 300, unit: '' },
          targets: [],
          intensityClass: 'easy',
        },
      ];
      expect(() => validateWorkoutSteps(steps as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-array targets', () => {
      const steps = [
        {
          name: 'Test',
          length: { value: 300, unit: 'seconds' },
          targets: 'not-array',
          intensityClass: 'easy',
        },
      ];
      expect(() => validateWorkoutSteps(steps as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for missing intensity class', () => {
      const steps = [
        {
          name: 'Test',
          length: { value: 300, unit: 'seconds' },
          targets: [],
          intensityClass: '',
        },
      ];
      expect(() => validateWorkoutSteps(steps as any)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutFileConstraints', () => {
    it('should pass validation for valid file constraints', () => {
      expect(() =>
        validateWorkoutFileConstraints('test.tcx', 1000, 'application/tcx+xml')
      ).not.toThrow();
    });

    it('should throw error for missing filename', () => {
      expect(() =>
        validateWorkoutFileConstraints('', 1000, 'application/tcx+xml')
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateWorkoutFileConstraints('   ', 1000, 'application/tcx+xml')
      ).toThrow(WorkoutValidationError);
    });

    it('should throw error for invalid size', () => {
      expect(() =>
        validateWorkoutFileConstraints('test.tcx', 0, 'application/tcx+xml')
      ).toThrow(WorkoutValidationError);
      expect(() =>
        validateWorkoutFileConstraints('test.tcx', -1, 'application/tcx+xml')
      ).toThrow(WorkoutValidationError);
    });

    it('should throw quota exceeded error for file too large', () => {
      const largeSize = 51 * 1024 * 1024; // 51MB
      expect(() =>
        validateWorkoutFileConstraints(
          'test.tcx',
          largeSize,
          'application/tcx+xml'
        )
      ).toThrow(WorkoutQuotaExceededError);
    });

    it('should throw error for invalid MIME type', () => {
      expect(() =>
        validateWorkoutFileConstraints('test.txt', 1000, 'text/plain')
      ).toThrow(WorkoutFileProcessingError);
    });
  });

  describe('validateWorkoutName', () => {
    it('should pass validation for valid name', () => {
      expect(() => validateWorkoutName('Test Workout')).not.toThrow();
    });

    it('should throw error for missing name', () => {
      expect(() => validateWorkoutName('')).toThrow(WorkoutValidationError);
      expect(() => validateWorkoutName('   ')).toThrow(WorkoutValidationError);
      expect(() => validateWorkoutName(null as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for name too long', () => {
      const longName = 'a'.repeat(256);
      expect(() => validateWorkoutName(longName)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-string name', () => {
      expect(() => validateWorkoutName(123 as any)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutDescription', () => {
    it('should pass validation for valid description', () => {
      expect(() =>
        validateWorkoutDescription('Test description')
      ).not.toThrow();
    });

    it('should throw error for non-string description', () => {
      expect(() => validateWorkoutDescription(123 as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for description too long', () => {
      const longDescription = 'a'.repeat(1001);
      expect(() => validateWorkoutDescription(longDescription)).toThrow(
        WorkoutValidationError
      );
    });

    it('should handle null/undefined description', () => {
      expect(() => validateWorkoutDescription(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutDescription(undefined as any)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutDuration', () => {
    it('should pass validation for valid duration', () => {
      expect(() => validateWorkoutDuration(3600)).not.toThrow();
      expect(() => validateWorkoutDuration(0)).not.toThrow();
    });

    it('should throw error for non-numeric duration', () => {
      expect(() => validateWorkoutDuration('3600' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for negative duration', () => {
      expect(() => validateWorkoutDuration(-1)).toThrow(WorkoutValidationError);
    });

    it('should throw error for duration too long', () => {
      expect(() => validateWorkoutDuration(86401)).toThrow(
        WorkoutValidationError
      ); // More than 24 hours
    });
  });

  describe('validateWorkoutDistance', () => {
    it('should pass validation for valid distance', () => {
      expect(() => validateWorkoutDistance(10000)).not.toThrow();
      expect(() => validateWorkoutDistance(0)).not.toThrow();
    });

    it('should throw error for non-numeric distance', () => {
      expect(() => validateWorkoutDistance('10000' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for negative distance', () => {
      expect(() => validateWorkoutDistance(-1)).toThrow(WorkoutValidationError);
    });

    it('should throw error for distance too large', () => {
      expect(() => validateWorkoutDistance(1000001)).toThrow(
        WorkoutValidationError
      ); // More than 1000km
    });
  });

  describe('validateWorkoutTags', () => {
    it('should pass validation for valid tags', () => {
      expect(() => validateWorkoutTags(['tag1', 'tag2', 'tag3'])).not.toThrow();
      expect(() => validateWorkoutTags([])).not.toThrow();
    });

    it('should throw error for non-array tags', () => {
      expect(() => validateWorkoutTags('not-array' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for too many tags', () => {
      const manyTags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
      expect(() => validateWorkoutTags(manyTags)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-string tag', () => {
      expect(() => validateWorkoutTags([123] as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for empty tag', () => {
      expect(() => validateWorkoutTags([''])).toThrow(WorkoutValidationError);
      expect(() => validateWorkoutTags(['   '])).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for tag too long', () => {
      const longTag = 'a'.repeat(51);
      expect(() => validateWorkoutTags([longTag])).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutEquipment', () => {
    it('should pass validation for valid equipment', () => {
      expect(() =>
        validateWorkoutEquipment({ bikeId: 'bike-123', shoeId: 'shoe-456' })
      ).not.toThrow();
      expect(() => validateWorkoutEquipment({})).not.toThrow();
    });

    it('should throw error for non-object equipment', () => {
      expect(() => validateWorkoutEquipment(null as any)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutEquipment('not-object' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-string bikeId', () => {
      expect(() => validateWorkoutEquipment({ bikeId: 123 as any })).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-string shoeId', () => {
      expect(() => validateWorkoutEquipment({ shoeId: 123 as any })).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutPlannedMetrics', () => {
    it('should pass validation for valid planned metrics', () => {
      const metrics = {
        distancePlanned: 10000,
        totalTimePlanned: 3600,
        caloriesPlanned: 500,
        tssPlanned: 100,
      };
      expect(() => validateWorkoutPlannedMetrics(metrics)).not.toThrow();
    });

    it('should throw error for non-object metrics', () => {
      expect(() => validateWorkoutPlannedMetrics(null as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for negative calories', () => {
      expect(() =>
        validateWorkoutPlannedMetrics({ caloriesPlanned: -1 })
      ).toThrow(WorkoutValidationError);
    });

    it('should throw error for non-numeric calories', () => {
      expect(() =>
        validateWorkoutPlannedMetrics({ caloriesPlanned: '500' as any })
      ).toThrow(WorkoutValidationError);
    });

    it('should throw error for negative TSS', () => {
      expect(() => validateWorkoutPlannedMetrics({ tssPlanned: -1 })).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-numeric TSS', () => {
      expect(() =>
        validateWorkoutPlannedMetrics({ tssPlanned: '100' as any })
      ).toThrow(WorkoutValidationError);
    });
  });

  describe('validateWorkoutPublicSettings', () => {
    it('should pass validation for valid public settings', () => {
      [0, 1, 2].forEach((setting) => {
        expect(() => validateWorkoutPublicSettings(setting)).not.toThrow();
      });
    });

    it('should throw error for non-numeric setting', () => {
      expect(() => validateWorkoutPublicSettings('1' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for invalid setting value', () => {
      expect(() => validateWorkoutPublicSettings(3)).toThrow(
        WorkoutValidationError
      );
      expect(() => validateWorkoutPublicSettings(-1)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutComments', () => {
    it('should pass validation for valid comments', () => {
      expect(() =>
        validateWorkoutComments(['comment1', 'comment2'])
      ).not.toThrow();
      expect(() => validateWorkoutComments([])).not.toThrow();
    });

    it('should throw error for non-array comments', () => {
      expect(() => validateWorkoutComments('not-array' as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for too many comments', () => {
      const manyComments = Array.from({ length: 101 }, (_, i) => `comment${i}`);
      expect(() => validateWorkoutComments(manyComments)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for non-string comment', () => {
      expect(() => validateWorkoutComments([123] as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for comment too long', () => {
      const longComment = 'a'.repeat(501);
      expect(() => validateWorkoutComments([longComment])).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutUserTags', () => {
    it('should pass validation for valid user tags', () => {
      expect(() => validateWorkoutUserTags('tag1, tag2, tag3')).not.toThrow();
      expect(() => validateWorkoutUserTags('')).not.toThrow();
    });

    it('should throw error for non-string user tags', () => {
      expect(() => validateWorkoutUserTags(123 as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for user tags too long', () => {
      const longTags = 'a'.repeat(1001);
      expect(() => validateWorkoutUserTags(longTags)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('validateWorkoutCoachComments', () => {
    it('should pass validation for valid coach comments', () => {
      expect(() =>
        validateWorkoutCoachComments('Coach notes here')
      ).not.toThrow();
      expect(() => validateWorkoutCoachComments('')).not.toThrow();
    });

    it('should throw error for non-string coach comments', () => {
      expect(() => validateWorkoutCoachComments(123 as any)).toThrow(
        WorkoutValidationError
      );
    });

    it('should throw error for coach comments too long', () => {
      const longComments = 'a'.repeat(2001);
      expect(() => validateWorkoutCoachComments(longComments)).toThrow(
        WorkoutValidationError
      );
    });
  });

  describe('integration scenarios', () => {
    it('should validate complex workout upload scenario', () => {
      const workoutData = workoutDataBuilder.build();
      const file = createWorkoutFile(
        'test.tcx',
        '<tcx>...</tcx>',
        'application/tcx+xml'
      );

      expect(() => {
        validateWorkoutId('workout-123');
        validateWorkoutUpload(workoutData, file);
        validateWorkoutType('RUN');
        validateAthleteId(123);
      }).not.toThrow();
    });

    it('should validate complex search scenario', () => {
      const searchQuery = {
        name: 'test workout',
        type: 'BIKE',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        limit: 10,
        offset: 0,
      };

      expect(() => {
        validateWorkoutSearch(searchQuery);
        validateWorkoutDateRange(searchQuery.startDate!, searchQuery.endDate!);
        validatePagination(searchQuery.limit, searchQuery.offset);
      }).not.toThrow();
    });
  });
});
