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

/**
 * Legacy class-based builder for backward compatibility
 * @deprecated Use functional builder functions instead
 */
export class WorkoutStructureElementBuilder {
  private readonly element: WorkoutStructureElement = {
    type: ElementType.STEP,
    steps: [],
    length: { value: 0, unit: LengthUnit.MINUTE },
    begin: 0,
    end: 0,
  };

  type(type: ElementType): this {
    this.element.type = type;
    return this;
  }

  addStep(step: WorkoutStructureStep): this {
    this.element.steps.push(step);
    return this;
  }

  addSteps(steps: WorkoutStructureStep[]): this {
    this.element.steps.push(...steps);
    return this;
  }

  duration(minutes: number): this {
    this.element.length = { value: minutes, unit: LengthUnit.MINUTE };
    return this;
  }

  distance(value: number, unit: LengthUnit = LengthUnit.KILOMETER): this {
    this.element.length = { value, unit };
    return this;
  }

  build(): WorkoutStructureElement {
    return { ...this.element };
  }
}
