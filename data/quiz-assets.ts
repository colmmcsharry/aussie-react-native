/**
 * Static require maps for quiz-specific assets.
 * Quiz images and result sound effects.
 */

// Quiz question images
export const quizImageMap: Record<string, any> = {
  'snags.jpg': require('@/assets/slang-images/snags.jpg'),
  'offo.jpeg': require('@/assets/slang-images/offo.jpeg'),
  'thongs.jpeg': require('@/assets/slang-images/thongs.jpeg'),
  'bogan.webp': require('@/assets/slang-images/bogan.webp'),
  'slainte.jpg': require('@/assets/slang-images/slainte.jpg'),
  'esk.jpeg': require('@/assets/slang-images/esk.jpeg'),
  'schooner.jpg': require('@/assets/slang-images/schooner.jpg'),
  'goon.jpg': require('@/assets/slang-images/goon.jpg'),
  'rum.jpeg': require('@/assets/slang-images/rum.jpeg'),
  'shoey.jpeg': require('@/assets/slang-images/shoey.jpeg'),
  'specky.jpg': require('@/assets/slang-images/specky.jpg'),
  'sausroll.jpeg': require('@/assets/slang-images/sausroll.jpeg'),
};

// Quiz audio clips (for questions that have audio)
export const quizAudioMap: Record<string, any> = {
  'intense.m4a': require('@/assets/audio/intense.m4a'),
};

// Result sound effects
export const resultSounds = {
  fail: require('@/assets/audio/fail.mp3'),
  decent: require('@/assets/audio/didgeridoo.m4a'),
  perfect: require('@/assets/audio/aussie-oi-chant.mp3'),
};

// Result character images (sad, meh, aussie man, aussie man gold)
export const resultCharacterImages: Record<'sad' | 'meh' | 'good' | 'legend', number> = {
  sad: require('@/assets/quiz-results/sad.png'),
  meh: require('@/assets/quiz-results/meh.png'),
  good: require('@/assets/quiz-results/aussieman.png'),
  legend: require('@/assets/quiz-results/aussiemanGold.png'),
};

// Result stamp images (green badges: DRONGO, NOTBAD, GOOD ON YA / FAIR, LEGEND)
export const resultStampImages: Record<'DRONGO' | 'NOTBAD' | 'FAIR' | 'legend', number> = {
  DRONGO: require('@/assets/quiz-results/DRONGO.png'),
  NOTBAD: require('@/assets/quiz-results/NOTBAD.png'),
  FAIR: require('@/assets/quiz-results/FAIR.png'),
  legend: require('@/assets/quiz-results/legend.png'),
};
