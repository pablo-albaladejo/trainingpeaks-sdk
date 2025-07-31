/**
 * Serialization Error Types
 * Specific error types for serialization and deserialization operations
 * These belong to the adapters layer, not domain layer
 */

/**
 * Error thrown when JSON parsing fails
 */
export class JsonParseError extends Error {
  constructor(
    message: string,
    public readonly originalError: Error,
    public readonly jsonString: string
  ) {
    super(message);
    this.name = 'JsonParseError';
  }
}

/**
 * Error thrown when deserialization fails due to invalid data structure
 */
export class DeserializationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'DeserializationError';
  }
}

/**
 * Error thrown when required fields are missing during deserialization
 */
export class MissingFieldError extends DeserializationError {
  constructor(field: string, value?: unknown) {
    super(`Required field '${field}' is missing`, field, value);
    this.name = 'MissingFieldError';
  }
}

/**
 * Error thrown when field has invalid type during deserialization
 */
export class InvalidTypeError extends DeserializationError {
  constructor(field: string, expectedType: string, actualValue: unknown) {
    super(
      `Field '${field}' must be of type '${expectedType}', got '${typeof actualValue}'`,
      field,
      actualValue
    );
    this.name = 'InvalidTypeError';
  }
}

/**
 * Error thrown when date parsing fails during deserialization
 */
export class InvalidDateError extends DeserializationError {
  constructor(field: string, dateString: string) {
    super(
      `Field '${field}' contains invalid date format: '${dateString}'`,
      field,
      dateString
    );
    this.name = 'InvalidDateError';
  }
}
