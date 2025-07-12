import { faker } from '@faker-js/faker';
import { WorkoutData, WorkoutFileData, WorkoutType } from '../types';
import { randomDate, randomNumber, randomString } from './utils.fixture';

/**
 * WorkoutData fixture builder
 */
export class WorkoutDataFixture {
  private workout: Partial<WorkoutData> = {};

  /**
   * Set workout name
   * @param name - Workout name
   */
  withName(name: string): this {
    this.workout.name = name;
    return this;
  }

  /**
   * Set random workout name
   */
  withRandomName(): this {
    this.workout.name = faker.lorem.words(3);
    return this;
  }

  /**
   * Set workout description
   * @param description - Workout description
   */
  withDescription(description: string): this {
    this.workout.description = description;
    return this;
  }

  /**
   * Set random workout description
   */
  withRandomDescription(): this {
    this.workout.description = faker.lorem.sentence();
    return this;
  }

  /**
   * Set workout date
   * @param date - Workout date
   */
  withDate(date: string): this {
    this.workout.date = date;
    return this;
  }

  /**
   * Set random workout date
   */
  withRandomDate(): this {
    this.workout.date = randomDate();
    return this;
  }

  /**
   * Set workout duration
   * @param duration - Duration in seconds
   */
  withDuration(duration: number): this {
    this.workout.duration = duration;
    return this;
  }

  /**
   * Set random workout duration
   */
  withRandomDuration(): this {
    this.workout.duration = randomNumber(300, 10800); // 5 minutes to 3 hours
    return this;
  }

  /**
   * Set workout distance
   * @param distance - Distance in meters
   */
  withDistance(distance: number): this {
    this.workout.distance = distance;
    return this;
  }

  /**
   * Set random workout distance
   */
  withRandomDistance(): this {
    this.workout.distance = randomNumber(1000, 100000); // 1km to 100km
    return this;
  }

  /**
   * Set workout type
   * @param type - Workout type
   */
  withType(type: WorkoutType): this {
    this.workout.type = type;
    return this;
  }

  /**
   * Set random workout type
   */
  withRandomType(): this {
    const types = Object.values(WorkoutType);
    this.workout.type = faker.helpers.arrayElement(types);
    return this;
  }

  /**
   * Set file data
   * @param fileData - File data
   */
  withFileData(fileData: WorkoutFileData): this {
    this.workout.fileData = fileData;
    return this;
  }

  /**
   * Set random file data
   */
  withRandomFileData(): this {
    this.workout.fileData = {
      filename: `${randomString(8)}.${faker.helpers.arrayElement(['gpx', 'tcx', 'fit'])}`,
      content: faker.string.alpha({ length: 1000 }),
      mimeType: faker.helpers.arrayElement([
        'application/gpx+xml',
        'application/tcx+xml',
        'application/octet-stream',
      ]),
    };
    return this;
  }

  /**
   * Build the workout data
   * @returns WorkoutData
   */
  build(): WorkoutData {
    return {
      name: this.workout.name || faker.lorem.words(3),
      description: this.workout.description,
      date: this.workout.date || randomDate(),
      duration: this.workout.duration || randomNumber(300, 10800),
      distance: this.workout.distance,
      type: this.workout.type || WorkoutType.OTHER,
      fileData: this.workout.fileData,
    };
  }

  /**
   * Create a default workout
   * @returns WorkoutData
   */
  static default(): WorkoutData {
    return new WorkoutDataFixture()
      .withName('Test Workout')
      .withDescription('A test workout')
      .withDate('2024-01-15')
      .withDuration(3600)
      .withDistance(10000)
      .withType(WorkoutType.RUN)
      .build();
  }

  /**
   * Create a random workout
   * @returns WorkoutData
   */
  static random(): WorkoutData {
    return new WorkoutDataFixture()
      .withRandomName()
      .withRandomDescription()
      .withRandomDate()
      .withRandomDuration()
      .withRandomDistance()
      .withRandomType()
      .withRandomFileData()
      .build();
  }
}
