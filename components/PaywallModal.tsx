import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { BodyFont, ButtonFont, Colors, HeadingFont } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const PAYWALL_GREEN = "#78C57C";
const PAYWALL_GREEN_DARK = "#5aab5e";
/** Light blue for paywall buttons (lighter shade of main app blue #194F89) */
const PAYWALL_BLUE_LIGHT = "#b9d8fa";
const PAYWALL_BLUE_LIGHT_DARK = "#b9d8fa";

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  onContinueFree: () => void;
  /** Weekly product price string from RevenueCat (e.g. "$1.00/week") */
  weeklyPrice?: string;
  /** Lifetime product price string from RevenueCat (e.g. "$30.00") */
  lifetimePrice?: string;
  loadingWeekly?: boolean;
  loadingLifetime?: boolean;
  onPurchaseWeekly?: () => void;
  onPurchaseLifetime?: () => void;
  onRestore?: () => void;
};

const FEATURES = [
  { label: "All Quizzes, Games & Videos", premium: true, free: false },
  { label: "Access to Rude/X-Rated slang", premium: true, free: false },
  { label: "New content added regularly", premium: true, free: false },
  { label: "Annoying ads", premium: false, free: true },
  { label: "Helps me improve the app", premium: true, free: false },
  { label: "Beer money for me", premium: true, free: false },
];

