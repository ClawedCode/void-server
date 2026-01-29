#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const coverageDir = path.resolve(__dirname, '../coverage/v8');
const repoRoot = path.resolve(__dirname, '..');
const repoUrl = pathToFileURL(repoRoot + path.sep).href;
const oldPrefix = 'file:///app/';

if (!fs.existsSync(coverageDir)) {
  console.error('coverage/v8 not found. Run the tests first.');
  process.exit(1);
}

const entries = fs.readdirSync(coverageDir).filter(name => name.startsWith('coverage-') && name.endsWith('.json'));
let changedFiles = 0;

for (const name of entries) {
  const filePath = path.join(coverageDir, name);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`Skipping ${name}: ${err.message}`);
    continue;
  }

  let changed = false;
  if (Array.isArray(data.result)) {
    for (const entry of data.result) {
      if (entry.url && entry.url.startsWith(oldPrefix)) {
        entry.url = repoUrl + entry.url.slice(oldPrefix.length);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data));
    changedFiles += 1;
  }
}

console.log(`Coverage remap complete. Updated ${changedFiles} file(s).`);
