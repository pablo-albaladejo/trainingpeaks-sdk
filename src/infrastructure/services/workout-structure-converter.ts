/**
 * Workout Structure Converter Service
 * Converts simplified workout structures to complete structures with calculated timeRange and polyline
 */

import type {
  SimpleWorkoutStructure,
  SimpleWorkoutStructureElement,
  WorkoutStructure,
  WorkoutStructureElement,
} from '@/types';
import { ElementType } from '@/types';

/**
 * Convert a simple workout structure to a complete workout structure
 * Calculates timeRange (begin/end) and polyline coordinates automatically
 */
export const convertSimpleToCompleteStructure = (
  simpleStructure: SimpleWorkoutStructure
): WorkoutStructure => {
  const totalDuration = calculateSimpleStructureDuration(simpleStructure);

  // Convert each element
  const convertedElements = simpleStructure.structure.map(
    (element: SimpleWorkoutStructureElement, index: number) => {
      // Calculate the start time by summing the duration of all previous elements
      const previousElementsDuration = simpleStructure.structure
        .slice(0, index)
        .reduce((total: number, el: SimpleWorkoutStructureElement) => {
          if (el.type === ElementType.REPETITION) {
            // For repetitions, calculate the actual duration of all steps
            const stepsDuration = el.steps.reduce(
              (stepTotal: number, step) => stepTotal + step.length.value,
              0
            );
            return total + stepsDuration * el.length.value;
          }
          return total + el.length.value;
        }, 0);

      return convertSimpleElementToComplete(element, previousElementsDuration);
    }
  );

  return {
    structure: convertedElements,
    polyline: generateSimplePolyline(totalDuration),
    primaryLengthMetric: simpleStructure.primaryLengthMetric,
    primaryIntensityMetric: simpleStructure.primaryIntensityMetric,
    primaryIntensityTargetOrRange: simpleStructure.intensityTargetType,
  };
};

/**
 * Convert a simple structure element to a complete element
 */
export const convertSimpleElementToComplete = (
  element: SimpleWorkoutStructureElement,
  startTime: number
): WorkoutStructureElement => {
  let endTime: number;

  if (element.type === ElementType.REPETITION) {
    // For repetitions, calculate the actual duration of all steps
    const stepsDuration = element.steps.reduce(
      (stepTotal: number, step) => stepTotal + step.length.value,
      0
    );
    endTime = startTime + stepsDuration * element.length.value;
  } else {
    // For non-repetition elements, just add the length value
    endTime = startTime + element.length.value;
  }

  return {
    ...element,
    begin: startTime,
    end: endTime,
    polyline: generateSimplePolyline(endTime - startTime),
  } as WorkoutStructureElement;
};

/**
 * Calculate the total duration of a simple structure
 */
export const calculateSimpleStructureDuration = (
  simpleStructure: SimpleWorkoutStructure
): number => {
  return simpleStructure.structure.reduce(
    (total: number, element: SimpleWorkoutStructureElement) => {
      if (element.type === ElementType.REPETITION) {
        // Validate that repetition elements have steps
        if (!element.steps || element.steps.length === 0) {
          throw new Error(
            `Repetition element must have at least one step. Found ${element.steps?.length || 0} steps.`
          );
        }

        // Calculate total duration of all steps in the repetition
        const stepsDuration = element.steps.reduce(
          (stepTotal: number, step) => stepTotal + step.length.value,
          0
        );

        // Multiply by number of repetitions
        return total + stepsDuration * element.length.value;
      }

      // For non-repetition elements, just add the length value
      return total + element.length.value;
    },
    0
  );
};

/**
 * Generate a simple polyline for visualization
 * In a real implementation, this would generate actual GPS coordinates
 */
const generateSimplePolyline = (duration: number): number[][] => {
  // Generate a simple polyline with basic coordinates
  // This is a placeholder - in reality, you'd generate actual GPS coordinates
  const points: number[][] = [];
  const steps = Math.max(2, Math.floor(duration / 60)); // One point per minute, minimum 2 points

  for (let i = 0; i < steps; i++) {
    const lat = 40.7128 + i * 0.001; // Simple progression
    const lng = -74.006 + i * 0.001;
    points.push([lat, lng]);
  }

  return points;
};
