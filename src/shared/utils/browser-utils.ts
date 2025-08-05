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
export const parseUserAgent = (
  userAgent: string
): {
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
    version = chromeMatch[1] ?? 'Unknown';
  } else if (firefoxMatch) {
    browser = 'Firefox';
    version = firefoxMatch[1] ?? 'Unknown';
  } else if (safariMatch) {
    browser = 'Safari';
    version = safariMatch[1] ?? 'Unknown';
  }

  if (osMatch) {
    os = osMatch[1] ?? 'Unknown';
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

  return mobileKeywords.some((keyword) =>
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
  const allSizes = [...sizes.desktop, ...sizes.tablet, ...sizes.mobile];

  return allSizes[Math.floor(Math.random() * allSizes.length)]!;
};

/**
 * Generate random Chrome version for sec-ch-ua header
 */
const generateRandomChromeVersion = (): string => {
  const majorVersions = [120, 121, 122, 123, 124, 125, 126, 127, 128];
  const majorVersion =
    majorVersions[Math.floor(Math.random() * majorVersions.length)]!;
  const minorVersion = Math.floor(Math.random() * 10);
  const patchVersion = Math.floor(Math.random() * 10);
  const buildVersion = Math.floor(Math.random() * 1000);

  return `${majorVersion}.${minorVersion}.${patchVersion}.${buildVersion}`;
};

/**
 * Generate random sec-ch-ua header value
 */
const generateRandomSecChUa = (): string => {
  const brandOptions = [
    '"Not)A;Brand"',
    '"Not_A Brand"',
    '"Not;A=Brand"',
    '"Not A;Brand"',
  ];

  const brand = brandOptions[Math.floor(Math.random() * brandOptions.length)]!;
  const brandVersion = Math.floor(Math.random() * 24) + 8; // 8-31
  const chromeVersion = generateRandomChromeVersion().split('.')[0]; // Just major version

  return `${brand};v="${brandVersion}", "Chromium";v="${chromeVersion}", "Google Chrome";v="${chromeVersion}"`;
};

/**
 * Generate random platform for sec-ch-ua-platform header
 */
const generateRandomPlatform = (): string => {
  const platforms = ['"macOS"', '"Windows"', '"Linux"'];
  return platforms[Math.floor(Math.random() * platforms.length)]!;
};

/**
 * Generate random mobile indicator
 */
const generateRandomMobile = (): string => {
  return Math.random() > 0.8 ? '?1' : '?0'; // 20% chance of mobile
};

/**
 * Generate random browser headers for HTTP requests
 * Creates realistic browser headers to avoid detection as a bot
 */
export const generateRandomBrowserHeaders = (): Record<string, string> => {
  return {
    'sec-ch-ua': generateRandomSecChUa(),
    'sec-ch-ua-mobile': generateRandomMobile(),
    'sec-ch-ua-platform': generateRandomPlatform(),
    'user-agent': generateRandomUserAgent(),
  };
};

/**
 * Generate consistent browser headers (same session)
 * Useful when you need the same headers across multiple requests
 */
export const generateConsistentBrowserHeaders = (): Record<string, string> => {
  const userAgent = generateRandomUserAgent();
  const parsed = parseUserAgent(userAgent);

  // Generate consistent headers based on the user agent
  const isMobile = isMobileUserAgent(userAgent);
  const platform = parsed.os.includes('Mac')
    ? '"macOS"'
    : parsed.os.includes('Windows')
      ? '"Windows"'
      : '"Linux"';

  // Extract Chrome version from user agent for consistency
  const chromeMatch = userAgent.match(/Chrome\/([0-9]+)/);
  const chromeVersion = chromeMatch ? chromeMatch[1] : '120';

  return {
    'sec-ch-ua': `"Not)A;Brand";v="8", "Chromium";v="${chromeVersion}", "Google Chrome";v="${chromeVersion}"`,
    'sec-ch-ua-mobile': isMobile ? '?1' : '?0',
    'sec-ch-ua-platform': platform,
    'user-agent': userAgent,
  };
};
