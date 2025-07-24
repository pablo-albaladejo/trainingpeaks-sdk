/**
 * HTTP Adapters
 * HTTP client implementations and utilities
 */

// HTTP Client Interface and Types
export type {
  HttpClient,
  HttpClientConfig,
  HttpRequest,
  HttpResponse,
} from './http-adapter';

// HTTP Client Factory
export { createHttpClient } from './http-adapter';
export { createHttpAuthAdapter } from './http-auth-adapter';
export { createWebHttpClient } from './web-http-client';
