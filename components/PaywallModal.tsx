import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
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

import { PremiumCrown } from "@/components/PremiumCrown";
import {
  BodyFont,
  ButtonFont,
  HeadingFont,
  mainAussieBlue,
} from "@/constants/theme";

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
        <View style={[styles.card, { backgroundColor: mainAussieBlue }]}>
          <Animated.View style={[styles.closeWrap, closeButtonStyle]}>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={16}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </Animated.View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerImageWrap}>
              <ExpoImage
                source={require("@/assets/slang-images/blue-fight-dark.jpg")}
                style={styles.headerImage}
                contentFit="contain"
              />
              <View style={styles.headerImageContent}>
                <Text style={styles.heading}>Try a week Free Trial of</Text>
                <View style={styles.premiumBlock}>
                  <PremiumCrown size={36} style={styles.premiumCrown} />
                  <Text style={styles.premiumTitle}>Premium</Text>
                  <Image
                    source={require("@/assets/underline.png")}
                    style={styles.premiumUnderline}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>

            <View style={styles.scrollBody}>
              <View style={styles.tableWrap}>
                <View style={styles.tableRow}>
                  <View style={styles.tableCell} />
                  <View style={styles.tableCellIcon}>
                    <PremiumCrown size={22} />
                  </View>
                  <View style={styles.tableCellIcon}>
                    <Text style={styles.tableHeader}>Free</Text>
                  </View>
                </View>
                {FEATURES.map((row, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tableRow,
                      i % 2 === 0 && {
                        backgroundColor: "rgba(255,255,255,0.08)",
                      },
                    ]}
                  >
                    <View style={styles.tableCell}>
                      <Text style={styles.tableLabel} numberOfLines={1}>
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
                        <Ionicons
                          name="close-circle"
                          size={22}
                          color="#e57373"
                        />
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
                        <Ionicons
                          name="close-circle"
                          size={22}
                          color="#e57373"
                        />
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
                    styles.planButtonRow,
                    { opacity: loadingWeekly ? 0.7 : pressed ? 0.9 : 1 },
                  ]}
                  disabled={loadingWeekly}
                >
                  <View style={styles.planButtonLeft}>
                    <View style={styles.planButtonTitleRow}>
                      <Text style={styles.planLabelInline}>Weekly</Text>
                      <Image
                        source={require("@/assets/dollar.png")}
                        style={styles.planButtonIconInline}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                  <Text style={styles.planPrice}>
                    {loadingWeekly ? "Loading..." : weeklyPrice}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onPurchaseLifetime}
                  style={({ pressed }) => [
                    styles.planButton,
                    styles.planButtonRow,
                    { opacity: loadingLifetime ? 0.7 : pressed ? 0.9 : 1 },
                  ]}
                  disabled={loadingLifetime}
                >
                  <View style={styles.planButtonLeft}>
                    <View style={styles.planButtonTitleRow}>
                      <Text style={styles.planLabelInline}>Lifetime</Text>
                      <Image
                        source={require("@/assets/pitcher.png")}
                        style={styles.planButtonIconInline}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.planTrialText}>7 days free</Text>
                  </View>
                  <Text style={styles.planPrice}>
                    {loadingLifetime ? "Loading..." : lifetimePrice}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.terms}>
                You'll get a reminder before your trial ends.
              </Text>

              {onRestore && (
                <Pressable onPress={onRestore} style={styles.restoreButton}>
                  <Text style={styles.restoreText}>Restore Purchase</Text>
                </Pressable>
              )}

              <Pressable
                onPress={onContinueFree}
                style={({ pressed }) => [
                  styles.continueButton,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text style={styles.continueText}>
                  Continue with free version
                </Text>
              </Pressable>
            </View>
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
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  closeWrap: {
    position: "absolute",
    top: 40,
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
    paddingBottom: 32,
    flexGrow: 1,
  },
  scrollBody: {
    paddingHorizontal: 24,
    paddingTop: 8,
    flex: 1,
    justifyContent: "center",
  },
  headerImageWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    minHeight: 160,
    overflow: "hidden",
    backgroundColor: mainAussieBlue,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerImageContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  hey: {
    fontFamily: BodyFont,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  heading: {
    fontFamily: ButtonFont,
    fontSize: 22,
    textAlign: "center",
    marginBottom: 8,
    color: "#fff",
  },
  premiumBlock: {
    alignItems: "center",
  },
  premiumCrown: {},
  premiumTitle: {
    fontFamily: HeadingFont,
    fontSize: 26,
    color: "#fff",
  },
  premiumUnderline: {
    top: -3,
    left: 2,
    width: 114,
    height: 14,
  },
  tableWrap: {
    marginBottom: 24,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 3,
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
    color: "#fff",
  },
  tableLabel: {
    fontFamily: ButtonFont,
    fontSize: 15,
    flex: 1,
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "column",
    gap: 14,
    marginBottom: 12,
  },
  planButton: {
    backgroundColor: "#eef6ff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 66,
  },
  planButtonRow: {
    flexDirection: "row",
  },
  planButtonLeft: {
    flex: 1,
    justifyContent: "center",
  },
  planButtonTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  planLabelInline: {
    fontFamily: ButtonFont,
    fontSize: 16,
    color: "#333",
  },
  planButtonIconInline: {
    width: 32,
    height: 32,
  },
  planTrialText: {
    fontFamily: BodyFont,
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    position: "absolute",
    bottom: -7,
    left: 0,
  },
  planPrice: {
    fontFamily: ButtonFont,
    fontSize: 16,
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
    color: "#fff",
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
    marginTop: 8,
    borderWidth: 1,
  },
  continueText: {
    fontFamily: ButtonFont,
    fontSize: 15,
    color: "#fff",
  },
  terms: {
    fontFamily: BodyFont,
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 18,
    color: "#fff",
  },
});
