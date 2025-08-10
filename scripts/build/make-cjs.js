#!/usr/bin/env node

/**
 * Script to create CommonJS (.cjs) versions of the built files
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');
const distCjsDir = join(projectRoot, 'dist-cjs');
const distDir = join(projectRoot, 'dist');

function copyFilesRecursively(srcDir, destDir) {
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  const files = readdirSync(srcDir);

  for (const file of files) {
    const srcPath = join(srcDir, file);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      const newDestDir = join(destDir, file);
      copyFilesRecursively(srcPath, newDestDir);
    } else if (file.endsWith('.js')) {
      // Transform and copy .js files as .cjs with proper CommonJS format
      const destPath = join(destDir, file.replace('.js', '.cjs'));
      let content = readFileSync(srcPath, 'utf8');
      
      // Transform ES modules to CommonJS
      content = content
        .replace(/export\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"];?/g, 'const { $1 } = require("$2");')
        .replace(/export\s*\*\s*from\s*['"]([^'"]+)['"];?/g, 'module.exports = { ...module.exports, ...require("$1") };')
        .replace(/export\s+default\s+([^;]+);?/g, 'module.exports = $1;')
        .replace(/export\s*{([^}]+)};?/g, 'module.exports = { $1 };')
        .replace(/import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"];?/g, 'const { $1 } = require("$2");')
        .replace(/import\s+([^\s]+)\s+from\s*['"]([^'"]+)['"];?/g, 'const $1 = require("$2");')
        .replace(/import\s*['"]([^'"]+)['"];?/g, 'require("$1");');
      
      writeFileSync(destPath, content);
      console.log(`✓ Transformed ${srcPath} → ${destPath}`);
    } else if (file.endsWith('.d.ts') || file.endsWith('.d.ts.map')) {
      // Copy declaration files as-is
      const destPath = join(destDir, file);
      const content = readFileSync(srcPath, 'utf8');
      writeFileSync(destPath, content);
      console.log(`✓ Copied ${srcPath} → ${destPath}`);
    }
  }
}

console.log('📦 Creating CommonJS (.cjs) versions...');
console.log(`Source: ${distCjsDir}`);
console.log(`Destination: ${distDir}`);

// Check if source directory exists before processing
if (!existsSync(distCjsDir)) {
  console.error(`❌ Source directory does not exist: ${distCjsDir}`);
  console.log('Please run `npm run build:cjs` first to generate the CJS build.');
  process.exit(1);
}

try {
  copyFilesRecursively(distCjsDir, distDir);
  console.log('✅ CommonJS build completed successfully!');
} catch (error) {
  console.error('❌ Error creating CommonJS build:', error);
  process.exit(1);
}
