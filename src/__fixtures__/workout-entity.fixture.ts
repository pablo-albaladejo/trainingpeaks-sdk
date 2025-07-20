/**
 * Workout Entity Fixtures
 * Provides test data for the Workout domain entity
 */

import { Workout } from '@/domain/entities/workout';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import { faker } from '@faker-js/faker';
import { StructuredWorkoutDataFixture } from './structured-workout-data.fixture';
import { randomNumber } from './utils.fixture';

/**
 * Workout Entity Fixture
 */
export class WorkoutFixture {
  private workout: Partial<{
    id: string;
    name: string;
    description: string;
    date: Date;
    duration: number;
    distance: number;
    activityType: string;
    tags: string[];
    fileContent: string;
    fileName: string;
    createdAt: Date;
    updatedAt: Date;
    structure: WorkoutStructure;
  }> = {};

  withId(id: string): this {
    this.workout.id = id;
    return this;
  }

  withRandomId(): this {
    this.workout.id = faker.string.uuid();
    return this;
  }

  withName(name: string): this {
    this.workout.name = name;
    return this;
  }

  withRandomName(): this {
    this.workout.name = faker.lorem.words(3);
    return this;
  }

  withDescription(description: string): this {
    this.workout.description = description;
    return this;
  }

  withRandomDescription(): this {
    this.workout.description = faker.lorem.sentence();
    return this;
  }

  withDate(date: Date): this {
    this.workout.date = date;
    return this;
  }

  withRandomDate(): this {
    this.workout.date = faker.date.recent({ days: 30 });
    return this;
  }

  withTodaysDate(): this {
    this.workout.date = new Date();
    return this;
  }

  withPastDate(): this {
    this.workout.date = faker.date.past();
    return this;
  }

  withFutureDate(): this {
    this.workout.date = faker.date.future();
    return this;
  }

  withDuration(duration: number): this {
    this.workout.duration = duration;
    return this;
  }

  withRandomDuration(): this {
    this.workout.duration = randomNumber(300, 7200); // 5 minutes to 2 hours
    return this;
  }

  withShortDuration(): this {
    this.workout.duration = randomNumber(300, 1799); // Less than 30 minutes
    return this;
  }

  withLongDuration(): this {
    this.workout.duration = randomNumber(7201, 14400); // More than 2 hours
    return this;
  }

  withDistance(distance: number): this {
    this.workout.distance = distance;
    return this;
  }

  withRandomDistance(): this {
    this.workout.distance = randomNumber(1000, 50000); // 1-50km
    return this;
  }

  withActivityType(activityType: string): this {
    this.workout.activityType = activityType;
    return this;
  }

  withRandomActivityType(): this {
    this.workout.activityType = faker.helpers.arrayElement([
      'run',
      'bike',
      'swim',
      'strength',
      'other',
    ]);
    return this;
  }

  withTags(tags: string[]): this {
    this.workout.tags = tags;
    return this;
  }

  withRandomTags(): this {
    this.workout.tags = Array.from({ length: randomNumber(1, 5) }, () =>
      faker.lorem.word()
    );
    return this;
  }

  withFileContent(fileContent: string): this {
    this.workout.fileContent = fileContent;
    return this;
  }

  withRandomFileContent(): this {
    this.workout.fileContent = faker.lorem.paragraphs();
    return this;
  }

  withTcxFileContent(): this {
    this.workout.fileContent =
      '<TrainingCenterDatabase>...</TrainingCenterDatabase>';
    return this;
  }

  withFileName(fileName: string): this {
    this.workout.fileName = fileName;
    return this;
  }

  withRandomFileName(): this {
    const extensions = ['tcx', 'gpx', 'fit'];
    const extension = faker.helpers.arrayElement(extensions);
    this.workout.fileName = `${faker.lorem.word()}.${extension}`;
    return this;
  }

  withCreatedAt(createdAt: Date): this {
    this.workout.createdAt = createdAt;
    return this;
  }

  withRandomCreatedAt(): this {
    this.workout.createdAt = faker.date.past();
    return this;
  }

  withUpdatedAt(updatedAt: Date): this {
    this.workout.updatedAt = updatedAt;
    return this;
  }

  withRandomUpdatedAt(): this {
    this.workout.updatedAt = faker.date.recent();
    return this;
  }

  withStructure(structure: WorkoutStructure): this {
    this.workout.structure = structure;
    // Update duration to match structure
    this.workout.duration = structure.getTotalDuration();
    return this;
  }

