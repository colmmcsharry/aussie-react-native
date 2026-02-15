import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useFonts } from 'expo-font';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';
import { FredokaOne_400Regular } from '@expo-google-fonts/fredoka-one';

import { OnboardingScreen } from '@/components/OnboardingScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getHasSeenOnboarding } from '@/services/onboarding';

export const unstable_settings = {
  anchor: '(tabs)',
};

/** When true, show onboarding every time (for testing). Use ?show_onboarding=1 in the URL. */
function getForceOnboarding(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('show_onboarding') === '1' || params.get('preview') === 'onboarding';
  }
  return false;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const params = useGlobalSearchParams<{ show_onboarding?: string; preview?: string }>();
  const forceOnboardingFromParams =
    params.show_onboarding === '1' || params.preview === 'onboarding';

  const [fontsLoaded] = useFonts({
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_900Black,
    FredokaOne_400Regular,
  });

  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  // On web, read URL on init so we can show onboarding on first paint when testing
  const [forceOnboarding, setForceOnboarding] = useState(getForceOnboarding);

  useEffect(() => {
    setForceOnboarding((prev) => prev || forceOnboardingFromParams || getForceOnboarding());
  }, [forceOnboardingFromParams]);

  useEffect(() => {
    getHasSeenOnboarding().then((seen) => {
      setHasSeenOnboarding(seen);
      setHasCheckedOnboarding(true);
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (!hasCheckedOnboarding) {
    return null;
  }

  const showOnboarding = forceOnboarding || !hasSeenOnboarding;

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <OnboardingScreen onComplete={() => setHasSeenOnboarding(true)} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding-preview"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="video/[id]"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="quiz/[id]"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="videos"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
