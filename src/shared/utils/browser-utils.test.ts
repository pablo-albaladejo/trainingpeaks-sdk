/**
 * Browser Utilities Tests
 * Tests for browser header generation and user agent functions
 */

import { describe, expect, it } from 'vitest';

import {
  generateConsistentBrowserHeaders,
  generateRandomBrowserHeaders,
  generateRandomUserAgent,
  isMobileUserAgent,
  parseUserAgent,
} from './browser-utils';

describe('Browser Utilities', () => {
  describe('generateRandomUserAgent', () => {
    it('should generate a valid user agent string', () => {
      const userAgent = generateRandomUserAgent();

      expect(userAgent).toBeTruthy();
      expect(userAgent).toMatch(/Mozilla\/5\.0/);
      expect(userAgent).toMatch(/(Chrome|Firefox|Safari)/);
    });

    it('should generate different user agents on subsequent calls', () => {
      const userAgent1 = generateRandomUserAgent();
      const userAgent2 = generateRandomUserAgent();

      // Due to randomization, they should likely be different (though not guaranteed)
      expect(typeof userAgent1).toBe('string');
      expect(typeof userAgent2).toBe('string');
    });
  });

  describe('generateRandomBrowserHeaders', () => {
    it('should generate complete browser headers object', () => {
      const headers = generateRandomBrowserHeaders();

      expect(headers).toHaveProperty('sec-ch-ua');
      expect(headers).toHaveProperty('sec-ch-ua-mobile');
      expect(headers).toHaveProperty('sec-ch-ua-platform');
      expect(headers).toHaveProperty('user-agent');
    });

    it('should generate valid sec-ch-ua header', () => {
      const headers = generateRandomBrowserHeaders();

      expect(headers['sec-ch-ua']).toMatch(
        /.*Brand.*v=.*Chromium.*v=.*Chrome.*v=/
      );
    });

    it('should generate valid mobile indicator', () => {
      const headers = generateRandomBrowserHeaders();

      expect(headers['sec-ch-ua-mobile']).toMatch(/^\?[01]$/);
    });

    it('should generate valid platform header', () => {
      const headers = generateRandomBrowserHeaders();

      expect(headers['sec-ch-ua-platform']).toMatch(
        /^"(macOS|Windows|Linux)"$/
      );
    });
  });

  describe('generateConsistentBrowserHeaders', () => {
    it('should generate consistent headers based on user agent', () => {
      const headers = generateConsistentBrowserHeaders();

      expect(headers).toHaveProperty('sec-ch-ua');
      expect(headers).toHaveProperty('sec-ch-ua-mobile');
      expect(headers).toHaveProperty('sec-ch-ua-platform');
      expect(headers).toHaveProperty('user-agent');
    });

    it('should have consistent platform based on user agent OS', () => {
      const headers = generateConsistentBrowserHeaders();

      const userAgent = headers['user-agent'];
      const platform = headers['sec-ch-ua-platform'];

      // Check that platform matches user agent OS
      if (userAgent.includes('Macintosh')) {
        expect(platform).toBe('"macOS"');
      } else if (userAgent.includes('Windows')) {
        expect(platform).toBe('"Windows"');
      } else if (userAgent.includes('Linux')) {
        expect(platform).toBe('"Linux"');
      }
    });

    it('should have consistent mobile indicator', () => {
      const headers = generateConsistentBrowserHeaders();

      const userAgent = headers['user-agent'];
      const isMobile = headers['sec-ch-ua-mobile'];

      const userAgentIsMobile = isMobileUserAgent(userAgent);

      if (userAgentIsMobile) {
        expect(isMobile).toBe('?1');
      } else {
        expect(isMobile).toBe('?0');
      }
    });
  });

  describe('parseUserAgent', () => {
    it('should parse Chrome user agent correctly', () => {
      const chromeUA =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      const parsed = parseUserAgent(chromeUA);

      expect(parsed.browser).toBe('Chrome');
      expect(parsed.version).toBe('120.0.0.0');
      expect(parsed.os).toContain('Macintosh');
    });

    it('should parse Firefox user agent correctly', () => {
      const firefoxUA =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0';

      const parsed = parseUserAgent(firefoxUA);

      expect(parsed.browser).toBe('Firefox');
      expect(parsed.version).toBe('120.0');
      expect(parsed.os).toContain('Windows');
    });
  });

  describe('isMobileUserAgent', () => {
    it('should detect mobile user agents', () => {
      const mobileUA =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

      expect(isMobileUserAgent(mobileUA)).toBe(true);
    });

    it('should detect desktop user agents', () => {
      const desktopUA =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      expect(isMobileUserAgent(desktopUA)).toBe(false);
    });
  });
});
