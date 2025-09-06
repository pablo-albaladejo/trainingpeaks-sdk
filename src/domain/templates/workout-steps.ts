import {
  buildWorkoutStep,
  createWorkoutStepBuilder,
  withDuration,
  withIntensityClass,
  withName,
  withTarget,
} from '@/domain/builders/workout-step-builder';
import { IntensityClass, type WorkoutStructureStep } from '@/types';

/**
 * Valid intensity range constants (percentage) - inclusive bounds [0, 100]
 */
const MIN_INTENSITY = 0;
const MAX_INTENSITY = 100;

/**
 * Helper function to compute valid intensity range with clamping
 */
const computeIntensityRange = (
  intensityPercent: number
): { minValue: number; maxValue: number } => {
  let minValue = Math.max(MIN_INTENSITY, intensityPercent - 5);
  let maxValue = Math.min(MAX_INTENSITY, intensityPercent + 5);

  // Ensure minValue is less than maxValue by at least 1
  if (minValue >= maxValue) {
    if (maxValue === MAX_INTENSITY) {
      minValue = Math.max(MIN_INTENSITY, maxValue - 1);
    } else {
      maxValue = Math.min(MAX_INTENSITY, minValue + 1);
    }
  }

  return { minValue, maxValue };
};

/**
 * Create a warmup step
 */
export const createWarmupStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Warmup'),
          durationMinutes
        ),
        IntensityClass.WARM_UP
      ),
      45,
      55
    )
  );
};

/**
 * Create a cooldown step
 */
export const createCooldownStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Cooldown'),
          durationMinutes
        ),
        IntensityClass.COOL_DOWN
      ),
      35,
      45
    )
  );
};

/**
 * Create an interval step
 */
export const createIntervalStep = (
  durationMinutes: number,
  intensityPercent: number
): WorkoutStructureStep => {
  const { minValue, maxValue } = computeIntensityRange(intensityPercent);

  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Interval'),
          durationMinutes
        ),
        IntensityClass.ACTIVE
      ),
      minValue,
      maxValue
    )
  );
};

/**
 * Create a recovery step
 */
export const createRecoveryStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Recovery'),
          durationMinutes
        ),
        IntensityClass.REST
      ),
      55,
      65
    )
  );
};

/**
 * Create a steady step
 */
export const createSteadyStep = (
  durationMinutes: number,
  intensityPercent: number
): WorkoutStructureStep => {
  const { minValue, maxValue } = computeIntensityRange(intensityPercent);

  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Steady'),
          durationMinutes
        ),
        IntensityClass.ACTIVE
      ),
      minValue,
      maxValue
    )
  );
};
