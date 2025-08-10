/**
 * Commitlint Configuration Generator
 * Generates commitlint config with dynamic commit types
 */

import type { ProjectConfig } from '../../../config/project.config.js';

/**
 * Generate commitlint configuration
 */
export function generateCommitlintConfig(config: ProjectConfig): string {
  const commitTypes = config.commitTypes.map(type => typeof type === 'string' ? type : type.toString()).map(type => `        '${type}', // ${getCommitTypeDescription(type)}`).join('\n');
  
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
 * Get description for commit type
 */
export function getCommitTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
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
  
  return descriptions[type] || 'Custom commit type';
}