import { WorkoutStepBuilder } from '@/domain/builders/workout-step-builder';
import { IntensityClass, type WorkoutStructureStep } from '@/types';

/**
 * Create a warmup step
 */
export const createWarmupStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return new WorkoutStepBuilder()
    .name('Warmup')
    .duration(durationMinutes)
    .intensityClass(IntensityClass.WARM_UP)
    .addTarget(45, 55)
    .build();
};

/**
 * Create a cooldown step
 */
export const createCooldownStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return new WorkoutStepBuilder()
    .name('Cooldown')
    .duration(durationMinutes)
    .intensityClass(IntensityClass.COOL_DOWN)
    .addTarget(35, 45)
    .build();
};

/**
 * Create an interval step
 */
export const createIntervalStep = (
  durationMinutes: number,
  intensityPercent: number
): WorkoutStructureStep => {
  return new WorkoutStepBuilder()
    .name('Interval')
    .duration(durationMinutes)
    .intensityClass(IntensityClass.ACTIVE)
    .addTarget(intensityPercent - 5, intensityPercent + 5)
    .build();
};

/**
 * Create a recovery step
 */
export const createRecoveryStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return new WorkoutStepBuilder()
    .name('Recovery')
    .duration(durationMinutes)
    .intensityClass(IntensityClass.REST)
    .addTarget(55, 65)
    .build();
};

/**
 * Create a steady step
 */
export const createSteadyStep = (
  durationMinutes: number,
  intensityPercent: number
): WorkoutStructureStep => {
  return new WorkoutStepBuilder()
    .name('Steady')
    .duration(durationMinutes)
    .intensityClass(IntensityClass.ACTIVE)
    .addTarget(intensityPercent - 5, intensityPercent + 5)
    .build();
};
