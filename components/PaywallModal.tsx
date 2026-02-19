import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useMemo } from "react";
import {
  Image,
  Modal,
  Platform,
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
  /** Yearly product price string from RevenueCat (e.g. "$10.00/year") */
  yearlyPrice?: string;
  /** Lifetime product price string from RevenueCat (e.g. "$30.00") */
  lifetimePrice?: string;
  loadingWeekly?: boolean;
  loadingYearly?: boolean;
  loadingLifetime?: boolean;
  onPurchaseWeekly?: () => void;
  onPurchaseYearly?: () => void;
  onPurchaseLifetime?: () => void;
  onRestore?: () => void;
};

function doubledPrice(priceStr: string): string {
  const match = priceStr.match(/[\d.,]+/);
  if (!match) return "";
  const num = parseFloat(match[0].replace(",", "."));
  if (isNaN(num)) return "";
  const doubled = num * 2;
  const prefix = priceStr.match(/^[^\d]*/)?.[0] ?? "";
  const suffix = priceStr.replace(/^[^\d]*[\d.,]+/, "");
  return `${prefix}${doubled.toFixed(2)}${suffix}`.trim();
}

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
  yearlyPrice = "$10.00",
  lifetimePrice = "$30.00",
  loadingWeekly = false,
  loadingYearly = false,
  loadingLifetime = false,
  onPurchaseWeekly,
  onPurchaseYearly,
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

  const launchOfferEndDate = useMemo(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    const month = next.toLocaleString("en-AU", { month: "long" });
    return `1st ${month}`;
  }, []);

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

              <View style={styles.launchOfferBanner}>
                <Text style={styles.launchOfferText}>
                  🔥 Launch offer – 50% off all plans until {launchOfferEndDate},
                  subscribe now, keep that price forever!
                </Text>
              </View>

              <View style={styles.plansRow}>
                <Pressable
                  onPress={onPurchaseWeekly}
                  style={({ pressed }) => [
                    styles.planCard,
                    { opacity: loadingWeekly ? 0.7 : pressed ? 0.9 : 1 },
                  ]}
                  disabled={loadingWeekly}
                >
                  <View style={styles.planCardContent}>
                    <Image
                      source={require("@/assets/dollar.png")}
                      style={styles.planCardIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.planCardLabel}>Weekly</Text>
                    <View style={styles.planCardTrialSlot}>
                      <Text style={styles.planCardTrialSpacer}> </Text>
                    </View>
                    <View>
                      {!loadingWeekly && weeklyPrice && (
                        <Text style={styles.planCardStrikethrough}>
                          {doubledPrice(weeklyPrice)}
                        </Text>
                      )}
                      <Text style={styles.planCardPrice}>
                        {loadingWeekly ? "..." : weeklyPrice}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={onPurchaseYearly}
                  style={({ pressed }) => [
                    styles.planCard,
                    { opacity: loadingYearly ? 0.7 : pressed ? 0.9 : 1 },
                  ]}
                  disabled={loadingYearly}
                >
                  <View style={styles.planCardContent}>
                    <Image
                      source={require("@/assets/pint.png")}
                      style={styles.planCardIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.planCardLabel}>Yearly</Text>
                    <View style={styles.planCardTrialSlot}>
                      <Text style={styles.planCardTrial}>7 days free,</Text>
                    </View>
                    <View>
                      {!loadingYearly && yearlyPrice && (
                        <Text style={styles.planCardStrikethrough}>
                          {doubledPrice(yearlyPrice)}
                        </Text>
                      )}
                      <Text style={styles.planCardPrice}>
                        {loadingYearly ? "..." : yearlyPrice}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={onPurchaseLifetime}
                  style={({ pressed }) => [
                    styles.planCard,
                    { opacity: loadingLifetime ? 0.7 : pressed ? 0.9 : 1 },
                  ]}
                  disabled={loadingLifetime}
                >
                  <View style={styles.planCardContent}>
                    <Image
                      source={require("@/assets/pitcher.png")}
                      style={styles.planCardIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.planCardLabel}>Lifetime</Text>
                    <View style={styles.planCardTrialSlot}>
                      <Text style={styles.planCardTrialSpacer}> </Text>
                    </View>
                    <View>
                      {!loadingLifetime && lifetimePrice && (
                        <Text style={styles.planCardStrikethrough}>
                          {doubledPrice(lifetimePrice)}
                        </Text>
                      )}
                      <Text style={styles.planCardPrice}>
                        {loadingLifetime ? "..." : lifetimePrice}
                      </Text>
                    </View>
                  </View>
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

              {Platform.OS === "android" && (
                <Text style={styles.androidDisclaimer}>
                  Trial will automatically convert to paid unless cancelled at
                  least 24 hours before end of trial. You'll get an email
                  reminder. Cancel in the Play Store or your app settings.
                </Text>
              )}
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
    width: 120,
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
  launchOfferBanner: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: "center",
  },
  launchOfferText: {
    fontFamily: ButtonFont,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  plansRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    justifyContent: "center",
  },
  planCard: {
    flex: 1,
    backgroundColor: "#eef6ff",
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  planCardContent: {
    alignItems: "center",
  },
  planCardIcon: {
    width: 36,
    height: 36,
    marginBottom: 6,
  },
  planCardLabel: {
    fontFamily: ButtonFont,
    fontSize: 14,
    color: "#333",
  },
  planCardTrialSlot: {
    minHeight: 0,
    marginTop: 1,
    marginBottom: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  planCardTrial: {
    fontFamily: BodyFont,
    fontSize: 10,
    color: "#919191",
  },
  planCardStrikethrough: {
    fontFamily: BodyFont,
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
  },
  planCardTrialSpacer: {
    fontSize: 10,
    opacity: 0,
  },
  planCardPrice: {
    fontFamily: ButtonFont,
    fontSize: 13,
    color: "#333",
    marginTop: 4,
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
  androidDisclaimer: {
    fontFamily: BodyFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 14,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
});
