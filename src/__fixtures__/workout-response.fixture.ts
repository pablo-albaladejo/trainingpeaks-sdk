/**
 * Workout Response Fixtures
 * Provides test data for workout operation responses
 */

import { faker } from '@faker-js/faker';
import type {
  CreateStructuredWorkoutResponse,
  UploadWorkoutResponse,
} from '@/application/services/workout-creation';
import type { ListWorkoutsResponse } from '@/application/services/workout-query';
import { WorkoutDataFixture } from './workout-data.fixture';
import { StructuredWorkoutDataFixture } from './structured-workout-data.fixture';
import { randomNumber, randomString, randomUrl } from './utils.fixture';

/**
 * Create Structured Workout Response Fixture
 */
export class CreateStructuredWorkoutResponseFixture {
  private response: Partial<CreateStructuredWorkoutResponse> = {};

  withWorkoutId(workoutId: string): this {
    this.response.workoutId = workoutId;
    return this;
  }

  withRandomWorkoutId(): this {
    this.response.workoutId = randomString();
    return this;
  }

  withSuccess(success: boolean): this {
    this.response.success = success;
    return this;
  }

  withMessage(message: string): this {
    this.response.message = message;
    return this;
  }

  withRandomMessage(): this {
    this.response.message = faker.lorem.sentence();
    return this;
  }

  withUrl(url: string): this {
    this.response.url = url;
    return this;
  }

  withRandomUrl(): this {
    this.response.url = randomUrl();
    return this;
  }

  withCreatedAt(createdAt: Date): this {
    this.response.createdAt = createdAt;
    return this;
  }

  withRandomCreatedAt(): this {
    this.response.createdAt = faker.date.recent();
    return this;
  }

  withEstimatedDuration(duration: number): this {
    this.response.estimatedDuration = duration;
    return this;
  }

  withRandomEstimatedDuration(): this {
    this.response.estimatedDuration = randomNumber(600, 7200);
    return this;
  }

  withEstimatedDistance(distance: number): this {
    this.response.estimatedDistance = distance;
    return this;
  }

  withRandomEstimatedDistance(): this {
    this.response.estimatedDistance = randomNumber(1000, 50000);
    return this;
  }

  withEstimatedCalories(calories: number): this {
    this.response.estimatedCalories = calories;
    return this;
  }

  withRandomEstimatedCalories(): this {
    this.response.estimatedCalories = randomNumber(100, 1000);
    return this;
  }

  withStructure(structure: unknown): this {
    this.response.structure = structure;
    return this;
  }

  withRandomStructure(): this {
    this.response.structure = StructuredWorkoutDataFixture.random().structure;
    return this;
  }

  withValidationWarnings(warnings: string[]): this {
    this.response.validationWarnings = warnings;
    return this;
  }

  withRandomValidationWarnings(): this {
    this.response.validationWarnings = Array.from(
      { length: randomNumber(1, 3) },
      () => faker.lorem.sentence()
    );
    return this;
  }

  withUploadStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): this {
    this.response.uploadStatus = status;
    return this;
  }

  withRandomUploadStatus(): this {
    const statuses: ('pending' | 'processing' | 'completed' | 'failed')[] = [
      'pending',
      'processing',
      'completed',
      'failed',
    ];
    this.response.uploadStatus = faker.helpers.arrayElement(statuses);
    return this;
  }

  withProcessingTime(time: number): this {
    this.response.processingTime = time;
    return this;
  }

  withRandomProcessingTime(): this {
    this.response.processingTime = randomNumber(100, 1000);
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.response.metadata = metadata;
    return this;
  }

  withRandomMetadata(): this {
    this.response.metadata = {
      version: '1.0',
      creator: 'sdk',
      timestamp: new Date().toISOString(),
    };
    return this;
  }

  build(): CreateStructuredWorkoutResponse {
    return {
      workoutId: this.response.workoutId || randomString(),
      success: this.response.success ?? true,
      message: this.response.message,
      url: this.response.url,
      createdAt: this.response.createdAt,
      estimatedDuration: this.response.estimatedDuration,
      estimatedDistance: this.response.estimatedDistance,
      estimatedCalories: this.response.estimatedCalories,
      structure: this.response.structure,
      validationWarnings: this.response.validationWarnings,
      uploadStatus: this.response.uploadStatus,
      processingTime: this.response.processingTime,
      metadata: this.response.metadata,
    };
  }

  static success(): CreateStructuredWorkoutResponse {
    return new CreateStructuredWorkoutResponseFixture()
      .withRandomWorkoutId()
      .withSuccess(true)
      .withRandomMessage()
      .withRandomCreatedAt()
      .build();
  }

  static failure(): CreateStructuredWorkoutResponse {
    return new CreateStructuredWorkoutResponseFixture()
      .withWorkoutId('')
      .withSuccess(false)
      .withMessage('Failed to create workout')
      .build();
  }

  static random(): CreateStructuredWorkoutResponse {
    return new CreateStructuredWorkoutResponseFixture()
      .withRandomWorkoutId()
      .withSuccess(Math.random() > 0.2)
      .withRandomMessage()
      .withRandomUrl()
      .withRandomCreatedAt()
      .withRandomEstimatedDuration()
      .withRandomEstimatedDistance()
      .withRandomEstimatedCalories()
      .withRandomProcessingTime()
      .withRandomMetadata()
      .build();
  }
}

