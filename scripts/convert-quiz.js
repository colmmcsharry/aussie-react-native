#!/usr/bin/env node
/**
 * Extract quiz data from quiz.vue and generate a clean TypeScript data file.
 */
const fs = require('fs');
const path = require('path');

const quizFile = path.join(__dirname, '..', 'slang-src', 'pages', 'quiz.vue');
const outputFile = path.join(__dirname, '..', 'data', 'quiz-data.ts');

const src = fs.readFileSync(quizFile, 'utf8');

// Extract the script section
const scriptMatch = src.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('Could not find script section');
  process.exit(1);
}

const scriptContent = scriptMatch[1];

// Extract all questions arrays (questions1 through questions20)
const quizzes = [];
const quizNames = {
  1: 'Quiz 1',
  2: 'Quiz 2',
  3: 'Quiz 3',
  4: 'Quiz 4',
  5: 'Alcohol',
  6: 'Food & Drink',
  7: 'Sports',
  8: 'Regional',
  9: 'Dublin',
  10: 'Quiz 10',
  11: 'Quiz 11',
  12: 'Quiz 12',
  13: 'Quiz 13',
  14: 'Quiz 14',
  15: 'Quiz 15',
  16: 'Quiz 16',
  17: 'Quiz 17',
  18: 'Quiz 18',
  19: 'Quiz 19',
  20: 'Quiz 20',
};

for (let i = 1; i <= 20; i++) {
  // Find the questions array for this quiz number
  const pattern = new RegExp(`questions${i}\\s*:\\s*\\[`, 'g');
  const match = pattern.exec(scriptContent);
  if (!match) {
    console.warn(`Could not find questions${i}`);
    continue;
  }
  
  // Find the matching closing bracket
  let depth = 1;
  let pos = match.index + match[0].length;
  const start = pos;
  while (depth > 0 && pos < scriptContent.length) {
    if (scriptContent[pos] === '[') depth++;
    if (scriptContent[pos] === ']') depth--;
    pos++;
  }
  
  const arrayContent = scriptContent.substring(start, pos - 1);
  
  // Clean up require() calls for audio
  let cleaned = arrayContent.replace(
    /require\('@\/assets\/audio\/([^']+)'\)\.default/g,
    "'$1'"
  );
  
  // Parse the array using eval (safe since this is local data)
  let questions;
  try {
    questions = eval(`[${cleaned}]`);
  } catch (e) {
    console.error(`Failed to parse questions${i}:`, e.message);
    continue;
  }
  
  quizzes.push({
    id: i,
    name: quizNames[i],
    questions: questions.map(q => ({
      text: q.text,
      answers: q.answers,
      correctAnswer: q.correctAnswer,
      ...(q.image ? { image: q.image } : {}),
      ...(q.audio ? { audio: q.audio } : {}),
    }))
  });
  
  console.log(`  Quiz ${i} (${quizNames[i]}): ${questions.length} questions`);
}

// Generate TypeScript file
let output = `/**
 * Quiz data - 20 quizzes with 10 questions each.
 * Auto-generated from the original Vue codebase.
 */

export interface QuizQuestion {
  text: string;
  answers: string[];
  correctAnswer: string;
  image?: string;
  audio?: string;
}

export interface Quiz {
  id: number;
  name: string;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = ${JSON.stringify(quizzes, null, 2)};

export function getQuiz(id: number): Quiz | undefined {
  return quizzes.find(q => q.id === id);
}
`;

fs.writeFileSync(outputFile, output);
console.log(`\nGenerated ${quizzes.length} quizzes to ${outputFile}`);
