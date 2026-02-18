import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { PremiumCrown } from "@/components/PremiumCrown";
import { usePaywall } from "@/context/PaywallContext";

const CROWN_GOLD = "#F4B744";

type PremiumHeaderBadgeProps = {
  /** Size for both crown and tick (default 26). */
  size?: number;
};

/**
 * Single source of truth for the premium badge in app headers.
 * - When user has Premium: shows gold check-decagram (tick). Tap opens the shared "thanks for supporting" modal.
 * - When user does not have Premium: shows crown; tap opens paywall.
 */
export function PremiumHeaderBadge({ size = 26 }: PremiumHeaderBadgeProps) {
  const { openPaywall, isPremium, openPremiumThanksModal } = usePaywall();

  if (isPremium) {
    return (
      <View style={styles.wrap}>
        <MaterialCommunityIcons
          name="check-decagram-outline"
          size={size + 2}
          color={CROWN_GOLD}
        />
        <Pressable
          onPress={openPremiumThanksModal}
          style={StyleSheet.absoluteFill}
          hitSlop={12}
        />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <PremiumCrown size={size} />
      <Pressable
        onPress={openPaywall}
        style={StyleSheet.absoluteFill}
        hitSlop={12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
});
