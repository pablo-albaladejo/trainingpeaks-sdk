// Legacy class exports for backward compatibility
export { WorkoutStepBuilder } from './workout-step-builder';
export { WorkoutStructureBuilder } from './workout-structure-builder';
export { WorkoutStructureElementBuilder } from './workout-structure-element-builder';

// New functional builder exports
export {
  buildWorkoutStep,
  createWorkoutStepBuilder,
  withDistance,
  withDuration,
  withIntensityClass,
  withName,
  withOpenDuration,
  withTarget,
  type WorkoutStepBuilderState,
} from './workout-step-builder';
export {
  buildWorkoutStructure,
  createWorkoutStructureBuilder,
  withAverageSpeed,
  withStructureElement,
  withStructureElements,
  type WorkoutStructureBuilderState,
} from './workout-structure-builder';
export {
  buildWorkoutStructureElement,
  createWorkoutStructureElementBuilder,
  withElementDistance,
  withElementDuration,
  withElementType,
  withStep,
  withSteps,
  type WorkoutStructureElementBuilderState,
} from './workout-structure-element-builder';
