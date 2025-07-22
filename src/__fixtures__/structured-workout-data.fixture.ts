/**
 * Structured Workout Data Fixture
 * Factory pattern fixtures for creating structured workout data using rosie and faker
 *
 * This fixture demonstrates complex nested structures with proper builder separation:
 * - WorkoutStep builders for individual workout steps
 * - WorkoutStructureElement builders for structure elements
 * - WorkoutStructure builder for complete workout structures
 * - Proper use of domain factory functions
 * - Dependencies between related attributes
 */

import {
  createWorkoutLength,
  createWorkoutStep,
  createWorkoutStructure,
  createWorkoutStructureElement,
} from '@/infrastructure/services/domain-factories';
import { CreateStructuredWorkoutRequest } from '@/types/index';
import { Factory } from 'rosie';
import { randomNumber } from './utils.fixture';

/**
 * WorkoutTarget Builder
 * Creates workout target objects for intensity zones
 */
export const workoutTargetBuilder = new Factory()
  .attr('min', () => randomNumber(50, 95))
  .attr('max', () => randomNumber(60, 100))
  .option('min', 60)
  .option('max', 80)
  .after((target) => {
    // Ensure max is always greater than min
    if (target.max <= target.min) {
      target.max = target.min + randomNumber(5, 20);
    }
    return target;
  });

/**
 * WorkoutStep Builder
 * Creates individual workout steps with proper domain factory usage
 */
export const workoutStepBuilder = new Factory()
  .attr('name', () => `Step ${randomNumber(1, 10)}`)
  .attr('length', () => createWorkoutLength(randomNumber(300, 3600), 'second'))
  .attr('targets', () => [workoutTargetBuilder.build()])
  .attr('type', () => 'active')
  .option('name', 'Default Step')
  .option('duration', 600)
  .option('targetMin', 70)
  .option('targetMax', 85)
  .option('stepType', 'active')
  .after((step, options) => {
    // Use domain factory to create proper step
    return createWorkoutStep(
      options.name || step.name,
      createWorkoutLength(options.duration || step.length.value, 'second'),
      [
        workoutTargetBuilder.build({
          min: options.targetMin,
          max: options.targetMax,
        }),
      ],
      options.stepType || step.type
    );
  });

/**
 * WorkoutStructureElement Builder
 * Creates structure elements that contain workout steps
 */
export const workoutStructureElementBuilder = new Factory()
  .attr('type', () => 'step')
  .attr('length', () => createWorkoutLength(randomNumber(300, 3600), 'second'))
  .attr('steps', () => [workoutStepBuilder.build()])
  .attr('startTime', () => 0)
  .attr('endTime', () => randomNumber(600, 3600))
  .option('elementType', 'step')
  .option('duration', 1200)
  .option('stepCount', 1)
  .after((element, options) => {
    const steps = Array.from({ length: options.stepCount || 1 }, () =>
      workoutStepBuilder.build()
    );

    return createWorkoutStructureElement(
      options.elementType || element.type,
      createWorkoutLength(options.duration || element.length.value, 'second'),
      steps,
      element.startTime,
      element.endTime
    );
  });

/**
 * WorkoutStructure Builder
 * Creates complete workout structures with multiple elements
 * Demonstrates complex nested structure creation
 */
