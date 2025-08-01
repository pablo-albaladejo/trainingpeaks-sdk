/**
 * WorkoutData Fixtures
 * Factory pattern fixtures for creating WorkoutData using rosie and faker
 *
 * This fixture demonstrates:
 * - Dependencies between related attributes (duration, distance, type)
 * - Reusable builders for common workout patterns
 * - Proper handling of optional fields and metadata
 * - Consistent workout structure patterns
 */

import type {
  WorkoutData,
  WorkoutFileData,
  WorkoutMetadata,
} from '@/domain/schemas';
import { WorkoutType } from '@/types';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';
import { randomDate, randomNumber, randomString } from './utils.fixture';

/**
 * WorkoutMetadata Builder
 * Creates workout metadata objects with realistic defaults
 */
export const workoutMetadataBuilder = new Factory<WorkoutMetadata>()
  .attr('tags', () =>
    Array.from({ length: randomNumber(1, 5) }, () => faker.lorem.word())
  )
  .attr('notes', () => faker.lorem.sentence())
  .attr('location', () => faker.location.city())
  .attr('weather', () =>
    faker.helpers.arrayElement(['sunny', 'cloudy', 'rainy', 'snowy'])
  )
  .attr('temperature', () => randomNumber(10, 35))
  .option('includeTags', true)
  .option('includeNotes', false)
  .option('includeLocation', true)
  .option('includeWeather', false)
  .after((metadata, options) => {
    return {
      tags: options.includeTags ? metadata.tags : [],
      notes: options.includeNotes ? metadata.notes : undefined,
      location: options.includeLocation ? metadata.location : undefined,
      weather: options.includeWeather ? metadata.weather : undefined,
      temperature: options.includeWeather ? metadata.temperature : undefined,
    };
  });

/**
 * WorkoutData Builder
 * Creates WorkoutData with proper type and duration dependencies
 */
export const workoutDataBuilder = new Factory<WorkoutData>()
  .attr('name', () => faker.lorem.words(3))
  .attr('description', () => faker.lorem.sentence())
  .attr('date', () => randomDate())
  .attr('duration', () => randomNumber(300, 10800)) // 5 minutes to 3 hours
  .attr('distance', () => randomNumber(1000, 100000)) // 1km to 100km
  .attr('type', () => faker.helpers.arrayElement(Object.values(WorkoutType)))
  .attr('fileData', () => undefined)
  .after((workout) => {
    return {
      ...workout,
      fileData: workout.fileData,
    };
  });

/**
 * Helper function to create workouts with specific values
 */
export const createWorkoutData = (
  options: {
    name?: string;
    description?: string;
    durationMinutes?: number;
    distanceKm?: number;
    workoutType?: WorkoutType;
    includeFileData?: boolean;
  } = {}
) => {
  const duration = options.durationMinutes
    ? options.durationMinutes * 60
    : randomNumber(300, 10800);
  const distance = options.distanceKm
    ? options.distanceKm * 1000
    : randomNumber(1000, 100000);

  return workoutDataBuilder.build({
    name: options.name,
    description: options.description,
    duration,
    distance,
    type: options.workoutType,
    fileData: options.includeFileData
      ? workoutFileDataBuilder.build()
      : undefined,
  });
};

/**
 * WorkoutFileData Builder
 * Creates WorkoutFileData with proper format dependencies
 */
export const workoutFileDataBuilder = new Factory<WorkoutFileData>()
  .attr(
    'filename',
    () =>
      `${randomString(8)}.${faker.helpers.arrayElement(['gpx', 'tcx', 'fit'])}`
  )
  .attr('content', () => faker.string.alpha({ length: 1000 }))
  .attr('mimeType', () =>
    faker.helpers.arrayElement([
      'application/gpx+xml',
      'application/tcx+xml',
      'application/octet-stream',
    ])
  )
  .option('fileFormat', 'tcx')
  .option('contentLength', 1000)
  .after((fileData, options) => {
    const extensions = {
      gpx: 'application/gpx+xml',
      tcx: 'application/tcx+xml',
      fit: 'application/octet-stream',
    };

    return {
      filename: fileData.filename.replace(/\.[^.]+$/, `.${options.fileFormat}`),
      content: faker.string.alpha({ length: options.contentLength }),
      mimeType:
        extensions[options.fileFormat as keyof typeof extensions] ||
        fileData.mimeType,
    };
  });

/**
 * Predefined Workout Builders for Common Types
 * These demonstrate reusable builders for common workout patterns
 */

/**
 * Running Workout Builder
 * Creates running workouts with appropriate duration and distance
 */
export const runningWorkoutBuilder = new Factory<WorkoutData>()
  .extend(workoutDataBuilder)
  .option('workoutType', WorkoutType.RUN)
  .option('durationMinutes', 45)
  .option('distanceKm', 8)
  .option('includeMetadata', true);

/**
 * Cycling Workout Builder
 * Creates cycling workouts with appropriate duration and distance
 */
export const cyclingWorkoutBuilder = new Factory<WorkoutData>()
  .extend(workoutDataBuilder)
  .option('workoutType', WorkoutType.BIKE)
  .option('durationMinutes', 90)
  .option('distanceKm', 30)
  .option('includeMetadata', true);

/**
 * Swimming Workout Builder
 * Creates swimming workouts with appropriate duration and distance
 */
export const swimmingWorkoutBuilder = new Factory<WorkoutData>()
  .extend(workoutDataBuilder)
  .option('workoutType', WorkoutType.SWIM)
  .option('durationMinutes', 30)
  .option('distanceKm', 1.5)
  .option('includeMetadata', false);

/**
 * Other Workout Builder
 * Creates other type workouts (strength, yoga, etc.)
 */
export const otherWorkoutBuilder = new Factory<WorkoutData>()
  .extend(workoutDataBuilder)
  .option('workoutType', WorkoutType.OTHER)
  .option('durationMinutes', 45)
  .option('distanceKm', 0)
  .option('includeMetadata', true);

/**
 * Short Workout Builder
 * Creates short workouts for quick tests
 */
export const shortWorkoutBuilder = new Factory<WorkoutData>()
  .extend(workoutDataBuilder)
  .option('durationMinutes', 15)
  .option('distanceKm', 2)
  .option('includeMetadata', false)
  .option('includeFileData', false);

/**
 * Long Workout Builder
 * Creates long workouts for endurance tests
 */
export const longWorkoutBuilder = new Factory<WorkoutData>()
  .extend(workoutDataBuilder)
  .option('durationMinutes', 180)
  .option('distanceKm', 50)
  .option('includeMetadata', true)
  .option('includeFileData', true);

/**
 * Workout with File Builder
 * Creates workouts that include file data
 */
export const workoutWithFileBuilder = new Factory<WorkoutData>()
  .extend(workoutDataBuilder)
  .option('includeFileData', true)
  .option('fileFormat', 'tcx')
  .option('contentLength', 2000);
