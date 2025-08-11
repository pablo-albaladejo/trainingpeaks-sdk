/**
 * Commitlint Configuration Generator
 * Generates commitlint config with dynamic commit types
 */

import type { ProjectConfig } from '../../../config/project.config.js';

/**
 * Generate commitlint configuration
 */
export function generateCommitlintConfig(config: ProjectConfig): string {
  // Normalize and clean commit types
  const normalizedTypes = config.commitTypes
    .map(type => (typeof type === 'string' ? type : String(type)).trim()) // Normalize to string and trim
    .filter(type => type.length > 0) // Filter out empty strings
    .filter((type, index, array) => array.indexOf(type) === index) // Remove duplicates
    .sort(); // Sort alphabetically for consistency
  
  const commitTypes = normalizedTypes
    .map(type => {
      // Escape any quotes or backslashes in the type string
      const escaped = type.replace(/['"\\]/g, '\\$&');
      return `        '${escaped}', // ${getCommitTypeDescription(type)}`;
    })
    .join('\n');
  
  return `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
${commitTypes}
      ],
    ],
    'subject-case': [0, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};
`;
}

/**
 * Commit type descriptions mapping for documentation and tooling reuse
 */
export const COMMIT_TYPE_DESCRIPTIONS: Record<string, string> = {
  feat: 'New feature',
  fix: 'Bug fix',
  docs: 'Documentation changes',
  style: 'Code style changes (formatting, etc.)',
  refactor: 'Code refactoring',
  test: 'Adding or updating tests',
  chore: 'Build process or auxiliary tool changes',
  perf: 'Performance improvements',
  ci: 'CI/CD changes',
  build: 'Build system changes',
  revert: 'Revert previous commit',
};

/**
 * Get description for commit type
 */
export function getCommitTypeDescription(type: string): string {
  return COMMIT_TYPE_DESCRIPTIONS[type] || 'Custom commit type';
}