export const workoutStructureBuilder = new Factory()
  .attr('elements', () => [
    workoutStructureElementBuilder.build({
      elementType: 'step',
      duration: 600,
      stepCount: 1,
    }),
    workoutStructureElementBuilder.build({
      elementType: 'step',
      duration: 1200,
      stepCount: 1,
    }),
    workoutStructureElementBuilder.build({
      elementType: 'step',
      duration: 300,
      stepCount: 1,
    }),
  ])
  .attr('transitions', () => [
    [0, 0],
    [600, 0],
    [1800, 0],
    [2100, 0],
  ])
  .attr('lengthType', () => 'duration')
  .attr('intensityType', () => 'percentOfThresholdPace')
  .attr('targetType', () => 'target')
  .option('elementCount', 3)
  .option('includeWarmup', true)
  .option('includeCooldown', true)
  .after((structure, options) => {
    const elements = [];

    // Add warmup if requested
    if (options.includeWarmup) {
      const warmupElement = workoutStructureElementBuilder.build({
        elementType: 'step',
        duration: 600,
        stepCount: 1,
      });
      elements.push(warmupElement);
    }

    // Add main elements
    const mainElementCount =
      options.elementCount -
      (options.includeWarmup ? 1 : 0) -
      (options.includeCooldown ? 1 : 0);
    for (let i = 0; i < mainElementCount; i++) {
      const element = workoutStructureElementBuilder.build({
        elementType: 'step',
        duration: 1200,
        stepCount: 1,
      });
      elements.push(element);
    }

    // Add cooldown if requested
    if (options.includeCooldown) {
      const cooldownElement = workoutStructureElementBuilder.build({
        elementType: 'step',
        duration: 300,
        stepCount: 1,
      });
      elements.push(cooldownElement);
    }

    // Build transitions array
    const transitions = [[0, 0]];
    let time = 0;
    for (const element of elements) {
      time += element.length.value;
      transitions.push([time, 0]);
    }

    return createWorkoutStructure(
      elements,
      transitions,
      structure.lengthType,
      structure.intensityType,
      structure.targetType
    );
  });

/**
 * CreateStructuredWorkoutRequest Builder
 * Creates structured workout request data with proper structure dependencies
 */
export const structuredWorkoutRequestBuilder =
  new Factory<CreateStructuredWorkoutRequest>()
    .attr('athleteId', () => randomNumber(1000, 9999))
    .attr('title', () => `Test Structured Workout ${randomNumber(1, 100)}`)
    .attr('workoutTypeValueId', () => randomNumber(1, 5))
    .attr('workoutDay', () => {
      const date = new Date(
        Date.now() + randomNumber(-30, 30) * 24 * 60 * 60 * 1000
      );
      return date.toISOString().split('T')[0] + 'T00:00:00';
    })
    .attr('structure', () => workoutStructureBuilder.build())
    .attr('metadata', () => undefined)
    .option('includeWarmup', true)
    .option('includeCooldown', true)
    .option('elementCount', 3)
    .after((request, options) => {
      // Create structure with options
      const structure = workoutStructureBuilder.build({
        includeWarmup: options.includeWarmup,
        includeCooldown: options.includeCooldown,
        elementCount: options.elementCount,
      });

      return {
        ...request,
        structure,
      };
    });

/**
 * Predefined Structure Builders for Common Workout Types
 * These demonstrate reusable builders for common patterns
 */

/**
 * Simple Workout Structure Builder
 * Creates a basic 3-step workout: warmup, main, cooldown
 */
export const simpleWorkoutStructureBuilder = new Factory()
  .extend(workoutStructureBuilder)
  .option('includeWarmup', true)
  .option('includeCooldown', true)
  .option('elementCount', 1);

/**
 * Interval Workout Structure Builder
 * Creates interval workouts with multiple high-intensity periods
 */
export const intervalWorkoutStructureBuilder = new Factory()
  .extend(workoutStructureBuilder)
  .option('intervalCount', 5)
  .option('intervalDuration', 300)
  .option('restDuration', 180)
  .after((_, options) => {
    const elements = [];

    // Warmup
    elements.push(
      workoutStructureElementBuilder.build({
        elementType: 'step',
        duration: 600,
        stepCount: 1,
      })
    );

    // Intervals
    for (let i = 0; i < options.intervalCount; i++) {
      // High intensity interval
      elements.push(
        workoutStructureElementBuilder.build({
          elementType: 'step',
          duration: options.intervalDuration,
          stepCount: 1,
        })
      );

      // Rest period (except after last interval)
      if (i < options.intervalCount - 1) {
        elements.push(
          workoutStructureElementBuilder.build({
            elementType: 'step',
            duration: options.restDuration,
            stepCount: 1,
          })
        );
      }
    }

    // Cooldown
    elements.push(
      workoutStructureElementBuilder.build({
        elementType: 'step',
        duration: 300,
        stepCount: 1,
      })
    );

    // Build transitions
    const transitions = [[0, 0]];
    let time = 0;
    for (const element of elements) {
      time += element.length.value;
      transitions.push([time, 0]);
    }

    return createWorkoutStructure(
      elements,
      transitions,
      'duration',
      'percentOfThresholdPace',
      'target'
    );
  });
