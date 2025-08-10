/**
 * Project Configuration
 * Centralized configuration for project-specific values that are currently hardcoded
 * This eliminates hardcoding and makes the project reusable as a template
 */

export interface ProjectConfig {
  project: {
    name: string;
    title: string;
    description: string;
  };
  author: {
    name: string;
    email: string;
    githubUsername: string;
  };
  repository: {
    owner: string;
    name: string;
    url: string;
    bugsUrl: string;
    homepage: string;
  };
  ci: {
    branches: {
      main: string;
      develop: string;
      alpha: string;
    };
    nodeVersions: string[];
    coveragePath: string;
  };
  colors: {
    [key: string]: string;
  };
  github: {
    codeowners: string[];
    dependabot: {
      reviewers: string[];
      assignees: string[];
    };
  };
  commitTypes: string[];
}

/**
 * Default color scheme for GitHub labels
 */
const DEFAULT_COLORS = {
  // Priority colors
  priority_critical: 'd73a4a',
  priority_high: 'f85149', 
  priority_medium: 'fbca04',
  priority_low: '0e8a16',
  
  // Type colors
  bug: 'd73a4a',
  enhancement: 'a2eeef',
  refactor: '7057ff',
  documentation: '0075ca',
  testing: '28a745',
  performance: 'ff8c00',
  security: 'd93f0b',
  infrastructure: '6f42c1',
  
  // Status colors
  needsTriage: 'ffccd5',
  ready: '0e8a16',
  inProgress: '1d76db',
  blocked: 'd93f0b',
  needsReview: 'fbca04',
  needsTesting: '28a745',
  
  // Architecture colors
  domain: '6f42c1',
  application: '6f42c1',
  adapters: '6f42c1',
  shared: '6f42c1',
  
  // Component colors
  component: '1d76db',
  
  // Effort colors
  effort_small: '0e8a16',
  effort_medium: 'fbca04',
  effort_large: 'ff8c00',
  effort_epic: 'd93f0b',
  
  // Other colors
  breakingChange: 'd93f0b',
  migration: 'fbca04',
  technicalDebt: 'ff8c00',
  codeReview: '28a745',
  release: '1d76db',
  future: '6f42c1',
  patch: '0e8a16',
  minor: 'fbca04',
  major: 'd93f0b',
} as const;

/**
 * Default commit types for commitlint
 */
const DEFAULT_COMMIT_TYPES = [
  'feat',     // New feature
  'fix',      // Bug fix
  'docs',     // Documentation changes
  'style',    // Code style changes (formatting, etc.)
  'refactor', // Code refactoring
  'test',     // Adding or updating tests
  'chore',    // Build process or auxiliary tool changes
  'perf',     // Performance improvements
  'ci',       // CI/CD changes
  'build',    // Build system changes
  'revert',   // Revert previous commit
] as const;

/**
 * Parse custom colors from environment variable with error handling and normalization
 */
function parseCustomColors(): Record<string, string> {
  if (!process.env.CUSTOM_COLORS) {
    return {};
  }

  try {
    const parsed = JSON.parse(process.env.CUSTOM_COLORS);
    // Normalize colors by removing leading # if present
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        normalized[key] = value.startsWith('#') ? value.slice(1) : value;
      }
    }
    return normalized;
  } catch (error) {
    console.warn('Failed to parse CUSTOM_COLORS environment variable:', error);
    return {};
  }
}

/**
 * Get project configuration from environment variables with fallback to defaults
 */
export function getProjectConfig(): ProjectConfig {
  const owner = process.env.REPO_OWNER || 'pablo-albaladejo';
  const name = process.env.REPO_NAME || 'trainingpeaks-sdk';
  
  return {
    project: {
      name: process.env.PROJECT_NAME || 'trainingpeaks-sdk',
      title: process.env.PROJECT_TITLE || 'TrainingPeaks SDK Development',
      description: process.env.PROJECT_DESCRIPTION || 'TypeScript SDK for TrainingPeaks API integration',
    },
    
    author: {
      name: process.env.AUTHOR_NAME || 'Your Name',
      email: process.env.AUTHOR_EMAIL || 'you@example.com',
      githubUsername: process.env.GITHUB_USERNAME || 'your-handle',
    },
    
    repository: {
      owner,
      name,
      url: `https://github.com/${owner}/${name}.git`,
      bugsUrl: `https://github.com/${owner}/${name}/issues`,
      homepage: `https://github.com/${owner}/${name}#readme`,
    },
    
    ci: {
      branches: {
        main: process.env.MAIN_BRANCH || 'main',
        develop: process.env.DEVELOP_BRANCH || 'develop',
        alpha: process.env.ALPHA_BRANCH || 'alpha',
      },
      nodeVersions: process.env.NODE_VERSIONS?.split(',').map(s => s.trim()).filter(Boolean) || ['18.x', '20.x'],
      coveragePath: process.env.COVERAGE_PATH || './coverage/lcov.info',
    },
    
    colors: {
      ...DEFAULT_COLORS,
      // Allow overrides from environment with error handling
      ...parseCustomColors(),
    },
    
    github: {
      codeowners: process.env.CODEOWNERS?.split(',').map(s => s.trim()).filter(Boolean) || ['your-handle'],
      dependabot: {
        reviewers: process.env.DEPENDABOT_REVIEWERS?.split(',').map(s => s.trim()).filter(Boolean) || ['your-handle'],
        assignees: process.env.DEPENDABOT_ASSIGNEES?.split(',').map(s => s.trim()).filter(Boolean) || ['your-handle'],
      },
    },
    
    commitTypes: process.env.COMMIT_TYPES?.split(',').map(s => s.trim()).filter(Boolean) || [...DEFAULT_COMMIT_TYPES],
  };
}

/**
 * Validate project configuration
 */
export function validateProjectConfig(config: ProjectConfig): void {
  // Validate required fields
  if (!config.project.name) {
    throw new Error('Project name is required');
  }
  
  if (!config.author.email.includes('@')) {
    throw new Error('Valid author email is required');
  }
  
  if (!config.repository.owner || !config.repository.name) {
    throw new Error('Repository owner and name are required');
  }
  
  // Validate colors are valid hex
  Object.entries(config.colors).forEach(([key, color]) => {
    if (!/^#?[0-9a-fA-F]{6}$/.test(color)) {
      throw new Error(`Invalid hex color for ${key}: ${color}`);
    }
  });
  
  // Validate node versions
  config.ci.nodeVersions.forEach(version => {
    if (!/^\d+\.x$/.test(version)) {
      throw new Error(`Invalid node version format: ${version}`);
    }
  });
}