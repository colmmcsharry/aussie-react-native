#!/usr/bin/env node
/**
 * Converts the Vuex store/index.js slang data into clean JSON
 * that can be used to generate TypeScript data files.
 */
const fs = require('fs');
const path = require('path');

const storeFile = path.join(__dirname, '..', 'slang-src', 'store', 'index.js');
const outputFile = path.join(__dirname, '..', 'data', 'slang-data.json');

let src = fs.readFileSync(storeFile, 'utf8');

// Extract just the state function body (between the first `({` and matching `})`)
const stateStart = src.indexOf('export const state = () => ({');
const actionsStart = src.indexOf('export const actions');
const stateBody = src.substring(stateStart, actionsStart);

// Replace require('@/assets/audio/xxx.m4a').default with just "xxx.m4a"
let cleaned = stateBody.replace(
  /require\('@\/assets\/audio\/([^']+)'\)\.default/g,
  "'$1'"
);

// Fix self-references like state.category that can't be evaluated
cleaned = cleaned.replace(/state\.category/g, 'null');
cleaned = cleaned.replace(/state\.\w+/g, 'null');

// Remove the export wrapper - make it a plain object
cleaned = cleaned.replace('export const state = () => ({', 'return ({');
cleaned = cleaned.replace(/\}\)\s*$/, '})');

// Wrap in a function we can evaluate
const fn = new Function(cleaned);
let state;
try {
  state = fn();
} catch (e) {
  console.error('Failed to parse state:', e.message);
  // Try to debug
  fs.writeFileSync(path.join(__dirname, 'debug-cleaned.js'), cleaned);
  console.error('Wrote debug file to scripts/debug-cleaned.js');
  process.exit(1);
}

const categories = state.categories;
const categoryKeys = {
  'Greetings': 'greetingsQuotes',
  'General': 'generalQuotes',
  'Drinking': 'drinkingQuotes',
  'Food': 'foodQuotes',
  'Compliments': 'complimentsQuotes',
  'Regional': 'regionalQuotes',
  'People': 'peopleQuotes',
  'Homonyms': 'homonymsQuotes',
  'Fighting': 'fightingQuotes',
  'Sports': 'sportsQuotes',
  'Rude': 'rudeQuotes',
  'sex': 'sexQuotes',
};

const output = {
  categories: categories,
  quotes: {},
};

let totalQuotes = 0;
let totalWithImages = 0;
const audioFiles = new Set();
const imageFiles = new Set();

for (const [catName, stateKey] of Object.entries(categoryKeys)) {
  const quotes = state[stateKey];
  if (!quotes) {
    console.warn(`No quotes found for category "${catName}" (key: ${stateKey})`);
    continue;
  }

  output.quotes[catName] = quotes.map(q => {
    const entry = {
      id: String(q.id),
      buttonTitle: q.buttonTitle,
      audioFile: q.audioPath, // now just the filename after regex replacement
      explanation: q.explanation,
      examples: q.examples || [],
      notes: q.notes || [],
    };

    if (q.image) {
      entry.image = q.image;
      imageFiles.add(q.image);
      totalWithImages++;
    }
    if (q.isPremiumQuote) {
      entry.isPremium = true;
    }

    audioFiles.add(q.audioPath);
    totalQuotes++;
    return entry;
  });

  console.log(`  ${catName}: ${quotes.length} quotes`);
}

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(`\nTotal: ${totalQuotes} quotes across ${categories.length} categories`);
console.log(`Quotes with images: ${totalWithImages}`);
console.log(`Unique audio files: ${audioFiles.size}`);
console.log(`Unique image files: ${imageFiles.size}`);
console.log(`\nOutput written to: ${outputFile}`);

// Also output the list of audio files for the require map generator
const audioListFile = path.join(__dirname, '..', 'data', 'audio-files.json');
fs.writeFileSync(audioListFile, JSON.stringify([...audioFiles].sort(), null, 2));
console.log(`Audio file list written to: ${audioListFile}`);
