/**
 * Base Use Case Result Schema
 * Defines the common structure for all use case results
 */

export type UseCaseResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
