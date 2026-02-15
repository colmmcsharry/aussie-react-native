/**
 * Onboarding persistence using AsyncStorage.
 * Matches the Vue app: hasSeenLongIntro + userLevel (no login).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_SEEN_ONBOARDING_KEY = 'hasSeenLongIntro';
const USER_LEVEL_KEY = 'userLevel';

export type UserLevel = 'elementary' | 'intermediate' | 'advanced' | 'fluent';

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setHasSeenOnboarding(): Promise<void> {
  await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
}

export async function getUserLevel(): Promise<UserLevel | null> {
  try {
    const value = await AsyncStorage.getItem(USER_LEVEL_KEY);
    if (value === 'elementary' || value === 'intermediate' || value === 'advanced' || value === 'fluent') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setUserLevel(level: UserLevel): Promise<void> {
  await AsyncStorage.setItem(USER_LEVEL_KEY, level);
}
