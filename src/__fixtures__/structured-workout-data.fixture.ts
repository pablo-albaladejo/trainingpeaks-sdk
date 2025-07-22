/**
 * Structured Workout Data Fixture
 * Provides test data for structured workout operations
 */

import type { WorkoutStructure, WorkoutStructureElement } from '@/domain';
import {
  createWorkoutLength,
  createWorkoutStep,
  createWorkoutStructure,
  createWorkoutStructureElement,
  createWorkoutTarget,
} from '@/infrastructure/services/domain-factories';
import { CreateStructuredWorkoutRequest } from '@/types/index';
import { randomNumber } from './utils.fixture';

export class StructuredWorkoutDataFixture {
  private athleteId: number = randomNumber(1000, 9999);
  private title: string = 'Test Structured Workout';
  private workoutTypeValueId: number = 3; // Running
  private workoutDay: string =
    new Date().toISOString().split('T')[0] + 'T00:00:00';
  private structure: WorkoutStructure = this.createDefaultStructure();
  private metadata: CreateStructuredWorkoutRequest['metadata'] = undefined;

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
    metadata: CreateStructuredWorkoutRequest['metadata']
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

  public build(): CreateStructuredWorkoutRequest {
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
    const warmUpStep = createWorkoutStep(
      'Warm-up',
      createWorkoutLength(600, 'second'), // 10 minutes
      [createWorkoutTarget(60, 70)],
      'warmUp'
    );

    const mainSetStep = createWorkoutStep(
      'Main Set',
      createWorkoutLength(1200, 'second'), // 20 minutes
      [createWorkoutTarget(80, 90)],
      'active'
    );

    const coolDownStep = createWorkoutStep(
      'Cool-down',
      createWorkoutLength(300, 'second'), // 5 minutes
      [createWorkoutTarget(50, 60)],
      'coolDown'
    );

    const step1Element = createWorkoutStructureElement(
      'step',
      createWorkoutLength(600, 'second'),
      [warmUpStep],
      0,
      600
    );

    const step2Element = createWorkoutStructureElement(
      'step',
      createWorkoutLength(1200, 'second'),
      [mainSetStep],
      600,
      1800
    );

    const step3Element = createWorkoutStructureElement(
      'step',
      createWorkoutLength(300, 'second'),
      [coolDownStep],
      1800,
      2100
    );

    return createWorkoutStructure(
      [step1Element, step2Element, step3Element],
      [
        [0, 0],
        [600, 0],
        [1800, 0],
        [2100, 0],
      ],
      'duration',
      'percentOfThresholdPace',
      'target'
    );
  }

  private createRandomStructure(): WorkoutStructure {
    const stepCount = randomNumber(2, 5);
    const elements: WorkoutStructureElement[] = [];
    let currentTime = 0;

    for (let i = 0; i < stepCount; i++) {
      const stepDuration = randomNumber(300, 1800); // 5-30 minutes
      const stepName = `Step ${i + 1}`;
      const intensityClass = this.getRandomIntensityClass();

      const minValue = randomNumber(60, 85);
      const maxValue = randomNumber(minValue + 5, 100);
      const step = createWorkoutStep(
        stepName,
        createWorkoutLength(stepDuration, 'second'),
        [createWorkoutTarget(minValue, maxValue)],
        intensityClass
      );

      const element = createWorkoutStructureElement(
        'step',
        createWorkoutLength(stepDuration, 'second'),
        [step],
        currentTime,
        currentTime + stepDuration
      );

      elements.push(element);
      currentTime += stepDuration;
    }

    const polyline = elements.map((_, index) => [
      (index / elements.length) * 100,
      randomNumber(0, 100),
    ]);

    return createWorkoutStructure(
      elements,
      polyline,
      'duration',
      'percentOfThresholdPace',
      'target'
    );
  }

  private getRandomIntensityClass(): 'active' | 'rest' | 'warmUp' | 'coolDown' {
    const classes: ('active' | 'rest' | 'warmUp' | 'coolDown')[] = [
      'active',
      'rest',
      'warmUp',
      'coolDown',
    ];
    return classes[randomNumber(0, classes.length - 1)] || 'active';
  }

  public static default(): CreateStructuredWorkoutRequest {
    return new StructuredWorkoutDataFixture().build();
  }

  public static random(): CreateStructuredWorkoutRequest {
    return new StructuredWorkoutDataFixture().withRandomData().build();
  }

  public static withIntervals(): CreateStructuredWorkoutRequest {
    // Create a workout with intervals
    const warmUpStep = createWorkoutStep(
      'Warm-up',
      createWorkoutLength(300, 'second'), // 5 minutes
      [createWorkoutTarget(60, 70)],
      'warmUp'
    );

    const intervalStep = createWorkoutStep(
      'Interval',
      createWorkoutLength(120, 'second'), // 2 minutes
      [createWorkoutTarget(85, 95)],
      'active'
    );

    const restStep = createWorkoutStep(
      'Rest',
      createWorkoutLength(60, 'second'), // 1 minute
      [createWorkoutTarget(50, 60)],
      'rest'
    );

    const coolDownStep = createWorkoutStep(
      'Cool-down',
      createWorkoutLength(300, 'second'), // 5 minutes
      [createWorkoutTarget(60, 70)],
      'coolDown'
    );

    // Create repetition element for intervals
    const repetitionElement = createWorkoutStructureElement(
      'repetition',
      createWorkoutLength(4, 'repetition'),
      [intervalStep, restStep],
      300, // Start after warm-up
      300 + 4 * (120 + 60) // 4 intervals * (2min + 1min rest)
    );

    const warmUpElement = createWorkoutStructureElement(
      'step',
      createWorkoutLength(300, 'second'),
      [warmUpStep],
      0,
      300
    );

    const coolDownElement = createWorkoutStructureElement(
      'step',
      createWorkoutLength(300, 'second'),
      [coolDownStep],
      300 + 4 * (120 + 60), // After intervals
      300 + 4 * (120 + 60) + 300 // After cool-down
    );

    const structure = createWorkoutStructure(
      [warmUpElement, repetitionElement, coolDownElement],
      [
        [0, 0],
        [300, 0],
        [300 + 4 * (120 + 60), 0],
        [300 + 4 * (120 + 60) + 300, 0],
      ],
      'duration',
      'percentOfThresholdPace',
      'target'
    );

    return new StructuredWorkoutDataFixture()
      .withTitle('Interval Training Workout')
      .withStructure(structure)
      .withMetadata({
        description: 'A challenging interval workout with 4x2min intervals',
        userTags: 'interval, running, advanced',
        plannedMetrics: {
          totalTimePlanned: 0.5, // 30 minutes
          tssPlanned: 85.5,
          ifPlanned: 0.85,
        },
      })
      .build();
  }

  public static defaultCreateRequest(): CreateStructuredWorkoutRequest {
    return new StructuredWorkoutDataFixture().buildCreateRequest();
  }

  public static randomCreateRequest(): CreateStructuredWorkoutRequest {
    return new StructuredWorkoutDataFixture()
      .withRandomData()
      .buildCreateRequest();
  }
}
