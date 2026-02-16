/**
 * Paywall display state (e.g. show once after first onboarding).
 * Premium purchase state is synced from RevenueCat in services/revenuecat.ts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_SEEN_PAYWALL_KEY = 'hasSeenPaywallOnce';

export async function getHasSeenPaywallOnce(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(HAS_SEEN_PAYWALL_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setHasSeenPaywallOnce(): Promise<void> {
  await AsyncStorage.setItem(HAS_SEEN_PAYWALL_KEY, 'true');
}
