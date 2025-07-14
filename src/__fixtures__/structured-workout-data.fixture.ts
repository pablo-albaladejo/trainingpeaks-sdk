/**
 * Structured Workout Data Fixture
 * Provides test data for structured workout operations
 */

import { WorkoutLength } from '@/domain/value-objects/workout-length';
import { WorkoutStep } from '@/domain/value-objects/workout-step';
import {
  WorkoutStructure,
  WorkoutStructureElement,
} from '@/domain/value-objects/workout-structure';
import { WorkoutTarget } from '@/domain/value-objects/workout-target';
import { CreateStructuredWorkoutRequest } from '@/types/index';
import { StructuredWorkoutData } from '@/workout/index';
import { randomNumber } from './utils.fixture';

export class StructuredWorkoutDataFixture {
  private athleteId: number = randomNumber(1000, 9999);
  private title: string = 'Test Structured Workout';
  private workoutTypeValueId: number = 3; // Running
  private workoutDay: string =
    new Date().toISOString().split('T')[0] + 'T00:00:00';
  private structure: WorkoutStructure = this.createDefaultStructure();
  private metadata: StructuredWorkoutData['metadata'] = undefined;

  public withAthleteId(athleteId: number): StructuredWorkoutDataFixture {
    this.athleteId = athleteId;
    return this;
  }

  public withTitle(title: string): StructuredWorkoutDataFixture {
    this.title = title;
    return this;
  }

  public withWorkoutTypeValueId(
    workoutTypeValueId: number
  ): StructuredWorkoutDataFixture {
    this.workoutTypeValueId = workoutTypeValueId;
    return this;
  }

  public withWorkoutDay(workoutDay: string): StructuredWorkoutDataFixture {
    this.workoutDay = workoutDay;
    return this;
  }

  public withStructure(
    structure: WorkoutStructure
  ): StructuredWorkoutDataFixture {
    this.structure = structure;
    return this;
  }

  public withMetadata(
    metadata: StructuredWorkoutData['metadata']
  ): StructuredWorkoutDataFixture {
    this.metadata = metadata;
    return this;
  }

  public withRandomData(): StructuredWorkoutDataFixture {
    this.athleteId = randomNumber(1000, 9999);
    this.title = `Random Workout ${randomNumber(1, 100)}`;
    this.workoutTypeValueId = randomNumber(1, 5);
    this.workoutDay =
      new Date(Date.now() + randomNumber(-30, 30) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0] + 'T00:00:00';
    this.structure = this.createRandomStructure();
    return this;
  }

  public build(): StructuredWorkoutData {
    return {
      athleteId: this.athleteId,
      title: this.title,
      workoutTypeValueId: this.workoutTypeValueId,
      workoutDay: this.workoutDay,
      structure: this.structure,
      metadata: this.metadata,
    };
  }

  public buildCreateRequest(): CreateStructuredWorkoutRequest {
    return {
      athleteId: this.athleteId,
      title: this.title,
      workoutTypeValueId: this.workoutTypeValueId,
      workoutDay: this.workoutDay,
      structure: this.structure,
      metadata: this.metadata,
    };
  }

  private createDefaultStructure(): WorkoutStructure {
    // Create a simple 3-step workout: warm-up, main set, cool-down
    const warmUpStep = WorkoutStep.create(
      'Warm-up',
      WorkoutLength.create(600, 'second'), // 10 minutes
      [WorkoutTarget.create(60, 70)],
      'warmUp'
    );

    const mainSetStep = WorkoutStep.create(
      'Main Set',
      WorkoutLength.create(1200, 'second'), // 20 minutes
      [WorkoutTarget.create(80, 90)],
      'active'
    );

    const coolDownStep = WorkoutStep.create(
      'Cool-down',
      WorkoutLength.create(300, 'second'), // 5 minutes
      [WorkoutTarget.create(50, 60)],
      'coolDown'
    );

    const elements: WorkoutStructureElement[] = [
      {
        type: 'step',
        length: WorkoutLength.create(600, 'second'),
        steps: [warmUpStep],
        begin: 0,
        end: 600,
      },
      {
        type: 'step',
        length: WorkoutLength.create(1200, 'second'),
        steps: [mainSetStep],
        begin: 600,
        end: 1800,
      },
      {
        type: 'step',
        length: WorkoutLength.create(300, 'second'),
        steps: [coolDownStep],
        begin: 1800,
        end: 2100,
      },
    ];

    const polyline: number[][] = [
      [0, 0],
      [0.285, 0.65], // Warm-up
      [0.857, 0.85], // Main set
      [1, 0.55], // Cool-down
    ];

    return WorkoutStructure.create(
      elements,
      polyline,
      'duration',
      'percentOfThresholdPace',
      'range'
    );
  }

