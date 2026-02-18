/**
 * Local notifications for "one slang phrase per day" – daily reminder at a set time.
 * Uses expo-notifications; schedule is stored so we can cancel/reschedule.
 * Not available on web – all APIs no-op or return null/false.
 */

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

/** Identifier for the daily slang reminder; used to detect when user taps that notification. */
export const DAILY_REMINDER_ID = "aussie-slang-daily";

/** Scheduling APIs are only available on iOS and Android. */
const isNotificationsAvailable =
  Platform.OS === "ios" || Platform.OS === "android";

/** Show notifications (banner, sound) when app is in the foreground. Call early on app load. */
function setForegroundNotificationHandler(): void {
  if (!isNotificationsAvailable) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
setForegroundNotificationHandler();

/** Default time for daily reminder (24h). TODO: revert to 9:00 after testing (19:45 Dublin). */
export const DEFAULT_REMINDER_HOUR = 19;
export const DEFAULT_REMINDER_MINUTE = 45;

/** Request permission and return whether we can schedule. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationsAvailable) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Check if we already have permission. */
export async function hasNotificationPermission(): Promise<boolean> {
  if (!isNotificationsAvailable) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/** Schedule a daily local notification at the given time (e.g. "Your Aussie slang of the day is ready!"). */
export async function scheduleDailyReminder(
  hour: number = DEFAULT_REMINDER_HOUR,
  minute: number = DEFAULT_REMINDER_MINUTE
): Promise<string | null> {
  if (!isNotificationsAvailable) return null;
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "Your Aussie slang of the day is ready! 🇦🇺",
      body: "One phrase per day – tap to learn today's slang.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return identifier;
}

/** Cancel the daily reminder. */
export async function cancelDailyReminder(): Promise<void> {
  if (!isNotificationsAvailable) return;
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
}

/** Get the next trigger time for the daily reminder, if scheduled. */
export async function getNextReminderDate(): Promise<Date | null> {
  if (!isNotificationsAvailable) return null;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const daily = scheduled.find((t) => t.identifier === DAILY_REMINDER_ID);
  if (!daily) return null;
  const trigger = daily.trigger as { hour?: number; minute?: number } | null;
  const hour = trigger?.hour ?? DEFAULT_REMINDER_HOUR;
  const minute = trigger?.minute ?? DEFAULT_REMINDER_MINUTE;
  const next = await Notifications.getNextTriggerDateAsync({
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  });
  return next ? new Date(next) : null;
}
