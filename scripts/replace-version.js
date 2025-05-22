import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read package.json to get version
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Read compiled JS file
const indexPath = join('dist', 'index.js');
let content = readFileSync(indexPath, 'utf8');

// Replace placeholder with actual version
content = content.replace('__SDK_VERSION__', version);

// Write back
writeFileSync(indexPath, content);

console.log(`✓ Replaced SDK version with ${version}`);