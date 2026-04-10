#!/usr/bin/env node
/**
 * Patch Fluxez SDK to use production API URL
 * This script is run automatically after npm install
 */

const fs = require('fs');
const path = require('path');

const constantsPath = path.join(
  __dirname,
  '../node_modules/@fluxez/node-sdk/dist/constants.js'
);

const DEV_URL = 'https://api-dev.fluxez.com/api/v1';
const PROD_URL = 'https://api.fluxez.com/api/v1';

// Use DEV URL for development environment
const TARGET_URL = DEV_URL;
const TARGET_COMMENT = '// API Base URL - patched for development';

try {
  if (!fs.existsSync(constantsPath)) {
    console.log('  Fluxez SDK not found, skipping patch');
    process.exit(0);
  }

  let content = fs.readFileSync(constantsPath, 'utf8');

  if (content.includes(TARGET_URL)) {
    console.log('  Fluxez SDK already using development API');
  } else if (content.includes(PROD_URL)) {
    content = content.replace(PROD_URL, TARGET_URL);
    content = content.replace(
      /\/\/ API Base URL.*$/m,
      TARGET_COMMENT
    );
    fs.writeFileSync(constantsPath, content);
    console.log('  Fluxez SDK patched to use development API');
  } else if (content.includes(DEV_URL)) {
    console.log('  Fluxez SDK already using development API');
  } else {
    console.log('  Fluxez SDK has unknown API URL, skipping patch');
  }
} catch (error) {
  console.error('  Failed to patch Fluxez SDK:', error.message);
  process.exit(1);
}