  withRandomStructure(): this {
    const structureData = StructuredWorkoutDataFixture.random();
    this.workout.structure = structureData.structure;
    this.workout.duration = structureData.structure.getTotalDuration();
    return this;
  }

  withDefaultStructure(): this {
    const structureData = StructuredWorkoutDataFixture.default();
    this.workout.structure = structureData.structure;
    this.workout.duration = structureData.structure.getTotalDuration();
    return this;
  }

  withIntervalStructure(): this {
    const structureData = StructuredWorkoutDataFixture.withIntervals();
    this.workout.structure = structureData.structure;
    this.workout.duration = structureData.structure.getTotalDuration();
    return this;
  }

  build(): Workout {
    return Workout.create(
      this.workout.id || faker.string.uuid(),
      this.workout.name || faker.lorem.words(3),
      this.workout.description || faker.lorem.sentence(),
      this.workout.date || faker.date.recent({ days: 7 }),
      this.workout.duration || randomNumber(1800, 3600),
      this.workout.distance,
      this.workout.activityType,
      this.workout.tags,
      this.workout.fileContent,
      this.workout.fileName,
      this.workout.createdAt,
      this.workout.updatedAt,
      this.workout.structure
    );
  }

  buildFromFile(): Workout {
    return Workout.fromFile(
      this.workout.id || faker.string.uuid(),
      this.workout.fileName || 'workout.tcx',
      this.workout.fileContent ||
        '<TrainingCenterDatabase>...</TrainingCenterDatabase>',
      {
        name: this.workout.name,
        description: this.workout.description,
        date: this.workout.date,
        duration: this.workout.duration,
        distance: this.workout.distance,
        activityType: this.workout.activityType,
        tags: this.workout.tags,
      }
    );
  }

  buildStructured(): Workout {
    const structure =
      this.workout.structure ||
      StructuredWorkoutDataFixture.default().structure;

    return Workout.createStructured(
      this.workout.id || faker.string.uuid(),
      this.workout.name || faker.lorem.words(3),
      this.workout.description || faker.lorem.sentence(),
      this.workout.date || faker.date.recent({ days: 7 }),
      structure,
      this.workout.activityType,
      this.workout.tags,
      this.workout.createdAt,
      this.workout.updatedAt
    );
  }

  /**
   * Static factory methods
   */
  static default(): Workout {
    return new WorkoutFixture().build();
  }

  static random(): Workout {
    return new WorkoutFixture()
      .withRandomId()
      .withRandomName()
      .withRandomDescription()
      .withRandomDate()
      .withRandomDuration()
      .withRandomDistance()
      .withRandomActivityType()
      .withRandomTags()
      .withRandomCreatedAt()
      .withRandomUpdatedAt()
      .build();
  }

  static fileBasedWorkout(): Workout {
    return new WorkoutFixture()
      .withRandomId()
      .withRandomName()
      .withRandomDescription()
      .withRandomDate()
      .withRandomDuration()
      .withRandomDistance()
      .withRandomActivityType()
      .withRandomTags()
      .withTcxFileContent()
      .withRandomFileName()
      .buildFromFile();
  }

  static structuredWorkout(): Workout {
    return new WorkoutFixture()
      .withRandomId()
      .withRandomName()
      .withRandomDescription()
      .withRandomDate()
      .withRandomActivityType()
      .withRandomTags()
      .withDefaultStructure()
      .buildStructured();
  }

  static intervalWorkout(): Workout {
    return new WorkoutFixture()
      .withRandomId()
      .withName('Interval Training')
      .withDescription('High-intensity interval workout')
      .withRandomDate()
      .withActivityType('run')
      .withTags(['interval', 'high-intensity'])
      .withIntervalStructure()
      .buildStructured();
  }

  static shortWorkout(): Workout {
    return new WorkoutFixture()
      .withRandomId()
      .withName('Quick Workout')
      .withDescription('Short workout session')
      .withRandomDate()
      .withShortDuration()
      .withRandomActivityType()
      .build();
  }

  static longWorkout(): Workout {
    return new WorkoutFixture()
      .withRandomId()
      .withName('Long Endurance Session')
      .withDescription('Extended workout session')
      .withRandomDate()
      .withLongDuration()
      .withRandomDistance()
      .withActivityType('bike')
      .build();
  }

  static recentWorkout(): Workout {
    const oneDayAgo = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
    return new WorkoutFixture()
      .withRandomId()
      .withName('Recent Workout')
      .withDate(oneDayAgo)
      .withRandomDuration()
      .build();
  }
}
