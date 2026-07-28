import { ValidationError } from '@/domain/errors/domain-errors';
import { IntensityClass, LengthUnit, type WorkoutStructureStep } from '@/types';

/**
 * Functional builder state for workout structure steps
 */
export type WorkoutStepBuilderState = WorkoutStructureStep;

/**
 * Create initial workout step builder state
 */
export const createWorkoutStepBuilder = (): WorkoutStepBuilderState => ({
  name: '',
  length: { value: 0, unit: LengthUnit.MINUTE },
  targets: [],
  intensityClass: IntensityClass.ACTIVE,
  openDuration: false,
});

/**
 * Set step name
 */
export const withName = (
  builder: WorkoutStepBuilderState,
  name: string
): WorkoutStepBuilderState => ({
  ...builder,
  name,
});

/**
 * Set step duration in minutes
 */
export const withDuration = (
  builder: WorkoutStepBuilderState,
  minutes: number
): WorkoutStepBuilderState => ({
  ...builder,
  length: { value: minutes, unit: LengthUnit.MINUTE },
});

/**
 * Set step distance
 */
export const withDistance = (
  builder: WorkoutStepBuilderState,
  value: number,
  unit: LengthUnit = LengthUnit.KILOMETER
): WorkoutStepBuilderState => ({
  ...builder,
  length: { value, unit },
});

/**
 * Add target to step
 */
export const withTarget = (
  builder: WorkoutStepBuilderState,
  minValue: number,
  maxValue: number
): WorkoutStepBuilderState => {
  // Validate that both values are non-negative
  if (minValue < 0) {
    throw new ValidationError(
      'Minimum target value must be non-negative',
      'minValue'
    );
  }

  if (maxValue < 0) {
    throw new ValidationError(
      'Maximum target value must be non-negative',
      'maxValue'
    );
  }

  // Validate that minValue is less than maxValue
  if (minValue >= maxValue) {
    throw new ValidationError(
      'Minimum target value must be less than maximum target value',
      'target'
    );
  }

  return {
    ...builder,
    targets: [...builder.targets, { minValue, maxValue }],
  };
};

/**
 * Set intensity class
 */
export const withIntensityClass = (
  builder: WorkoutStepBuilderState,
  intensityClass: IntensityClass
): WorkoutStepBuilderState => ({
  ...builder,
  intensityClass,
});

/**
 * Set open duration flag
 */
export const withOpenDuration = (
  builder: WorkoutStepBuilderState,
  open: boolean = true
): WorkoutStepBuilderState => ({
  ...builder,
  openDuration: open,
});

/**
 * Build final workout step
 */
export const buildWorkoutStep = (
  builder: WorkoutStepBuilderState
): WorkoutStructureStep => ({
  ...builder,
});
