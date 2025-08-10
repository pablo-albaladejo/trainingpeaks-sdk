#!/usr/bin/env tsx

/**
 * Validate Project Configuration
 * 
 * This script validates the current project configuration and checks
 * that all generated files are consistent with the configuration.
 */

import { readFileSync, existsSync } from 'fs';
import { getProjectConfig, validateProjectConfig } from '../../config/project.config.js';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: string) {
  log(`\n🔍 ${step}`, 'cyan');
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

/**
 * Validate that configuration files exist
 */
function validateConfigFiles(): boolean {
  const requiredFiles = [
    'package.json',
    '.github/CODEOWNERS',
    '.github/dependabot.yml',
    '.github/labels.yml',
    '.github/workflows/ci.yml',
    '.github/workflows/release.yml',
    'commitlint.config.cjs',
    'release.config.cjs',
  ];
  
  let allValid = true;
  
  logStep('Checking required configuration files');
  
  requiredFiles.forEach(file => {
    if (existsSync(file)) {
      logSuccess(`Found: ${file}`);
    } else {
      logError(`Missing: ${file}`);
      allValid = false;
    }
  });
  
  return allValid;
}

/**
 * Validate package.json consistency
 */
function validatePackageJson(config: any): boolean {
  logStep('Validating package.json');
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    let valid = true;
    
    // Check name
    if (packageJson.name !== config.project.name) {
      logError(`package.json name mismatch: expected "${config.project.name}", got "${packageJson.name}"`);
      valid = false;
    } else {
      logSuccess(`Package name: ${packageJson.name}`);
    }
    
    // Check author
    const expectedAuthor = `${config.author.name} <${config.author.email}>`;
    if (packageJson.author !== expectedAuthor) {
      logError(`package.json author mismatch: expected "${expectedAuthor}", got "${packageJson.author}"`);
      valid = false;
    } else {
      logSuccess(`Author: ${packageJson.author}`);
    }
    
    // Check repository URL
    if (packageJson.repository?.url !== config.repository.url) {
      logError(`package.json repository URL mismatch: expected "${config.repository.url}", got "${packageJson.repository?.url}"`);
      valid = false;
    } else {
      logSuccess(`Repository URL: ${packageJson.repository?.url}`);
    }
    
    return valid;
  } catch (error) {
    logError(`Failed to validate package.json: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Validate GitHub configuration files
 */
function validateGitHubConfig(config: any): boolean {
  logStep('Validating GitHub configuration files');
  
  let valid = true;
  
  try {
    // Check CODEOWNERS
    if (existsSync('.github/CODEOWNERS')) {
      const codeowners = readFileSync('.github/CODEOWNERS', 'utf-8');
      const expectedOwners = config.github.codeowners.map((owner: string) => `@${owner}`).join(' ');
      
      if (codeowners.includes(expectedOwners)) {
        logSuccess('CODEOWNERS contains expected owners');
      } else {
        logWarning('CODEOWNERS may not contain expected owners');
        valid = false;
      }
    }
    
    // Check dependabot.yml
    if (existsSync('.github/dependabot.yml')) {
      const dependabot = readFileSync('.github/dependabot.yml', 'utf-8');
      
      config.github.dependabot.reviewers.forEach((reviewer: string) => {
        if (dependabot.includes(`"${reviewer}"`)) {
          logSuccess(`Dependabot reviewer found: ${reviewer}`);
        } else {
          logError(`Dependabot reviewer missing: ${reviewer}`);
          valid = false;
        }
      });
    }
    
    // Check workflows
    if (existsSync('.github/workflows/ci.yml')) {
      const ciWorkflow = readFileSync('.github/workflows/ci.yml', 'utf-8');
      
      // Check branches
      const expectedBranches = `[${config.ci.branches.main}, ${config.ci.branches.develop}]`;
      if (ciWorkflow.includes(expectedBranches)) {
        logSuccess('CI workflow contains expected branches');
      } else {
        logError('CI workflow branches mismatch');
        valid = false;
      }
      
      // Check node versions
      const expectedNodeVersions = `[${config.ci.nodeVersions.join(', ')}]`;
      if (ciWorkflow.includes(expectedNodeVersions)) {
        logSuccess('CI workflow contains expected Node.js versions');
      } else {
        logError('CI workflow Node.js versions mismatch');
        valid = false;
      }
    }
    
    return valid;
  } catch (error) {
    logError(`Failed to validate GitHub configuration: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Main validation function
 */
async function validateConfiguration() {
  try {
    log('\n🔍 Project Configuration Validation', 'bright');
    log('=====================================\n');
    
    logStep('Loading project configuration');
    
    // Load project configuration
    const config = getProjectConfig();
    
    // Validate configuration schema
    validateProjectConfig(config);
    logSuccess('Project configuration is valid');
    
    // Show configuration summary
    log('\nConfiguration Summary:', 'bright');
    log(`  Project: ${config.project.name} (${config.project.title})`);
    log(`  Author: ${config.author.name} <${config.author.email}>`);
    log(`  Repository: ${config.repository.owner}/${config.repository.name}`);
    log(`  Branches: ${config.ci.branches.main}, ${config.ci.branches.develop}, ${config.ci.branches.alpha}`);
    log(`  Node versions: ${config.ci.nodeVersions.join(', ')}`);
    
    // Validate files exist
    const filesValid = validateConfigFiles();
    
    // Validate package.json
    const packageValid = validatePackageJson(config);
    
    // Validate GitHub config
    const githubValid = validateGitHubConfig(config);
    
    // Final result
    const overallValid = filesValid && packageValid && githubValid;
    
    if (overallValid) {
      log('\n🎉 All validation checks passed!', 'green');
      log('\nYour project configuration is consistent and up to date.', 'bright');
    } else {
      log('\n⚠️  Some validation checks failed!', 'yellow');
      log('\nRecommended actions:');
      log('1. Run: npm run generate:config');
      log('2. Review and commit the changes');
      log('3. Run validation again');
    }
    
    process.exit(overallValid ? 0 : 1);
    
  } catch (error) {
    logError(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the validation
if (import.meta.url === `file://${process.argv[1]}`) {
  validateConfiguration();
}

export { validateConfiguration };