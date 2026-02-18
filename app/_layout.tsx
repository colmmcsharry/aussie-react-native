import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { PaywallProvider } from "@/context/PaywallContext";
import { FredokaOne_400Regular } from "@expo-google-fonts/fredoka-one";
import { Nunito_500Medium } from "@expo-google-fonts/nunito/500Medium";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_900Black } from "@expo-google-fonts/nunito/900Black";
import { useFonts } from "expo-font";

import { OnboardingScreen } from "@/components/OnboardingScreen";
import { PaywallModal } from "@/components/PaywallModal";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getHasSeenOnboarding } from "@/services/onboarding";
import { setHasSeenPaywallOnce } from "@/services/paywall";
import {
  configureRevenueCat,
  getPremiumState,
  isPurchasesAvailable,
  purchaseLifetime,
  purchaseWeekly,
  restorePurchases,
} from "@/services/revenuecat";

export const unstable_settings = {
  anchor: "(tabs)",
};

/** When true, show onboarding every time (for testing). Use ?show_onboarding=1 in the URL. */
function getForceOnboarding(): boolean {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("show_onboarding") === "1" ||
      params.get("preview") === "onboarding"
    );
  }
  return false;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const params = useGlobalSearchParams<{
    show_onboarding?: string;
    preview?: string;
  }>();
  const forceOnboardingFromParams =
    params.show_onboarding === "1" || params.preview === "onboarding";

  const [fontsLoaded] = useFonts({
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_900Black,
    FredokaOne_400Regular,
  });

  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallWeeklyPrice, setPaywallWeeklyPrice] = useState("$1.00");
  const [paywallLifetimePrice, setPaywallLifetimePrice] = useState("$30.00");
  const [paywallLoadingWeekly, setPaywallLoadingWeekly] = useState(false);
  const [paywallLoadingLifetime, setPaywallLoadingLifetime] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  // On web, read URL on init so we can show onboarding on first paint when testing
  const [forceOnboarding, setForceOnboarding] = useState(getForceOnboarding);

  const refreshPremiumState = useCallback(async () => {
    try {
      const s = await getPremiumState();
      setIsPremium(s.isPremium);
    } catch {
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    refreshPremiumState();
  }, [refreshPremiumState]);

  useEffect(() => {
    setForceOnboarding(
      (prev) => prev || forceOnboardingFromParams || getForceOnboarding(),
    );
  }, [forceOnboardingFromParams]);

  useEffect(() => {
    getHasSeenOnboarding().then((seen) => {
      setHasSeenOnboarding(seen);
      setHasCheckedOnboarding(true);
    });
  }, []);

  useEffect(() => {
    if (!showPaywall) return;
    let cancelled = false;
    (async () => {
      try {
        await configureRevenueCat();
        const s = await getPremiumState();
        if (!cancelled) {
          setPaywallWeeklyPrice(s.weeklyPrice);
          setPaywallLifetimePrice(s.lifetimePrice);
        }
      } catch {
        if (!cancelled) {
          setPaywallWeeklyPrice("$1.00");
          setPaywallLifetimePrice("$30.00");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showPaywall]);

  const handlePaywallClose = () => {
    setHasSeenPaywallOnce();
    setShowPaywall(false);
  };

  const handlePurchaseWeekly = async () => {
    setPaywallLoadingWeekly(true);
    try {
      const { success } = await purchaseWeekly();
      if (success) {
        await refreshPremiumState();
        Alert.alert("Purchase successful", "You now have access to all Premium content.");
        handlePaywallClose();
      } else if (!(await isPurchasesAvailable())) {
        Alert.alert(
          "Purchases unavailable",
          "In-app purchases need a development build. In Expo Go the RevenueCat SDK isn't available.\n\nRun 'npx expo run:ios' or 'npx expo run:android' to create a dev build, then test purchases with the Test Store."
        );
      }
    } finally {
      setPaywallLoadingWeekly(false);
    }
  };

  const handlePurchaseLifetime = async () => {
    setPaywallLoadingLifetime(true);
    try {
      const { success } = await purchaseLifetime();
      if (success) {
        await refreshPremiumState();
        Alert.alert("Purchase successful", "You now have access to all Premium content.");
        handlePaywallClose();
      } else if (!(await isPurchasesAvailable())) {
        Alert.alert(
          "Purchases unavailable",
          "In-app purchases need a development build. In Expo Go the RevenueCat SDK isn't available.\n\nRun 'npx expo run:ios' or 'npx expo run:android' to create a dev build, then test purchases with the Test Store."
        );
      }
    } finally {
      setPaywallLoadingLifetime(false);
    }
  };

  const handleRestore = async () => {
    const { isPremium: restored } = await restorePurchases();
    if (restored) {
      await refreshPremiumState();
      handlePaywallClose();
    }
  };

  const openPaywall = useCallback(() => setShowPaywall(true), []);

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
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <OnboardingScreen
            onComplete={() => {
              setHasSeenOnboarding(true);
              // Defer paywall so the layout can switch from onboarding to main app first (fixes web/localhost)
              setTimeout(() => setShowPaywall(true), 50);
            }}
          />
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PaywallProvider openPaywall={openPaywall} isPremium={isPremium} refreshPremiumState={refreshPremiumState}>
          <PaywallModal
            visible={showPaywall}
            onClose={handlePaywallClose}
            onContinueFree={handlePaywallClose}
            weeklyPrice={paywallWeeklyPrice}
            lifetimePrice={paywallLifetimePrice}
            loadingWeekly={paywallLoadingWeekly}
            loadingLifetime={paywallLoadingLifetime}
            onPurchaseWeekly={handlePurchaseWeekly}
            onPurchaseLifetime={handlePurchaseLifetime}
            onRestore={handleRestore}
          />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="onboarding-preview"
              options={{ headerShown: false, presentation: "card" }}
            />
            <Stack.Screen
              name="video/[id]"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="quiz/[id]"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="videos"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
        </PaywallProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
