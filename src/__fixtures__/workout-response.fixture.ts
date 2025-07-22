/**
 * Workout Response Fixtures
 * Factory pattern fixtures for creating workout response data using rosie and faker
 *
 * This fixture demonstrates:
 * - Dependencies between related attributes
 * - Reusable builders for common response patterns
 * - Proper handling of optional fields
 * - Consistent response structure patterns
 */

import type {
  CreateStructuredWorkoutResponse,
  UploadWorkoutResponse,
} from '@/application/services/workout-creation';
import type { ListWorkoutsResponse } from '@/application/services/workout-query';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';
import { randomNumber, randomString, randomUrl } from './utils.fixture';
import { workoutDataBuilder } from './workout-data.fixture';

/**
 * FileInfo Builder
 * Creates file information for workout responses
 */
export const fileInfoBuilder = new Factory<{
  originalName: string;
  size: number;
  type: string;
  uploadedAt: Date;
}>()
  .attr('originalName', () => `workout-${randomString()}.tcx`)
  .attr('size', () => randomNumber(1024, 1048576))
  .attr('type', () => 'application/tcx+xml')
  .attr('uploadedAt', () => faker.date.recent())
  .option('fileType', 'tcx')
  .option('fileSize', undefined)
  .after((fileInfo, options) => {
    const fileType =
      (options as { fileType?: string; fileSize?: number }).fileType || 'tcx';
    const fileSize = (options as { fileType?: string; fileSize?: number })
      .fileSize;

    let type: string;
    let originalName: string;

    switch (fileType) {
      case 'gpx':
        type = 'application/gpx+xml';
        originalName = `workout-${randomString()}.gpx`;
        break;
      case 'fit':
        type = 'application/fit';
        originalName = `workout-${randomString()}.fit`;
        break;
      case 'tcx':
      default:
        type = 'application/tcx+xml';
        originalName = `workout-${randomString()}.tcx`;
        break;
    }

    return {
      originalName,
      size: fileSize || fileInfo.size,
      type,
      uploadedAt: fileInfo.uploadedAt,
    };
  });

/**
 * ValidationWarning Builder
 * Creates validation warning objects
 */
export const validationWarningBuilder = new Factory()
  .attr('field', () =>
    faker.helpers.arrayElement(['name', 'description', 'date', 'duration'])
  )
  .attr('message', () => faker.lorem.sentence())
  .attr('severity', () => faker.helpers.arrayElement(['warning', 'info']))
  .option('field', 'name')
  .option('message', 'Field validation warning')
  .option('severity', 'warning');

/**
 * ValidationError Builder
 * Creates validation error objects
 */
export const validationErrorBuilder = new Factory()
  .attr('field', () =>
    faker.helpers.arrayElement(['name', 'description', 'date', 'duration'])
  )
  .attr('message', () => faker.lorem.sentence())
  .attr('code', () =>
    faker.helpers.arrayElement(['REQUIRED', 'INVALID_FORMAT', 'OUT_OF_RANGE'])
  )
  .option('field', 'name')
  .option('message', 'Field validation error')
  .option('code', 'REQUIRED');

/**
 * CreateStructuredWorkoutResponse Builder
 * Creates structured workout creation responses with proper dependencies
 */
export const createStructuredWorkoutResponseBuilder =
  new Factory<CreateStructuredWorkoutResponse>()
    .attr('workoutId', () => randomString())
    .attr('success', () => true)
    .attr('message', () => faker.lorem.sentence())
    .attr('url', () => randomUrl())
    .attr('createdAt', () => faker.date.recent())
    .attr('estimatedDuration', () => randomNumber(600, 7200))
    .attr('estimatedDistance', () => randomNumber(1000, 50000))
    .attr('estimatedCalories', () => randomNumber(100, 1000))
    .attr('structure', () => undefined)
    .attr('validationWarnings', () => undefined)
    .attr('uploadStatus', () => 'completed' as const)
    .attr('processingTime', () => randomNumber(100, 1000))
    .attr('metadata', () => undefined)
    .option('includeWarnings', false)
    .option('includeStructure', false)
    .option('processingTime', undefined)
    .after((response, options) => {
      const warnings = options.includeWarnings
        ? Array.from({ length: randomNumber(1, 3) }, () =>
            validationWarningBuilder.build()
          )
        : undefined;

      return {
        ...response,
        validationWarnings: warnings,
        processingTime:
          options.processingTime !== undefined
            ? options.processingTime
            : response.processingTime,
      };
    });

/**
 * UploadWorkoutResponse Builder
 * Creates workout upload responses with file info and validation
 */
