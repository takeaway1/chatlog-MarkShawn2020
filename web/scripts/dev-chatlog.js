#!/usr/bin/env node

/**
 * Development script for Chatlog mode
 * Uses next.config.dev.ts by temporarily renaming it to next.config.ts
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.join(__dirname, '..');
const devConfigPath = path.join(rootDir, 'next.config.dev.ts');
const mainConfigPath = path.join(rootDir, 'next.config.ts');
const backupConfigPath = path.join(rootDir, 'next.config.ts.backup');

// Backup current config
if (fs.existsSync(mainConfigPath)) {
  fs.copyFileSync(mainConfigPath, backupConfigPath);
}

// Copy dev config to main config
fs.copyFileSync(devConfigPath, mainConfigPath);

console.log('Starting Next.js dev server with Chatlog proxy configuration...');

// Start Next.js dev server with Sentry disabled
const nextDev = spawn('next', ['dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_SENTRY_DISABLED: 'true',
  },
});

// Cleanup function
const cleanup = () => {
  console.log('\nRestoring original configuration...');

  // Restore original config
  if (fs.existsSync(backupConfigPath)) {
    fs.copyFileSync(backupConfigPath, mainConfigPath);
    fs.unlinkSync(backupConfigPath);
  }

  process.exit();
};

// Handle cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

nextDev.on('exit', (code) => {
  cleanup();
  process.exit(code);
});
