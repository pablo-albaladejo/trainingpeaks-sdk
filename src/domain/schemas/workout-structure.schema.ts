/**
 * Workout Structure Domain Schemas
 * Zod schemas for workout structure validation and serialization
 */

import { z } from 'zod';

// Base schemas
export const WorkoutLengthUnitSchema = z.enum([
  'second',
  'minute',
  'hour',
  'repetition',
  'meter',
  'kilometer',
  'mile',
]);

export const WorkoutIntensityClassSchema = z.enum([
  'active',
  'rest',
  'warmUp',
  'coolDown',
]);

export const WorkoutLengthMetricSchema = z.enum(['duration', 'distance']);

export const WorkoutIntensityMetricSchema = z.enum([
  'percentOfThresholdPace',
  'percentOfThresholdPower',
  'heartRate',
  'power',
  'pace',
  'speed',
]);

export const WorkoutIntensityTargetTypeSchema = z.enum(['target', 'range']);

// Value object schemas
export const WorkoutLengthSchema = z.object({
  value: z.number().nonnegative().finite(),
  unit: WorkoutLengthUnitSchema,
});

export const WorkoutTargetSchema = z
  .object({
    minValue: z.number().nonnegative().finite(),
    maxValue: z.number().nonnegative().finite(),
  })
  .refine((data) => data.minValue <= data.maxValue, {
    message: 'minValue cannot be greater than maxValue',
    path: ['minValue'],
  });

export const WorkoutStepSchema = z
  .object({
    name: z.string().min(1).max(100),
    length: WorkoutLengthSchema,
    targets: z.array(WorkoutTargetSchema),
    intensityClass: WorkoutIntensityClassSchema,
    openDuration: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Allow empty targets for rest steps
      if (data.intensityClass === 'rest') return true;
      return data.targets.length > 0;
    },
    {
      message: 'Non-rest steps must have at least one target',
      path: ['targets'],
    }
  );

export const WorkoutElementTypeSchema = z.enum(['step', 'repetition']);

export const WorkoutStructureElementSchema = z
  .object({
    type: WorkoutElementTypeSchema,
    length: WorkoutLengthSchema,
    steps: z.array(WorkoutStepSchema).min(1),
    begin: z.number().nonnegative(),
    end: z.number().nonnegative(),
  })
  .refine((data) => data.end > data.begin, {
    message: 'end time must be greater than begin time',
    path: ['end'],
  });

// Main workout structure schema
export const WorkoutStructureSchema = z
  .object({
    structure: z.array(WorkoutStructureElementSchema).min(1),
    polyline: z.array(z.array(z.number())),
    primaryLengthMetric: WorkoutLengthMetricSchema,
    primaryIntensityMetric: WorkoutIntensityMetricSchema,
    primaryIntensityTargetOrRange: WorkoutIntensityTargetTypeSchema,
  })
  .refine(
    (data) => {
      // Validate that elements don't overlap
      for (let i = 0; i < data.structure.length - 1; i++) {
        const current = data.structure[i];
        const next = data.structure[i + 1];
        if (current && next && current.end > next.begin) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Workout structure elements cannot overlap',
      path: ['structure'],
    }
  );

// Type exports
export type WorkoutLengthUnit = z.infer<typeof WorkoutLengthUnitSchema>;
export type WorkoutIntensityClass = z.infer<typeof WorkoutIntensityClassSchema>;
export type WorkoutLengthMetric = z.infer<typeof WorkoutLengthMetricSchema>;
export type WorkoutIntensityMetric = z.infer<
  typeof WorkoutIntensityMetricSchema
>;
export type WorkoutIntensityTargetType = z.infer<
  typeof WorkoutIntensityTargetTypeSchema
>;
export type WorkoutLength = z.infer<typeof WorkoutLengthSchema>;
export type WorkoutTarget = z.infer<typeof WorkoutTargetSchema>;
export type WorkoutStep = z.infer<typeof WorkoutStepSchema>;
export type WorkoutElementType = z.infer<typeof WorkoutElementTypeSchema>;
export type WorkoutStructureElement = z.infer<
  typeof WorkoutStructureElementSchema
>;
export type WorkoutStructure = z.infer<typeof WorkoutStructureSchema>;