/**
 * Upload Workout Response Fixture
 */
export class UploadWorkoutResponseFixture {
  private response: Partial<UploadWorkoutResponse> = {};

  withWorkoutId(workoutId: string): this {
    this.response.workoutId = workoutId;
    return this;
  }

  withRandomWorkoutId(): this {
    this.response.workoutId = randomString();
    return this;
  }

  withSuccess(success: boolean): this {
    this.response.success = success;
    return this;
  }

  withMessage(message: string): this {
    this.response.message = message;
    return this;
  }

  withRandomMessage(): this {
    this.response.message = faker.lorem.sentence();
    return this;
  }

  withUrl(url: string): this {
    this.response.url = url;
    return this;
  }

  withRandomUrl(): this {
    this.response.url = randomUrl();
    return this;
  }

  withProcessedData(data: unknown): this {
    this.response.processedData = data;
    return this;
  }

  withRandomProcessedData(): this {
    this.response.processedData = WorkoutDataFixture.random();
    return this;
  }

  withFileInfo(fileInfo: UploadWorkoutResponse['fileInfo']): this {
    this.response.fileInfo = fileInfo;
    return this;
  }

  withRandomFileInfo(): this {
    this.response.fileInfo = {
      originalName: faker.system.fileName({ extensionCount: 1 }),
      size: randomNumber(1024, 1024 * 1024 * 5),
      type: faker.helpers.arrayElement([
        'application/tcx+xml',
        'application/gpx+xml',
        'application/fit',
      ]),
      uploadedAt: faker.date.recent(),
    };
    return this;
  }

  withValidationErrors(errors: string[]): this {
    this.response.validationErrors = errors;
    return this;
  }

  withRandomValidationErrors(): this {
    this.response.validationErrors = Array.from(
      { length: randomNumber(1, 3) },
      () => faker.lorem.sentence()
    );
    return this;
  }

  withValidationWarnings(warnings: string[]): this {
    this.response.validationWarnings = warnings;
    return this;
  }

  withRandomValidationWarnings(): this {
    this.response.validationWarnings = Array.from(
      { length: randomNumber(1, 3) },
      () => faker.lorem.sentence()
    );
    return this;
  }

  withProcessingTime(time: number): this {
    this.response.processingTime = time;
    return this;
  }

  withRandomProcessingTime(): this {
    this.response.processingTime = randomNumber(100, 2500);
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.response.metadata = metadata;
    return this;
  }

  withRandomMetadata(): this {
    this.response.metadata = {
      uploadSource: 'sdk',
      fileFormat: faker.helpers.arrayElement(['tcx', 'gpx', 'fit']),
      processingVersion: faker.system.semver(),
      deviceInfo: {
        manufacturer: faker.helpers.arrayElement(['Garmin', 'Polar', 'Suunto']),
        model: faker.commerce.productName(),
      },
    };
    return this;
  }

  build(): UploadWorkoutResponse {
    return {
      workoutId: this.response.workoutId || randomString(),
      success: this.response.success ?? true,
      message: this.response.message,
      url: this.response.url,
      processedData: this.response.processedData,
      fileInfo: this.response.fileInfo,
      validationErrors: this.response.validationErrors,
      validationWarnings: this.response.validationWarnings,
      processingTime: this.response.processingTime,
      metadata: this.response.metadata,
    };
  }

  static success(): UploadWorkoutResponse {
    return new UploadWorkoutResponseFixture()
      .withRandomWorkoutId()
      .withSuccess(true)
      .withRandomMessage()
      .withRandomUrl()
      .withRandomProcessedData()
      .withRandomFileInfo()
      .build();
  }

  static failure(): UploadWorkoutResponse {
    return new UploadWorkoutResponseFixture()
      .withWorkoutId('')
      .withSuccess(false)
      .withMessage('Upload failed: Invalid file format')
      .withRandomValidationErrors()
      .build();
  }

  static random(): UploadWorkoutResponse {
    return new UploadWorkoutResponseFixture()
      .withRandomWorkoutId()
      .withSuccess(Math.random() > 0.2)
      .withRandomMessage()
      .withRandomUrl()
      .withRandomProcessedData()
      .withRandomFileInfo()
      .withRandomProcessingTime()
      .withRandomMetadata()
      .build();
  }
}

