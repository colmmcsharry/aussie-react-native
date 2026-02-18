import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PremiumHeaderBadge } from "@/components/PremiumHeaderBadge";
import { HeadingFont } from "@/constants/theme";

const ACCENT_BLUE = "#194F89"; // Australian blue

type TabHeaderProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function TabHeader({ title, left, right }: TabHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8, backgroundColor: ACCENT_BLUE },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeftSlot}>{left ?? null}</View>
        <View style={styles.headerRight}>
          {right ?? <PremiumHeaderBadge size={26} />}
        </View>
        <View style={styles.headerTitleWrap} pointerEvents="none">
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    minHeight: 52,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    position: "relative" as const,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  headerLeftSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 80,
    minWidth: 80,
  },
  headerRight: {
    width: 80,
    minWidth: 80,
    alignItems: "flex-end",
  },
  headerTitleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: HeadingFont,
    color: "#fff",
    textAlign: "center",
  },
});
