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
      // Copy .js files as .cjs
      const destPath = join(destDir, file.replace('.js', '.cjs'));
      const content = readFileSync(srcPath, 'utf8');
      writeFileSync(destPath, content);
      console.log(`✓ Copied ${srcPath} → ${destPath}`);
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

try {
  copyFilesRecursively(distCjsDir, distDir);
  console.log('✅ CommonJS build completed successfully!');
} catch (error) {
  console.error('❌ Error creating CommonJS build:', error);
  process.exit(1);
}
