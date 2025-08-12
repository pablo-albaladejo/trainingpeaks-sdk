import {
  IntensityMetric,
  IntensityTargetType,
  LengthMetric,
  LengthUnit,
  type WorkoutLength,
  type WorkoutStructure,
  type WorkoutStructureElement,
} from '@/types';

/**
 * Functional builder state for workout structures
 */
export type WorkoutStructureBuilderState = {
  readonly structure: WorkoutStructure;
  readonly currentTime: number;
  readonly averageSpeed: number;
};

/**
 * Create initial workout structure builder state
 */
export const createWorkoutStructureBuilder = (
  averageSpeed: number = 25
): WorkoutStructureBuilderState => ({
  structure: {
    structure: [],
    polyline: [],
    primaryLengthMetric: LengthMetric.DURATION,
    primaryIntensityMetric: IntensityMetric.PERCENT_OF_THRESHOLD_POWER,
    primaryIntensityTargetOrRange: IntensityTargetType.TARGET,
  },
  currentTime: 0,
  averageSpeed,
});

/**
 * Set the average speed for distance-based time calculations
 */
export const withAverageSpeed = (
  builder: WorkoutStructureBuilderState,
  speed: number
): WorkoutStructureBuilderState => ({
  ...builder,
  averageSpeed: speed,
});

/**
 * Add element to workout structure
 */
export const withStructureElement = (
  builder: WorkoutStructureBuilderState,
  element: WorkoutStructureElement
): WorkoutStructureBuilderState => {
  // Set timing for the element
  const timedElement = {
    ...element,
    begin: builder.currentTime,
  };

  // Convert length to seconds for time calculation
  const lengthInSeconds = convertLengthToSeconds(
    element.length,
    builder.averageSpeed
  );
  timedElement.end = builder.currentTime + lengthInSeconds;

  // Update current time for next element
  const newCurrentTime = timedElement.end;

  return {
    ...builder,
    structure: {
      ...builder.structure,
      structure: [...builder.structure.structure, timedElement],
    },
    currentTime: newCurrentTime,
  };
};

/**
 * Add multiple elements to workout structure
 */
export const withStructureElements = (
  builder: WorkoutStructureBuilderState,
  elements: WorkoutStructureElement[]
): WorkoutStructureBuilderState => {
  return elements.reduce(
    (acc, element) => withStructureElement(acc, element),
    builder
  );
};

/**
 * Build final workout structure
 */
export const buildWorkoutStructure = (
  builder: WorkoutStructureBuilderState
): WorkoutStructure => ({
  ...builder.structure,
});

/**
 * Convert length to seconds
 */
const convertLengthToSeconds = (
  length: WorkoutLength,
  averageSpeed: number
): number => {
  switch (length.unit) {
    case LengthUnit.SECOND: {
      return length.value;
    }
    case LengthUnit.MINUTE: {
      return length.value * 60;
    }
    case LengthUnit.HOUR: {
      return length.value * 3600;
    }
    case LengthUnit.KILOMETER:
    case LengthUnit.MILE: {
      // For distance-based workouts, estimate time based on average speed
      const distanceInKm =
        length.unit === LengthUnit.MILE ? length.value * 1.60934 : length.value;
      return (distanceInKm / averageSpeed) * 3600;
    }
    default: {
      return length.value * 60; // Default to minutes
    }
  }
};
