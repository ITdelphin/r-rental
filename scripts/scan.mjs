import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Load en.json keys
const en = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/locales/en.json'), 'utf8'));
const enKeys = new Set(Object.keys(en));

// Find all files
const srcDir = path.join(root, 'src');
const files = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !p.includes('node_modules')) walk(p);
    else if (e.isFile() && /\.(tsx?)$/.test(e.name)) files.push(p);
  }
}
walk(srcDir);

const usedKeys = new Set();
const missingKeys = new Set();
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/t\(['"]([^'"]+)['"]\)/g);
  for (const m of matches) {
    usedKeys.add(m[1]);
    if (!enKeys.has(m[1])) missingKeys.add(m[1]);
  }
}

console.log('\n=== MISSING TRANSLATION KEYS (used in code but NOT in en.json) ===');
if (missingKeys.size === 0) console.log('  None found');
else for (const k of [...missingKeys].sort()) console.log('  ' + k);

console.log('\n=== TRANSLATION KEYS IN en.json BUT NEVER USED IN CODE ===');
const unused = [...enKeys].filter(k => !usedKeys.has(k)).sort();
if (unused.length === 0) console.log('  None found');
else for (const k of unused) console.log('  ' + k);

console.log('\nTotal en.json keys:', enKeys.size);
console.log('Total keys used in code:', usedKeys.size);
