/**
 * RevenueCat in-app purchases for Premium paywall.
 * Requires a development build (expo-dev-client) – does not run in Expo Go.
 *
 * Setup:
 * 1. Create a RevenueCat project and add your app (iOS + Android).
 * 2. In App Store Connect / Google Play create products:
 *    - Weekly subscription: e.g. $0.99 AUD/week (identifier like "aussie_weekly" or use RevenueCat's default weekly).
 *    - Lifetime: e.g. $29.99 AUD one-time (identifier like "aussie_lifetime" or use default lifetime).
 * 3. In RevenueCat dashboard → Products, add these product IDs and attach to the default Offering.
 * 4. Replace the API keys below with your RevenueCat iOS and Android API keys.
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

// Replace with your RevenueCat API keys from dashboard (Project → API keys)
const REVENUECAT_API_KEY_IOS = "appl_YOUR_IOS_API_KEY";
const REVENUECAT_API_KEY_ANDROID = "goog_YOUR_ANDROID_API_KEY";

export type PremiumState = {
  isPremium: boolean;
  weeklyPrice: string;
  lifetimePrice: string;
  weeklyPackage: unknown | null;
  lifetimePackage: unknown | null;
};

let configured = false;

async function getPurchases(): Promise<
  typeof import("react-native-purchases") | null
> {
  // Skip in Expo Go – react-native-purchases uses native code not included in Expo Go.
  // This prevents "could not connect" / "unknown error" when opening the app in Expo Go.
  const executionEnvironment = Constants.executionEnvironment;
  if (executionEnvironment === "storeClient") return null;
  if (Platform.OS !== "ios" && Platform.OS !== "android") return null;
  try {
    return require("react-native-purchases").default;
  } catch {
    return null;
  }
}

export async function configureRevenueCat(): Promise<void> {
  const Purchases = await getPurchases();
  if (!Purchases || configured) return;
  try {
    const apiKey =
      Platform.OS === "ios"
        ? REVENUECAT_API_KEY_IOS
        : REVENUECAT_API_KEY_ANDROID;
    if (apiKey.startsWith("appl_YOUR_") || apiKey.startsWith("goog_YOUR_"))
      return;
    Purchases.configure({ apiKey });
    configured = true;
  } catch (e) {
    console.warn("RevenueCat configure failed:", e);
  }
}

export async function getPremiumState(): Promise<PremiumState> {
  const fallback: PremiumState = {
    isPremium: false,
    weeklyPrice: "$1.00",
    lifetimePrice: "$30.00",
    weeklyPackage: null,
    lifetimePackage: null,
  };

  const Purchases = await getPurchases();
  if (!Purchases) return fallback;

  try {
    await configureRevenueCat();
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return fallback;

    const weeklyPkg =
      current.weekly ??
      current.availablePackages.find(
        (p: { packageType: string }) => p.packageType === "WEEKLY",
      ) ??
      null;
    const lifetimePkg =
      current.lifetime ??
      current.availablePackages.find(
        (p: { packageType: string }) => p.packageType === "LIFETIME",
      ) ??
      null;

    const weeklyPrice = weeklyPkg?.product?.priceString ?? fallback.weeklyPrice;
    const lifetimePrice =
      lifetimePkg?.product?.priceString ?? fallback.lifetimePrice;

    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;

    return {
      isPremium,
      weeklyPrice,
      lifetimePrice,
      weeklyPackage: weeklyPkg,
      lifetimePackage: lifetimePkg,
    };
  } catch (e) {
    console.warn("RevenueCat getPremiumState failed:", e);
    return fallback;
  }
}

export async function purchaseWeekly(): Promise<{ success: boolean }> {
  const Purchases = await getPurchases();
  if (!Purchases) return { success: false };
  try {
    await configureRevenueCat();
    const offerings = await Purchases.getOfferings();
    const pkg =
      offerings.current?.weekly ??
      offerings.current?.availablePackages?.find(
        (p: { packageType: string }) => p.packageType === "WEEKLY",
      );
    if (!pkg) {
      console.warn("Weekly package not found");
      return { success: false };
    }
    const result = await Purchases.purchasePackage(pkg);
    const isPremium =
      result.customerInfo &&
      Object.keys(result.customerInfo.entitlements.active).length > 0;
    return { success: !!isPremium };
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "PURCHASE_CANCELLED_ERROR") return { success: false };
    console.warn("Purchase weekly failed:", e);
    return { success: false };
  }
}

export async function purchaseLifetime(): Promise<{ success: boolean }> {
  const Purchases = await getPurchases();
  if (!Purchases) return { success: false };
  try {
    await configureRevenueCat();
    const offerings = await Purchases.getOfferings();
    const pkg =
      offerings.current?.lifetime ??
      offerings.current?.availablePackages?.find(
        (p: { packageType: string }) => p.packageType === "LIFETIME",
      );
    if (!pkg) {
      console.warn("Lifetime package not found");
      return { success: false };
    }
    const result = await Purchases.purchasePackage(pkg);
    const isPremium =
      result.customerInfo &&
      Object.keys(result.customerInfo.entitlements.active).length > 0;
    return { success: !!isPremium };
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "PURCHASE_CANCELLED_ERROR") return { success: false };
    console.warn("Purchase lifetime failed:", e);
    return { success: false };
  }
}

export async function restorePurchases(): Promise<{ isPremium: boolean }> {
  const Purchases = await getPurchases();
  if (!Purchases) return { isPremium: false };
  try {
    await configureRevenueCat();
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;
    return { isPremium };
  } catch (e) {
    console.warn("Restore purchases failed:", e);
    return { isPremium: false };
  }
}
