#!/usr/bin/env node
/**
 * Copy Next.js static export to Go backend static directory
 */

const fs = require('node:fs');
const path = require('node:path');

const OUT_DIR = path.join(__dirname, '../out');
const GO_STATIC_DIR = path.join(__dirname, '../../internal/chatlog/http/static');

console.log('📦 Copying Next.js static files to Go backend...');
console.log(`Source: ${OUT_DIR}`);
console.log(`Target: ${GO_STATIC_DIR}`);

// Check if out directory exists
if (!fs.existsSync(OUT_DIR)) {
  console.error('❌ Error: out directory does not exist. Run `pnpm build:static` first.');
  process.exit(1);
}

// Create static directory if it doesn't exist
if (!fs.existsSync(GO_STATIC_DIR)) {
  fs.mkdirSync(GO_STATIC_DIR, { recursive: true });
}

// Copy files recursively
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  }
  else {
    fs.copyFileSync(src, dest);
  }
}

// Clean static directory first
console.log('🧹 Cleaning static directory...');
if (fs.existsSync(GO_STATIC_DIR)) {
  fs.rmSync(GO_STATIC_DIR, { recursive: true, force: true });
  fs.mkdirSync(GO_STATIC_DIR, { recursive: true });
}

// Copy all files from out to static
console.log('📋 Copying files...');
copyRecursive(OUT_DIR, GO_STATIC_DIR);

// Rename zh/chatlog/index.html to index.htm for Go backend
const chatlogIndexPath = path.join(GO_STATIC_DIR, 'zh/chatlog/index.html');
const targetIndexPath = path.join(GO_STATIC_DIR, 'index.htm');

if (fs.existsSync(chatlogIndexPath)) {
  fs.copyFileSync(chatlogIndexPath, targetIndexPath);
  console.log('✅ Created index.htm');
}

console.log('✅ Static files copied successfully!');
console.log(`\n📁 Files in ${GO_STATIC_DIR}:`);

// List files in static directory
function listFiles(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${prefix}${file}${stats.isDirectory() ? '/' : ''}`);
    if (stats.isDirectory() && prefix.length < 10) {
      listFiles(filePath, prefix + '  ');
    }
  }
}

listFiles(GO_STATIC_DIR);
