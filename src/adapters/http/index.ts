/**
 * HTTP Adapters Module
 * Provides HTTP client functionality and types for making HTTP requests
 */

export { createHttpClient } from './axios-http-client';

export type {
  HttpClient,
  HttpClientConfig,
  RequestOptions,
} from '@/application';
