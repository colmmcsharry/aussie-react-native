#!/usr/bin/env node
/**
 * Generates static require() maps for audio files and slang images.
 * Metro bundler cannot handle dynamic requires, so we need a static mapping.
 */
const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '..', 'assets', 'audio');
const imageDir = path.join(__dirname, '..', 'assets', 'slang-images');
const dataDir = path.join(__dirname, '..', 'data');

// Read the list of audio files referenced in the slang data
const slangData = JSON.parse(fs.readFileSync(path.join(dataDir, 'slang-data.json'), 'utf8'));
const referencedAudio = new Set();
const referencedImages = new Set();

for (const quotes of Object.values(slangData.quotes)) {
  for (const q of quotes) {
    if (q.audioFile) referencedAudio.add(q.audioFile);
    if (q.image) referencedImages.add(q.image);
  }
}

// Check which referenced audio files actually exist
const existingAudio = new Set(fs.readdirSync(audioDir));
const missingAudio = [];
const audioEntries = [];

for (const file of [...referencedAudio].sort()) {
  if (existingAudio.has(file)) {
    audioEntries.push(`  '${file}': require('@/assets/audio/${file}'),`);
  } else {
    missingAudio.push(file);
  }
}

if (missingAudio.length > 0) {
  console.warn(`WARNING: ${missingAudio.length} referenced audio files not found:`);
  missingAudio.forEach(f => console.warn(`  - ${f}`));
}

// Generate audio map
const audioMapContent = `// AUTO-GENERATED - Do not edit manually
// Run: node scripts/generate-require-maps.js to regenerate

/**
 * Static require map for audio files.
 * Metro bundler needs static requires, so we can't do dynamic require(variable).
 */
export const audioMap: Record<string, any> = {
${audioEntries.join('\n')}
};
`;

fs.writeFileSync(path.join(dataDir, 'audio-map.ts'), audioMapContent);
console.log(`Generated audio map with ${audioEntries.length} entries`);

// Generate image map for slang entry images
const existingImages = new Set(fs.readdirSync(imageDir));
const imageEntries = [];

for (const file of [...referencedImages].sort()) {
  if (existingImages.has(file)) {
    imageEntries.push(`  '${file}': require('@/assets/slang-images/${file}'),`);
  } else {
    console.warn(`WARNING: Image not found: ${file}`);
  }
}

// Also add category icons
const categories = ['Greetings', 'General', 'Drinking', 'Food', 'Compliments', 'Regional', 'People', 'Homonyms', 'Fighting', 'Sports', 'Rude', 'sex'];
for (const cat of categories) {
  const file = `${cat}.png`;
  if (existingImages.has(file)) {
    imageEntries.push(`  '${file}': require('@/assets/slang-images/${file}'),`);
  }
}

const imageMapContent = `// AUTO-GENERATED - Do not edit manually
// Run: node scripts/generate-require-maps.js to regenerate

/**
 * Static require map for slang images (entry images + category icons).
 */
export const slangImageMap: Record<string, any> = {
${imageEntries.join('\n')}
};
`;

fs.writeFileSync(path.join(dataDir, 'image-map.ts'), imageMapContent);
console.log(`Generated image map with ${imageEntries.length} entries`);
