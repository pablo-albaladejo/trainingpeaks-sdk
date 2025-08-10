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
  // Read current package.json to preserve existing structure with error handling
  let currentPackageJson: any;
  try {
    currentPackageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Update only the configurable fields with deep merging for nested objects
  const updatedPackageJson = {
    ...currentPackageJson,
    name: config.project.name,
    description: config.project.description,
    author: `${config.author.name} <${config.author.email}>`,
    repository: {
      ...(currentPackageJson.repository || {}),
      type: 'git',
      url: config.repository.url,
    },
    bugs: {
      ...(currentPackageJson.bugs || {}),
      url: config.repository.bugsUrl,
    },
    homepage: config.repository.homepage,
  };
  
  return JSON.stringify(updatedPackageJson, null, 2) + '\n';
}