import {
  ElementType,
  LengthUnit,
  type WorkoutStructureElement,
  type WorkoutStructureStep,
} from '@/types';

/**
 * Functional builder state for workout structure elements
 */
export type WorkoutStructureElementBuilderState = WorkoutStructureElement;

/**
 * Create initial workout structure element builder state
 */
export const createWorkoutStructureElementBuilder =
  (): WorkoutStructureElementBuilderState => ({
    type: ElementType.STEP,
    steps: [],
    length: { value: 0, unit: LengthUnit.MINUTE },
    begin: 0,
    end: 0,
  });

/**
 * Set element type
 */
export const withElementType = (
  builder: WorkoutStructureElementBuilderState,
  type: ElementType
): WorkoutStructureElementBuilderState => ({
  ...builder,
  type,
});

/**
 * Add step to element
 */
export const withStep = (
  builder: WorkoutStructureElementBuilderState,
  step: WorkoutStructureStep
): WorkoutStructureElementBuilderState => ({
  ...builder,
  steps: [...builder.steps, step],
});

/**
 * Add multiple steps to element
 */
export const withSteps = (
  builder: WorkoutStructureElementBuilderState,
  steps: WorkoutStructureStep[]
): WorkoutStructureElementBuilderState => ({
  ...builder,
  steps: [...builder.steps, ...steps],
});

/**
 * Set element duration in minutes
 */
export const withElementDuration = (
  builder: WorkoutStructureElementBuilderState,
  minutes: number
): WorkoutStructureElementBuilderState => ({
  ...builder,
  length: { value: minutes, unit: LengthUnit.MINUTE },
});

/**
 * Set element distance
 */
export const withElementDistance = (
  builder: WorkoutStructureElementBuilderState,
  value: number,
  unit: LengthUnit = LengthUnit.KILOMETER
): WorkoutStructureElementBuilderState => ({
  ...builder,
  length: { value, unit },
});

/**
 * Build final workout structure element
 */
export const buildWorkoutStructureElement = (
  builder: WorkoutStructureElementBuilderState
): WorkoutStructureElement => ({
  ...builder,
});
