/**
 * Workout Utility Service Implementation
 */

import type { SimpleWorkoutElement } from '@/application/services/workout-utility';

/**
 * IMPLEMENTATION of WorkoutUtilityService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutUtilityService = () => {
  return {
    generateWorkoutId: (): string => {
      // Generate a unique workout ID
      return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    getMimeTypeFromFileName: (fileName: string): string => {
      const extension = fileName.split('.').pop()?.toLowerCase();

      switch (extension) {
        case 'tcx':
          return 'application/tcx+xml';
        case 'gpx':
          return 'application/gpx+xml';
        case 'fit':
          return 'application/fit';
        case 'json':
          return 'application/json';
        case 'xml':
          return 'application/xml';
        default:
          return 'application/octet-stream';
      }
    },

    mapWorkoutTypeToActivityType: (workoutType: string): string => {
      // Map workout type to activity type
      const typeMapping: Record<string, string> = {
        structured: 'run',
        file: 'bike',
        manual: 'other',
        running: 'run',
        cycling: 'bike',
        swimming: 'swim',
        strength: 'strength',
      };

      return typeMapping[workoutType.toLowerCase()] || 'other';
    },

    buildStructureFromSimpleElements: (
      elements: SimpleWorkoutElement[]
    ): unknown => {
      // Simple implementation - return a basic structure object
      const structureElements = elements.map((element, index) => ({
        type: element.type,
        duration: element.duration,
        intensity: element.intensity,
        description: element.description,
        begin: index * element.duration,
        end: (index + 1) * element.duration,
      }));

      return {
        elements: structureElements,
        totalDuration: structureElements.reduce(
          (sum, el) => sum + el.duration,
          0
        ),
        totalSteps: structureElements.length,
      };
    },
  };
};
