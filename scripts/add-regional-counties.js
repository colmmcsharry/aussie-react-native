#!/usr/bin/env node
/**
 * Adds regionalCounty to Regional entries in slang-data.json by extracting
 * from debug-cleaned.js (which has id + regionalCounty per regional quote).
 */
const fs = require('fs');
const path = require('path');

const debugPath = path.join(__dirname, 'debug-cleaned.js');
const dataPath = path.join(__dirname, '..', 'data', 'slang-data.json');

const src = fs.readFileSync(debugPath, 'utf8');
const start = src.indexOf('regionalQuotes: [');
if (start === -1) {
  console.error('regionalQuotes not found');
  process.exit(1);
}
let end = start + 'regionalQuotes: ['.length;
let depth = 1;
for (let i = end; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
const section = src.slice(start + 'regionalQuotes: ['.length, end);
const idToCounty = {};
const blockRe = /\{\s*"id":\s*"([^"]+)"[\s\S]*?"regionalCounty":\s*"([^"]+)"/g;
let block;
while ((block = blockRe.exec(section)) !== null) {
  idToCounty[block[1]] = block[2];
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const regional = data.quotes.Regional;
if (!Array.isArray(regional)) {
  console.error('data.quotes.Regional not found');
  process.exit(1);
}
let added = 0;
regional.forEach((entry) => {
  const county = idToCounty[entry.id];
  if (county) {
    entry.regionalCounty = county;
    added++;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Added regionalCounty to ${added} Regional entries.`);
console.log('Unique regions:', [...new Set(Object.values(idToCounty))].sort().join(', '));
