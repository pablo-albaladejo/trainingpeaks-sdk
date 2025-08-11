/**
 * Shared utilities and types
 */

// Browser utilities
export { generateRandomUserAgent } from './utils/browser-utils';

// cURL utilities
export {
  type CurlRequestData,
  generateCurlCommand,
} from './utils/curl-generator';

// Session utilities
export {
  getAthleteIdFromSession,
  type SessionDependencies,
} from './utils/session-utils';