export function PaywallModal({
  visible,
  onClose,
  onContinueFree,
  weeklyPrice = "$1.00",
  lifetimePrice = "$30.00",
  loadingWeekly = false,
  loadingLifetime = false,
  onPurchaseWeekly,
  onPurchaseLifetime,
  onRestore,
}: PaywallModalProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const closeOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      closeOpacity.value = 0;
      const t = setTimeout(() => {
        closeOpacity.value = withTiming(1, { duration: 800 });
      }, 6000);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const closeButtonStyle = useAnimatedStyle(() => ({
    opacity: closeOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.mask}>
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Animated.View style={[styles.closeWrap, closeButtonStyle]}>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={16}
            >
              <Ionicons name="close" size={24} color={colors.icon} />
            </Pressable>
          </Animated.View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.heading, { color: colors.text }]}>
              Try a week Free Trial of
            </Text>
            <View style={styles.premiumBlock}>
              <MaterialCommunityIcons
                name="crown"
                size={36}
                color="#F4B744"
                style={styles.premiumCrown}
              />
              <Text style={[styles.premiumTitle, { color: colors.text }]}>
                Premium
              </Text>
              <Image
                source={require("@/assets/underline.png")}
                style={styles.premiumUnderline}
                resizeMode="contain"
              />
            </View>

            <View style={styles.tableWrap}>
              <View style={styles.tableRow}>
                <View style={styles.tableCell} />
                <View style={styles.tableCellIcon}>
                  <MaterialCommunityIcons
                    name="crown"
                    size={20}
                    color="#F4B744"
                  />
                </View>
                <View style={styles.tableCellIcon}>
                  <Text style={[styles.tableHeader, { color: colors.text }]}>
                    Free
                  </Text>
                </View>
              </View>
              {FEATURES.map((row, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i % 2 === 0 && { backgroundColor: "rgba(0,0,0,0.04)" },
                  ]}
                >
                  <View style={styles.tableCell}>
                    <Text
                      style={[styles.tableLabel, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {row.label}
                    </Text>
                  </View>
                  <View style={styles.tableCellIcon}>
                    {row.premium ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={PAYWALL_GREEN}
                      />
                    ) : (
                      <Ionicons name="close-circle" size={22} color="#e57373" />
                    )}
                  </View>
                  <View style={styles.tableCellIcon}>
                    {row.free ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={PAYWALL_GREEN}
                      />
                    ) : (
                      <Ionicons name="close-circle" size={22} color="#e57373" />
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={onPurchaseWeekly}
                style={({ pressed }) => [
                  styles.planButton,
                  { opacity: loadingWeekly ? 0.7 : pressed ? 0.9 : 1 },
                ]}
                disabled={loadingWeekly}
              >
                <Text style={styles.planLabel}>Weekly</Text>
                <Image
                  source={require("@/assets/dollar.png")}
                  style={styles.planButtonIcon}
                  resizeMode="contain"
                />
                <View style={styles.planTrialSpacer} />
                <Text style={styles.planPrice}>
                  {loadingWeekly ? "Loading..." : weeklyPrice}
                </Text>
              </Pressable>
              <Pressable
                onPress={onPurchaseLifetime}
                style={({ pressed }) => [
                  styles.planButton,
                  styles.planButtonLifetime,
                  { opacity: loadingLifetime ? 0.7 : pressed ? 0.9 : 1 },
                ]}
                disabled={loadingLifetime}
              >
                <Text style={styles.planLabel}>Lifetime</Text>
                <Image
                  source={require("@/assets/pitcher.png")}
                  style={styles.planButtonIcon}
                  resizeMode="contain"
                />
                <Text style={styles.planTrialText}>7 days free,</Text>
                <Text style={styles.planPrice}>
                  {loadingLifetime ? "Loading..." : lifetimePrice}
                </Text>
              </Pressable>
            </View>

            {onRestore && (
              <Pressable onPress={onRestore} style={styles.restoreButton}>
                <Text style={[styles.restoreText, { color: colors.icon }]}>
                  Restore Purchase
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={onContinueFree}
              style={({ pressed }) => [
                styles.continueButton,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.continueText, { color: "#687076" }]}>
                Continue with free version
              </Text>
            </Pressable>

            <Text style={[styles.terms, { color: colors.icon }]}>
              You'll get a reminder before your trial ends.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "95%",
    height: "90%",
    maxWidth: 500,
    borderRadius: 12,
    overflow: "hidden",
  },
  closeWrap: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  scroll: {
    maxHeight: "100%",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  hey: {
    fontFamily: BodyFont,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  heading: {
    fontFamily: ButtonFont,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 8,
  },
  premiumBlock: {
    alignItems: "center",
    marginBottom: 20,
  },
  premiumCrown: {},
  premiumTitle: {
    fontFamily: HeadingFont,
    fontSize: 22,
  },
  premiumUnderline: {
    width: 114,
    height: 14,
  },
  tableWrap: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableCell: {
    flex: 1,
  },
  tableCellIcon: {
    width: 38,
    minWidth: 38,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  tableCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeader: {
    fontFamily: ButtonFont,
    fontSize: 13,
  },
  tableLabel: {
    fontFamily: ButtonFont,
    fontSize: 15,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  planButton: {
    flex: 1,
    backgroundColor: "#eef6ff",
    paddingVertical: 16,
    borderWidth: 3,
    borderColor: PAYWALL_BLUE_LIGHT,
    paddingHorizontal: 12,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  planButtonLifetime: {
    backgroundColor: "#eef6ff",
  },
  planLabel: {
    fontFamily: ButtonFont,
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  planButtonIcon: {
    width: 32,
    height: 32,
    marginVertical: 6,
  },
  planTrialText: {
    fontFamily: BodyFont,
    fontSize: 11,
    color: "#777",
    marginBottom: 2,
  },
  planTrialSpacer: {
    height: 15,
    marginBottom: 2,
  },
  planPrice: {
    fontFamily: ButtonFont,
    fontSize: 14,
    color: "#333",
  },
  restoreButton: {
    alignSelf: "center",
    paddingVertical: 8,
    borderRadius: 50,
    borderColor: PAYWALL_BLUE_LIGHT,
    borderWidth: 1,
    width: 250,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  restoreText: {
    fontFamily: ButtonFont,
    fontSize: 15,
  },
  continueButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: 250,
    borderColor: PAYWALL_BLUE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
  },
  continueText: {
    fontFamily: ButtonFont,
    fontSize: 15,
  },
  terms: {
    fontFamily: BodyFont,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 16,
  },
});