  private createRandomStructure(): WorkoutStructure {
    const numElements = randomNumber(2, 5);
    const elements: WorkoutStructureElement[] = [];
    let currentTime = 0;

    for (let i = 0; i < numElements; i++) {
      const isRepetition = Math.random() < 0.3; // 30% chance of repetition
      const numSteps = randomNumber(1, 3);
      const steps: WorkoutStep[] = [];

      for (let j = 0; j < numSteps; j++) {
        const duration = randomNumber(60, 600); // 1-10 minutes
        const minIntensity = randomNumber(50, 80);
        const maxIntensity = randomNumber(minIntensity + 5, 100);
        const intensityClass = this.getRandomIntensityClass();
        const name = `${intensityClass} ${duration}s`;

        steps.push(
          WorkoutStep.create(
            name,
            WorkoutLength.create(duration, 'second'),
            [WorkoutTarget.create(minIntensity, maxIntensity)],
            intensityClass
          )
        );
      }

      const elementDuration = steps.reduce(
        (sum, step) => sum + (step.getDurationInSeconds() || 0),
        0
      );
      const repetitions = isRepetition ? randomNumber(2, 4) : 1;
      const totalDuration = elementDuration * repetitions;

      elements.push({
        type: isRepetition ? 'repetition' : 'step',
        length: WorkoutLength.create(
          isRepetition ? repetitions : elementDuration,
          isRepetition ? 'repetition' : 'second'
        ),
        steps,
        begin: currentTime,
        end: currentTime + totalDuration,
      });

      currentTime += totalDuration;
    }

    // Generate random polyline
    const polyline: number[][] = [];
    for (let i = 0; i <= 10; i++) {
      const x = i / 10;
      const y = Math.random() * 0.5 + 0.25; // Random between 0.25 and 0.75
      polyline.push([x, y]);
    }

    return WorkoutStructure.create(
      elements,
      polyline,
      'duration',
      'percentOfThresholdPace',
      'range'
    );
  }

  private getRandomIntensityClass(): 'active' | 'rest' | 'warmUp' | 'coolDown' {
    const classes: ('active' | 'rest' | 'warmUp' | 'coolDown')[] = [
      'active',
      'rest',
      'warmUp',
      'coolDown',
    ];
    return classes[randomNumber(0, classes.length - 1)];
  }

  /**
   * Create a default structured workout
   */
  public static default(): StructuredWorkoutData {
    return new StructuredWorkoutDataFixture().build();
  }

  /**
   * Create a random structured workout
   */
  public static random(): StructuredWorkoutData {
    return new StructuredWorkoutDataFixture().withRandomData().build();
  }

  /**
   * Create a structured workout with intervals
   */
  public static withIntervals(): StructuredWorkoutData {
    const fixture = new StructuredWorkoutDataFixture();

    // Create interval structure
    const warmUpStep = WorkoutStep.create(
      'Warm-up',
      WorkoutLength.create(600, 'second'),
      [WorkoutTarget.create(60, 70)],
      'warmUp'
    );

    const intervalStep = WorkoutStep.create(
      'Interval',
      WorkoutLength.create(240, 'second'), // 4 minutes
      [WorkoutTarget.create(85, 95)],
      'active'
    );

    const recoveryStep = WorkoutStep.create(
      'Recovery',
      WorkoutLength.create(120, 'second'), // 2 minutes
      [WorkoutTarget.create(65, 75)],
      'rest'
    );

    const coolDownStep = WorkoutStep.create(
      'Cool-down',
      WorkoutLength.create(300, 'second'),
      [WorkoutTarget.create(50, 60)],
      'coolDown'
    );

    const elements: WorkoutStructureElement[] = [
      {
        type: 'step',
        length: WorkoutLength.create(600, 'second'),
        steps: [warmUpStep],
        begin: 0,
        end: 600,
      },
      {
        type: 'repetition',
        length: WorkoutLength.create(5, 'repetition'),
        steps: [intervalStep, recoveryStep],
        begin: 600,
        end: 2400, // 5 * (240 + 120) = 1800 + 600 = 2400
      },
      {
        type: 'step',
        length: WorkoutLength.create(300, 'second'),
        steps: [coolDownStep],
        begin: 2400,
        end: 2700,
      },
    ];

    const polyline: number[][] = [
      [0, 0],
      [0.222, 0.65], // Warm-up
      [0.259, 0.9], // First interval
      [0.303, 0.7], // First recovery
      [0.37, 0.9], // Second interval
      [0.414, 0.7], // Second recovery
      [0.481, 0.9], // Third interval
      [0.525, 0.7], // Third recovery
      [0.592, 0.9], // Fourth interval
      [0.636, 0.7], // Fourth recovery
      [0.703, 0.9], // Fifth interval
      [0.747, 0.7], // Fifth recovery
      [0.889, 0.55], // Cool-down start
      [1, 0.55], // Cool-down end
    ];

    const structure = WorkoutStructure.create(
      elements,
      polyline,
      'duration',
      'percentOfThresholdPace',
      'range'
    );

    return fixture
      .withTitle('Interval Training')
      .withStructure(structure)
      .withMetadata({
        description: 'High-intensity interval training workout',
        userTags: 'intervals, high-intensity, cardio',
        plannedMetrics: {
          totalTimePlanned: 45, // 45 minutes
          tssPlanned: 95.5,
          ifPlanned: 0.85,
        },
      })
      .build();
  }

  /**
   * Create a create request with default data
   */
  public static defaultCreateRequest(): CreateStructuredWorkoutRequest {
    return new StructuredWorkoutDataFixture().buildCreateRequest();
  }

  /**
   * Create a create request with random data
   */
  public static randomCreateRequest(): CreateStructuredWorkoutRequest {
    return new StructuredWorkoutDataFixture()
      .withRandomData()
      .buildCreateRequest();
  }
}
