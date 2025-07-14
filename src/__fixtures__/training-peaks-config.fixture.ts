import { TrainingPeaksConfig } from '@/types';
import { faker } from '@faker-js/faker';
import { randomNumber, randomUrl } from './utils.fixture';

/**
 * TrainingPeaksConfig fixture builder
 */
export class TrainingPeaksConfigFixture {
  private config: TrainingPeaksConfig = {};

  /**
   * Set base URL
   * @param baseUrl - Base URL
   */
  withBaseUrl(baseUrl: string): this {
    this.config.baseUrl = baseUrl;
    return this;
  }

  /**
   * Set random base URL
   */
  withRandomBaseUrl(): this {
    this.config.baseUrl = randomUrl();
    return this;
  }

  /**
   * Set timeout
   * @param timeout - Timeout in milliseconds
   */
  withTimeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  /**
   * Set random timeout
   */
  withRandomTimeout(): this {
    this.config.timeout = randomNumber(1000, 30000);
    return this;
  }

  /**
   * Set debug mode
   * @param debug - Debug flag
   */
  withDebug(debug: boolean): this {
    this.config.debug = debug;
    return this;
  }

  /**
   * Set random debug mode
   */
  withRandomDebug(): this {
    this.config.debug = faker.datatype.boolean();
    return this;
  }

  /**
   * Set custom headers
   * @param headers - Custom headers
   */
  withHeaders(headers: Record<string, string>): this {
    this.config.headers = headers;
    return this;
  }

  /**
   * Set random headers
   */
  withRandomHeaders(): this {
    this.config.headers = {
      'X-Custom-Header': faker.string.alpha({ length: 10 }),
      'X-App-Version': faker.system.semver(),
    };
    return this;
  }

  /**
   * Build the configuration
   * @returns TrainingPeaksConfig
   */
  build(): TrainingPeaksConfig {
    return { ...this.config };
  }

  /**
   * Create a default configuration
   * @returns TrainingPeaksConfig
   */
  static default(): TrainingPeaksConfig {
    return new TrainingPeaksConfigFixture()
      .withBaseUrl('https://www.trainingpeaks.com')
      .withTimeout(10000)
      .withDebug(false)
      .build();
  }

  /**
   * Create a random configuration
   * @returns TrainingPeaksConfig
   */
  static random(): TrainingPeaksConfig {
    return new TrainingPeaksConfigFixture()
      .withRandomBaseUrl()
      .withRandomTimeout()
      .withRandomDebug()
      .withRandomHeaders()
      .build();
  }
}
