import { describe, expect, it } from 'vitest';

import * as schemas from './index';

describe('Application Schemas Index', () => {
  it('should export workout schemas', () => {
    expect(schemas).toHaveProperty('WorkoutResponseSchema');
    expect(schemas).toHaveProperty('WorkoutsListResponseSchema');
    expect(schemas).toHaveProperty('WorkoutStatsSchema');
    expect(schemas).toHaveProperty('CreateWorkoutRequestSchema');
    expect(schemas).toHaveProperty('UpdateWorkoutRequestSchema');
    expect(schemas).toHaveProperty('WorkoutFiltersSchema');
  });

  it('should export workout types', () => {
    // Types are compile-time only, but we can check the schemas exist
    expect(typeof schemas.WorkoutResponseSchema.parse).toBe('function');
    expect(typeof schemas.WorkoutsListResponseSchema.parse).toBe('function');
    expect(typeof schemas.WorkoutStatsSchema.parse).toBe('function');
    expect(typeof schemas.CreateWorkoutRequestSchema.parse).toBe('function');
    expect(typeof schemas.UpdateWorkoutRequestSchema.parse).toBe('function');
    expect(typeof schemas.WorkoutFiltersSchema.parse).toBe('function');
  });

  it('should have expected export structure', () => {
    const exportKeys = Object.keys(schemas);
    expect(exportKeys.length).toBeGreaterThan(0);
  });
});
