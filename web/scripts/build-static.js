#!/usr/bin/env node

/**
 * Build script for static export mode
 * Uses next.config.static.ts by temporarily renaming it to next.config.ts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const staticConfigPath = path.join(rootDir, 'next.config.static.ts');
const mainConfigPath = path.join(rootDir, 'next.config.ts');
const backupConfigPath = path.join(rootDir, 'next.config.ts.backup');

console.log('Building Next.js static export...');

// Backup current config
if (fs.existsSync(mainConfigPath)) {
  fs.copyFileSync(mainConfigPath, backupConfigPath);
}

// Copy static config to main config
fs.copyFileSync(staticConfigPath, mainConfigPath);

try {
  // Run Next.js build
  execSync('next build', {
    cwd: rootDir,
    stdio: 'inherit',
  });
} finally {
  // Restore original config
  console.log('Restoring original configuration...');
  if (fs.existsSync(backupConfigPath)) {
    fs.copyFileSync(backupConfigPath, mainConfigPath);
    fs.unlinkSync(backupConfigPath);
  }
}
