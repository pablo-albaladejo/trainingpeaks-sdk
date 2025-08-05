/**
 * Request ID Generator
 * Generates unique identifiers for request tracing and correlation
 */

/**
 * Generates a unique request ID for correlation tracking
 */
export const generateRequestId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${randomPart}`;
};

/**
 * Extracts timestamp from request ID for debugging
 */
export const getRequestTimestamp = (requestId: string): Date | null => {
  try {
    const timestampPart = requestId.split('_')[1];
    if (!timestampPart) return null;

    const timestamp = parseInt(timestampPart, 36);
    return new Date(timestamp);
  } catch {
    return null;
  }
};