/**
 * List Workouts Response Fixture
 */
export class ListWorkoutsResponseFixture {
  private response: Partial<ListWorkoutsResponse> = {};

  withWorkouts(workouts: unknown[]): this {
    this.response.workouts = workouts;
    return this;
  }

  withRandomWorkouts(count: number = randomNumber(1, 5)): this {
    this.response.workouts = Array.from({ length: count }, (_, i) =>
      new WorkoutDataFixture().withName(`Workout ${i + 1}`).build()
    );
    return this;
  }

  withTotal(total: number): this {
    this.response.total = total;
    return this;
  }

  withRandomTotal(): this {
    this.response.total = randomNumber(0, 2000);
    return this;
  }

  withPage(page: number): this {
    this.response.page = page;
    return this;
  }

  withRandomPage(): this {
    this.response.page = randomNumber(1, 10);
    return this;
  }

  withLimit(limit: number): this {
    this.response.limit = limit;
    return this;
  }

  withRandomLimit(): this {
    this.response.limit = randomNumber(10, 100);
    return this;
  }

  withHasMore(hasMore: boolean): this {
    this.response.hasMore = hasMore;
    return this;
  }

  withRandomHasMore(): this {
    this.response.hasMore = Math.random() > 0.5;
    return this;
  }

  build(): ListWorkoutsResponse {
    return {
      workouts: this.response.workouts || [],
      total: this.response.total || 0,
      page: this.response.page || 1,
      limit: this.response.limit || 10,
      hasMore: this.response.hasMore ?? false,
    };
  }

  static empty(): ListWorkoutsResponse {
    return new ListWorkoutsResponseFixture()
      .withWorkouts([])
      .withTotal(0)
      .withPage(1)
      .withLimit(10)
      .withHasMore(false)
      .build();
  }

  static withWorkouts(workouts: unknown[]): ListWorkoutsResponse {
    return new ListWorkoutsResponseFixture()
      .withWorkouts(workouts)
      .withTotal(workouts.length)
      .withPage(1)
      .withLimit(10)
      .withHasMore(false)
      .build();
  }

  static random(): ListWorkoutsResponse {
    const workoutCount = randomNumber(0, 10);
    return new ListWorkoutsResponseFixture()
      .withRandomWorkouts(workoutCount)
      .withRandomTotal()
      .withRandomPage()
      .withRandomLimit()
      .withRandomHasMore()
      .build();
  }
}

/**
 * Workout File Fixture for testing uploads
 */
export class WorkoutFileFixture {
  private file: Partial<{
    name: string;
    content: string;
    size: number;
    type: string;
  }> = {};

  withName(name: string): this {
    this.file.name = name;
    return this;
  }

  withRandomName(): this {
    const extensions = ['tcx', 'gpx', 'fit'];
    const extension = faker.helpers.arrayElement(extensions);
    this.file.name = `${faker.lorem.word()}.${extension}`;
    return this;
  }

  withContent(content: string): this {
    this.file.content = content;
    return this;
  }

  withRandomContent(): this {
    this.file.content = faker.lorem.paragraphs();
    return this;
  }

  withSize(size: number): this {
    this.file.size = size;
    return this;
  }

  withRandomSize(): this {
    this.file.size = randomNumber(1024, 1024 * 1024 * 5);
    return this;
  }

  withType(type: string): this {
    this.file.type = type;
    return this;
  }

  withRandomType(): this {
    this.file.type = faker.helpers.arrayElement([
      'application/tcx+xml',
      'application/gpx+xml',
      'application/fit',
    ]);
    return this;
  }

  build() {
    return {
      name: this.file.name || 'workout.tcx',
      content: this.file.content || '<TrainingCenterDatabase>...</TrainingCenterDatabase>',
      size: this.file.size || 1024,
      type: this.file.type || 'application/tcx+xml',
    };
  }

  static tcx() {
    return new WorkoutFileFixture()
      .withName('workout.tcx')
      .withContent('<TrainingCenterDatabase>...</TrainingCenterDatabase>')
      .withSize(1024)
      .withType('application/tcx+xml')
      .build();
  }

  static gpx() {
    return new WorkoutFileFixture()
      .withName('workout.gpx')
      .withContent('<gpx>...</gpx>')
      .withSize(2048)
      .withType('application/gpx+xml')
      .build();
  }

  static fit() {
    return new WorkoutFileFixture()
      .withName('workout.fit')
      .withContent('binary-fit-data...')
      .withSize(5 * 1024 * 1024)
      .withType('application/fit')
      .build();
  }

  static random() {
    return new WorkoutFileFixture()
      .withRandomName()
      .withRandomContent()
      .withRandomSize()
      .withRandomType()
      .build();
  }
}