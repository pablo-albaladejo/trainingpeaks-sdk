/**
 * Browser Utilities
 * Shared utilities for browser automation and web scraping
 */

/**
 * Generate a random User-Agent string for browser requests
 * Creates realistic User-Agent strings to avoid detection as a bot
 */
export const generateRandomUserAgent = (): string => {
  const browsers = [
    {
      name: 'Chrome',
      versions: [
        '120.0.0.0',
        '121.0.0.0',
        '122.0.0.0',
        '123.0.0.0',
        '124.0.0.0',
      ],
      webkit: '537.36',
    },
    {
      name: 'Firefox',
      versions: ['120.0', '121.0', '122.0', '123.0', '124.0'],
      webkit: '537.36',
    },
    {
      name: 'Safari',
      versions: ['17.0', '17.1', '17.2', '17.3', '17.4'],
      webkit: '605.1.15',
    },
  ];

  const os = [
    'Macintosh; Intel Mac OS X 10_15_7',
    'Macintosh; Intel Mac OS X 14_0_0',
    'Macintosh; Intel Mac OS X 14_1_0',
    'Windows NT 10.0; Win64; x64',
    'Windows NT 11.0; Win64; x64',
    'X11; Linux x86_64',
  ];

  const browser = browsers[Math.floor(Math.random() * browsers.length)]!;
  const version =
    browser.versions[Math.floor(Math.random() * browser.versions.length)]!;
  const operatingSystem = os[Math.floor(Math.random() * os.length)]!;

  if (browser.name === 'Chrome') {
    return `Mozilla/5.0 (${operatingSystem}) AppleWebKit/${browser.webkit} (KHTML, like Gecko) Chrome/${version} Safari/${browser.webkit}`;
  } else if (browser.name === 'Firefox') {
    return `Mozilla/5.0 (${operatingSystem}; rv:${version}) Gecko/20100101 Firefox/${version}`;
  } else if (browser.name === 'Safari') {
    return `Mozilla/5.0 (${operatingSystem}) AppleWebKit/${browser.webkit} (KHTML, like Gecko) Version/${version} Safari/${browser.webkit}`;
  }

  // Fallback to Chrome
  return `Mozilla/5.0 (${operatingSystem}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`;
};

/**
 * Generate a specific User-Agent for a given browser and OS
 */
export const generateSpecificUserAgent = (
  browser: 'Chrome' | 'Firefox' | 'Safari',
  os: 'macOS' | 'Windows' | 'Linux',
  version?: string
): string => {
  const browserConfig = {
    Chrome: {
      webkit: '537.36',
      defaultVersion: '120.0.0.0',
    },
    Firefox: {
      webkit: '537.36',
      defaultVersion: '120.0',
    },
    Safari: {
      webkit: '605.1.15',
      defaultVersion: '17.0',
    },
  };

  const osConfig = {
    macOS: 'Macintosh; Intel Mac OS X 10_15_7',
    Windows: 'Windows NT 10.0; Win64; x64',
    Linux: 'X11; Linux x86_64',
  };

  const config = browserConfig[browser];
  const operatingSystem = osConfig[os];
  const browserVersion = version || config.defaultVersion;

  if (browser === 'Chrome') {
    return `Mozilla/5.0 (${operatingSystem}) AppleWebKit/${config.webkit} (KHTML, like Gecko) Chrome/${browserVersion} Safari/${config.webkit}`;
  } else if (browser === 'Firefox') {
    return `Mozilla/5.0 (${operatingSystem}; rv:${browserVersion}) Gecko/20100101 Firefox/${browserVersion}`;
  } else if (browser === 'Safari') {
    return `Mozilla/5.0 (${operatingSystem}) AppleWebKit/${config.webkit} (KHTML, like Gecko) Version/${browserVersion} Safari/${config.webkit}`;
  }

  // Fallback
  return `Mozilla/5.0 (${operatingSystem}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`;
};

/**
 * Parse User-Agent string to extract browser and OS information
 */
export const parseUserAgent = (userAgent: string): {
  browser: string;
  version: string;
  os: string;
} => {
  const chromeMatch = userAgent.match(/Chrome\/([0-9.]+)/);
  const firefoxMatch = userAgent.match(/Firefox\/([0-9.]+)/);
  const safariMatch = userAgent.match(/Version\/([0-9.]+)/);
  const osMatch = userAgent.match(/\((.*?)\)/);

  let browser = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';

  if (chromeMatch) {
    browser = 'Chrome';
    version = chromeMatch[1];
  } else if (firefoxMatch) {
    browser = 'Firefox';
    version = firefoxMatch[1];
  } else if (safariMatch) {
    browser = 'Safari';
    version = safariMatch[1];
  }

  if (osMatch) {
    os = osMatch[1];
  }

  return { browser, version, os };
};

/**
 * Check if User-Agent is mobile
 */
export const isMobileUserAgent = (userAgent: string): boolean => {
  const mobileKeywords = [
    'Mobile',
    'Android',
    'iPhone',
    'iPad',
    'iPod',
    'BlackBerry',
    'Windows Phone',
  ];

  return mobileKeywords.some(keyword =>
    userAgent.toLowerCase().includes(keyword.toLowerCase())
  );
};

/**
 * Get common browser viewport sizes
 */
export const getCommonViewportSizes = () => ({
  desktop: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1280, height: 720 },
  ],
  tablet: [
    { width: 768, height: 1024 },
    { width: 820, height: 1180 },
    { width: 834, height: 1194 },
  ],
  mobile: [
    { width: 375, height: 667 },
    { width: 414, height: 896 },
    { width: 360, height: 640 },
  ],
});

/**
 * Generate a random viewport size
 */
export const generateRandomViewport = (): { width: number; height: number } => {
  const sizes = getCommonViewportSizes();
  const allSizes = [
    ...sizes.desktop,
    ...sizes.tablet,
    ...sizes.mobile,
  ];

  return allSizes[Math.floor(Math.random() * allSizes.length)]!;
}; 