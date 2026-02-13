/**
 * Quiz score persistence using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCORE_PREFIX = 'quizScore_';

export async function getQuizScore(quizId: number): Promise<number | null> {
  try {
    const val = await AsyncStorage.getItem(`${SCORE_PREFIX}${quizId}`);
    return val !== null ? Number(val) : null;
  } catch {
    return null;
  }
}

export async function saveQuizScore(quizId: number, score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(`${SCORE_PREFIX}${quizId}`, String(score));
  } catch (e) {
    console.error('Failed to save quiz score:', e);
  }
}

export async function getAllScores(): Promise<Record<number, number>> {
  const scores: Record<number, number> = {};
  try {
    const keys = await AsyncStorage.getAllKeys();
    const quizKeys = keys.filter((k) => k.startsWith(SCORE_PREFIX));
    const pairs = await AsyncStorage.multiGet(quizKeys);
    for (const [key, value] of pairs) {
      const id = Number(key.replace(SCORE_PREFIX, ''));
      if (value !== null) {
        scores[id] = Number(value);
      }
    }
  } catch (e) {
    console.error('Failed to load quiz scores:', e);
  }
  return scores;
}

export function getScoreColor(score: number): string {
  if (score <= 4) return '#c64a4a';
  if (score <= 7) return '#f5a623';
  return '#28a428';
}
