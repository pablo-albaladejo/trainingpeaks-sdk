// Functional builder exports
export type { WorkoutStepBuilderState } from './workout-step-builder';
export {
  buildWorkoutStep,
  createWorkoutStepBuilder,
  withDistance,
  withDuration,
  withIntensityClass,
  withName,
  withOpenDuration,
  withTarget,
} from './workout-step-builder';
export type { WorkoutStructureBuilderState } from './workout-structure-builder';
export {
  buildWorkoutStructure,
  createWorkoutStructureBuilder,
  withAverageSpeed,
  withStructureElement,
  withStructureElements,
} from './workout-structure-builder';
export type { WorkoutStructureElementBuilderState } from './workout-structure-element-builder';
export {
  buildWorkoutStructureElement,
  createWorkoutStructureElementBuilder,
  withElementDistance,
  withElementDuration,
  withElementType,
  withStep,
  withSteps,
} from './workout-structure-element-builder';
