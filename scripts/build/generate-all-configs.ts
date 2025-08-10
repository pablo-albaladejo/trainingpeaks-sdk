#!/usr/bin/env tsx

/**
 * Generate All Configuration Files
 * 
 * This script generates all project configuration files using dynamic values
 * from environment variables and the project configuration.
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { getProjectConfig, validateProjectConfig } from '../../config/project.config.js';
import { generatePackageJson } from './generators/package-json-generator.js';
import { 
  generateCodeowners, 
  generateDependabotYml, 
  generateLabelsYml 
} from './generators/github-config-generator.js';
import { 
  generateCIWorkflow, 
  generateReleaseWorkflow 
} from './generators/workflow-generator.js';
import { generateCommitlintConfig } from './generators/commitlint-generator.js';
import { generateReleaseConfig } from './generators/release-config-generator.js';

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
  log(`\n🔧 ${step}`, 'cyan');
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
 * Load environment from .env.project file if it exists
 */
function loadProjectEnv() {
  try {
    const envContent = readFileSync('.env.project', 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        envVars[key.trim()] = value.trim();
      }
    });
    
    // Set environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      process.env[key] = value;
    });
    
    logSuccess('Loaded configuration from .env.project');
    return true;
  } catch (error) {
    logWarning('No .env.project file found, using environment variables and defaults');
    return false;
  }
}

/**
 * Backup existing configuration files
 */
function backupExistingFiles() {
  const filesToBackup = [
    'package.json',
    '.github/CODEOWNERS',
    '.github/dependabot.yml',
    '.github/labels.yml',
    '.github/workflows/ci.yml',
    '.github/workflows/release.yml',
    'commitlint.config.cjs',
    'release.config.cjs',
  ];
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  filesToBackup.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8');
      const backupFile = `${file}.backup.${timestamp}`;
      writeFileSync(backupFile, content);
      log(`  Backed up: ${file} → ${backupFile}`);
    } catch (error) {
      // File doesn't exist, skip backup
    }
  });
}

/**
 * Generate configuration files
 */
async function generateConfigurations() {
  try {
    logStep('Loading project configuration');
    
    // Load environment from .env.project if it exists
    loadProjectEnv();
    
    // Get and validate configuration
    const config = getProjectConfig();
    validateProjectConfig(config);
    
    logSuccess('Project configuration loaded and validated');
    
    logStep('Backing up existing configuration files');
    backupExistingFiles();
    
    logStep('Generating package.json');
    const packageJsonContent = generatePackageJson(config);
    writeFileSync('package.json', packageJsonContent);
    logSuccess('Generated package.json');
    
    logStep('Generating GitHub configuration files');
    
    // Generate CODEOWNERS
    const codeownersContent = generateCodeowners(config);
    writeFileSync('.github/CODEOWNERS', codeownersContent);
    logSuccess('Generated .github/CODEOWNERS');
    
    // Generate dependabot.yml
    const dependabotContent = generateDependabotYml(config);
    writeFileSync('.github/dependabot.yml', dependabotContent);
    logSuccess('Generated .github/dependabot.yml');
    
    // Generate labels.yml
    const labelsContent = generateLabelsYml(config);
    writeFileSync('.github/labels.yml', labelsContent);
    logSuccess('Generated .github/labels.yml');
    
    logStep('Generating GitHub workflows');
    
    // Generate CI workflow
    const ciWorkflowContent = generateCIWorkflow(config);
    writeFileSync('.github/workflows/ci.yml', ciWorkflowContent);
    logSuccess('Generated .github/workflows/ci.yml');
    
    // Generate Release workflow
    const releaseWorkflowContent = generateReleaseWorkflow(config);
    writeFileSync('.github/workflows/release.yml', releaseWorkflowContent);
    logSuccess('Generated .github/workflows/release.yml');
    
    logStep('Generating project configuration files');
    
    // Generate commitlint config
    const commitlintContent = generateCommitlintConfig(config);
    writeFileSync('commitlint.config.cjs', commitlintContent);
    logSuccess('Generated commitlint.config.cjs');
    
    // Generate release config
    const releaseConfigContent = generateReleaseConfig(config);
    writeFileSync('release.config.cjs', releaseConfigContent);
    logSuccess('Generated release.config.cjs');
    
    logStep('Configuration Summary');
    log('Project Configuration:', 'bright');
    log(`  Name: ${config.project.name}`);
    log(`  Title: ${config.project.title}`);
    log(`  Author: ${config.author.name} <${config.author.email}>`);
    log(`  Repository: ${config.repository.owner}/${config.repository.name}`);
    log(`  Main Branch: ${config.ci.branches.main}`);
    log(`  Node Versions: ${config.ci.nodeVersions.join(', ')}`);
    log(`  Codeowners: ${config.github.codeowners.join(', ')}`);
    
    log('\n🎉 All configuration files generated successfully!', 'green');
    log('\nNext steps:', 'bright');
    log('1. Review the generated files');
    log('2. Commit the changes to your repository');
    log('3. Update GitHub labels: npm run sync:labels');
    log('4. Test the CI/CD pipeline');
    
  } catch (error) {
    logError(`Configuration generation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the generation
if (import.meta.url === `file://${process.argv[1]}`) {
  generateConfigurations();
}

export { generateConfigurations };