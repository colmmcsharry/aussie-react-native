import { useRouter } from 'expo-router';
import React from 'react';

import { OnboardingScreen } from '@/components/OnboardingScreen';

/**
 * Dev/testing route: run the full onboarding flow, then return to Feed.
 * Use the link on the Feed page to open this from Expo Go.
 */
export default function OnboardingPreviewScreen() {
  const router = useRouter();
  return (
    <OnboardingScreen
      onComplete={() => router.replace('/(tabs)')}
    />
  );
}