export const uploadWorkoutResponseBuilder = new Factory<UploadWorkoutResponse>()
  .attr('workoutId', () => randomString())
  .attr('success', () => true)
  .attr('message', () => faker.lorem.sentence())
  .attr('url', () => randomUrl())
  .attr('processedData', () => workoutDataBuilder.build())
  .attr('fileInfo', () => fileInfoBuilder.build())
  .attr('validationErrors', () => undefined)
  .attr('validationWarnings', () => undefined)
  .attr('processingTime', () => randomNumber(100, 2500))
  .attr('metadata', () => undefined)
  .after((response) => {
    return {
      ...response,
      fileInfo: response.fileInfo,
      validationErrors: response.validationErrors,
      validationWarnings: response.validationWarnings,
      processingTime: response.processingTime,
    };
  });

/**
 * Helper function to create upload responses with specific options
 */
export const createUploadWorkoutResponse = (
  options: {
    fileType?: string;
    fileSize?: number;
    includeErrors?: boolean;
    includeWarnings?: boolean;
    warningCount?: number;
    processingTime?: number;
    success?: boolean;
  } = {}
) => {
  // Create fileInfo manually
  let fileType: string;
  let originalName: string;

  switch (options.fileType) {
    case 'gpx':
      fileType = 'application/gpx+xml';
      originalName = `workout-${randomString()}.gpx`;
      break;
    case 'fit':
      fileType = 'application/fit';
      originalName = `workout-${randomString()}.fit`;
      break;
    case 'tcx':
    default:
      fileType = 'application/tcx+xml';
      originalName = `workout-${randomString()}.tcx`;
      break;
  }

  const fileInfo = {
    originalName,
    size:
      options.fileSize !== undefined
        ? options.fileSize
        : randomNumber(1024, 1048576),
    type: fileType,
    uploadedAt: faker.date.recent(),
  };

  const errors = options.includeErrors
    ? Array.from({ length: randomNumber(1, 2) }, () =>
        validationErrorBuilder.build()
      )
    : undefined;

  const warnings = options.includeWarnings
    ? Array.from({ length: options.warningCount || randomNumber(1, 3) }, () =>
        validationWarningBuilder.build()
      )
    : undefined;

  return uploadWorkoutResponseBuilder.build({
    success: options.success !== undefined ? options.success : true,
    fileInfo,
    validationErrors: errors,
    validationWarnings: warnings,
    processingTime: options.processingTime,
  });
};

/**
 * ListWorkoutsResponse Builder
 * Creates workout list responses with pagination
 */
export const listWorkoutsResponseBuilder = new Factory<ListWorkoutsResponse>()
  .attr('workouts', () => [])
  .attr('total', () => 0)
  .attr('page', () => 1)
  .attr('limit', () => 10)
  .attr('hasMore', () => false)
  .after((response) => {
    return {
      workouts: response.workouts,
      total: response.total,
      page: response.page,
      limit: response.limit,
      hasMore: response.hasMore,
    };
  });

/**
 * Helper function to create list responses with specific workout count
 */
export const createListWorkoutsResponse = (
  options: {
    workoutCount?: number;
    total?: number;
    page?: number;
    limit?: number;
  } = {}
) => {
  const workouts = Array.from({ length: options.workoutCount || 0 }, () =>
    workoutDataBuilder.build()
  );

  const total = options.total || options.workoutCount || 0;
  const page = options.page || 1;
  const limit = options.limit || 10;
  const hasMore = page * limit < total;

  return listWorkoutsResponseBuilder.build({
    workouts,
    total,
    page,
    limit,
    hasMore,
  });
};

/**
 * Predefined Response Builders for Common Scenarios
 * These demonstrate reusable builders for common response patterns
 */

/**
 * Successful Upload Response Builder
 * Creates successful upload responses
 */
export const successfulUploadResponseBuilder = new Factory()
  .extend(uploadWorkoutResponseBuilder)
  .option('success', true)
  .option('includeErrors', false)
  .option('includeWarnings', false)
  .option('processingTime', 500);

/**
 * Failed Upload Response Builder
 * Creates failed upload responses with errors
 */
export const failedUploadResponseBuilder = new Factory()
  .extend(uploadWorkoutResponseBuilder)
  .option('success', false)
  .option('includeErrors', true)
  .option('includeWarnings', true)
  .option('processingTime', 100)
  .after((response) => ({
    ...response,
    message: 'Upload failed due to validation errors',
    processedData: undefined,
    fileInfo: undefined,
  }));

/**
 * Paginated List Response Builder
 * Creates paginated list responses with realistic data
 */
export const paginatedListResponseBuilder = new Factory()
  .extend(listWorkoutsResponseBuilder)
  .option('workoutCount', 10)
  .option('total', 50)
  .option('page', 1)
  .option('limit', 10)
  .after((response, options) => {
    const total = options.total || 50;
    const hasMore = options.page * options.limit < total;

    return {
      ...response,
      hasMore,
      total,
    };
  });

/**
 * Empty List Response Builder
 * Creates empty list responses
 */
export const emptyListResponseBuilder = new Factory()
  .extend(listWorkoutsResponseBuilder)
  .option('workoutCount', 0)
  .option('total', 0)
  .option('hasMore', false);
