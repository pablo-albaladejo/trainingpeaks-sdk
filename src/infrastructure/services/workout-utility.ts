/**
 * Workout Utility Service Implementation
 */

import {
  DEFAULT_WORKOUT_TYPE,
  WORKOUT_FILE_CONFIG,
  WORKOUT_TYPE_MAPPING,
} from '@/application/services/workout-constants';
import type {
  SimpleWorkoutElement,
  WorkoutUtilityServiceFactory,
} from '@/application/services/workout-utility';
import { WorkoutLength } from '@/domain/value-objects/workout-length';
import { WorkoutStep } from '@/domain/value-objects/workout-step';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import { WorkoutTarget } from '@/domain/value-objects/workout-target';

/**
 * IMPLEMENTATION of WorkoutUtilityService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutUtilityService: WorkoutUtilityServiceFactory = () => {
  return {
    generateWorkoutId: (): string => {
      return `workout_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').substring(0, 13)}`;
    },

    mapWorkoutTypeToActivityType: (workoutTypeValueId: number): string => {
      // Additional null safety checks
      if (workoutTypeValueId === null || workoutTypeValueId === undefined) {
        return DEFAULT_WORKOUT_TYPE;
      }

      if (
        typeof workoutTypeValueId !== 'number' ||
        !Number.isInteger(workoutTypeValueId)
      ) {
        return DEFAULT_WORKOUT_TYPE;
      }

      return (
        WORKOUT_TYPE_MAPPING[
          workoutTypeValueId as keyof typeof WORKOUT_TYPE_MAPPING
        ] || DEFAULT_WORKOUT_TYPE
      );
    },

    getMimeTypeFromFileName: (fileName: string): string => {
      // Additional null safety checks
      if (fileName === null || fileName === undefined) {
        return WORKOUT_FILE_CONFIG.DEFAULT_MIME_TYPE;
      }

      if (typeof fileName !== 'string') {
        return WORKOUT_FILE_CONFIG.DEFAULT_MIME_TYPE;
      }

      if (fileName.trim().length === 0) {
        return WORKOUT_FILE_CONFIG.DEFAULT_MIME_TYPE;
      }

      const extension = fileName.toLowerCase().split('.').pop();

      if (!extension) {
        return WORKOUT_FILE_CONFIG.DEFAULT_MIME_TYPE;
      }

      return (
        WORKOUT_FILE_CONFIG.MIME_TYPE_MAPPING[
          extension as keyof typeof WORKOUT_FILE_CONFIG.MIME_TYPE_MAPPING
        ] || WORKOUT_FILE_CONFIG.DEFAULT_MIME_TYPE
      );
    },

    buildStructureFromSimpleElements: (
      elements: SimpleWorkoutElement[]
    ): WorkoutStructure => {
      // Additional null safety checks
      if (elements === null || elements === undefined) {
        throw new Error('Elements cannot be null or undefined');
      }

      if (!Array.isArray(elements)) {
        throw new Error('Elements must be an array');
      }

      if (elements.length === 0) {
        throw new Error('Elements array cannot be empty');
      }

      // Validate each element
      elements.forEach((element, index) => {
        if (element === null || element === undefined) {
          throw new Error(
            `Element at index ${index} cannot be null or undefined`
          );
        }

        if (typeof element !== 'object') {
          throw new Error(`Element at index ${index} must be an object`);
        }

        if (
          !element.type ||
          (element.type !== 'step' && element.type !== 'repetition')
        ) {
          throw new Error(
            `Element at index ${index} must have a valid type ('step' or 'repetition')`
          );
        }

        if (!element.steps || !Array.isArray(element.steps)) {
          throw new Error(
            `Element at index ${index} must have a valid steps array`
          );
        }

        if (element.steps.length === 0) {
          throw new Error(
            `Element at index ${index} must have at least one step`
          );
        }

        // Validate each step
        element.steps.forEach((step, stepIndex) => {
          if (step === null || step === undefined) {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} cannot be null or undefined`
            );
          }

          if (typeof step !== 'object') {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} must be an object`
            );
          }

          if (!step.name || typeof step.name !== 'string') {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} must have a valid name`
            );
          }

          if (step.name.trim().length === 0) {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} name cannot be empty`
            );
          }

          if (typeof step.duration !== 'number' || step.duration <= 0) {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} must have a valid positive duration`
            );
          }

          if (typeof step.intensityMin !== 'number' || step.intensityMin < 0) {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} must have a valid intensityMin`
            );
          }

          if (typeof step.intensityMax !== 'number' || step.intensityMax < 0) {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} must have a valid intensityMax`
            );
          }

          if (step.intensityMax < step.intensityMin) {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} intensityMax must be greater than or equal to intensityMin`
            );
          }

          if (
            !step.intensityClass ||
            !['active', 'rest', 'warmUp', 'coolDown'].includes(
              step.intensityClass
            )
          ) {
            throw new Error(
              `Step at index ${stepIndex} in element ${index} must have a valid intensityClass`
            );
          }
        });

        // Validate repetitions for repetition type
        if (element.type === 'repetition') {
          if (
            element.repetitions !== undefined &&
            element.repetitions !== null
          ) {
            if (
              typeof element.repetitions !== 'number' ||
              !Number.isInteger(element.repetitions) ||
              element.repetitions <= 0
            ) {
              throw new Error(
                `Element at index ${index} must have a positive integer repetitions value`
              );
            }
          }
        }
      });

      const structureElements = elements.map((element, index) => {
        const steps = element.steps.map((step) =>
          WorkoutStep.create(
            step.name,
            WorkoutLength.create(step.duration, 'second'),
            [WorkoutTarget.create(step.intensityMin, step.intensityMax)],
            step.intensityClass
          )
        );

        const totalDuration = element.steps.reduce(
          (sum, step) => sum + step.duration,
          0
        );
        const repetitions =
          element.type === 'repetition' ? element.repetitions || 1 : 1;
        const elementDuration = totalDuration * repetitions;

        // Calculate begin and end times
        const beginTime = elements
          .slice(0, index)
          .reduce((sum, prevElement) => {
            const prevTotalDuration = prevElement.steps.reduce(
              (s, step) => s + step.duration,
              0
            );
            const prevRepetitions =
              prevElement.type === 'repetition'
                ? prevElement.repetitions || 1
                : 1;
            return sum + prevTotalDuration * prevRepetitions;
          }, 0);

        return {
          type: element.type,
          length: WorkoutLength.create(
            repetitions,
            element.type === 'repetition' ? 'repetition' : 'second'
          ),
          steps,
          begin: beginTime,
          end: beginTime + elementDuration,
        };
      });

      // Generate polyline (simplified - just a flat line)
      const polyline = [
        [0, 0],
        [1, 0],
      ];

      // Create the structure
      return WorkoutStructure.create(
        structureElements,
        polyline,
        'duration',
        'percentOfThresholdPace',
        'range'
      );
    },
  };
};
