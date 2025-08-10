/**
 * Package.json Generator
 * Generates package.json with dynamic values from project configuration
 */

import { readFileSync } from 'fs';
import type { ProjectConfig } from '../../../config/project.config.js';

/**
 * Generate package.json content with dynamic values
 */
export function generatePackageJson(config: ProjectConfig): string {
  // Read current package.json to preserve existing structure
  const currentPackageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  
  // Update only the configurable fields
  const updatedPackageJson = {
    ...currentPackageJson,
    name: config.project.name,
    description: config.project.description,
    author: `${config.author.name} <${config.author.email}>`,
    repository: {
      type: 'git',
      url: config.repository.url,
    },
    bugs: {
      url: config.repository.bugsUrl,
    },
    homepage: config.repository.homepage,
  };
  
  return JSON.stringify(updatedPackageJson, null, 2);
}