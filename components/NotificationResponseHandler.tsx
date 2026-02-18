import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";

import { useOpenSlangFromNotification } from "@/context/OpenSlangFromNotificationContext";
import { DAILY_REMINDER_ID } from "@/services/notifications";

/**
 * When user taps the daily slang reminder notification, navigate to Feed and set flag
 * so Feed opens the slang-of-the-day modal.
 */
export function NotificationResponseHandler() {
  const router = useRouter();
  const { setOpenSlangOnNextFeedFocus } = useOpenSlangFromNotification();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    const isDefaultAction =
      lastResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER;
    if (id === DAILY_REMINDER_ID && isDefaultAction) {
      setOpenSlangOnNextFeedFocus(true);
      router.replace("/");
      void Notifications.clearLastNotificationResponseAsync();
    }
  }, [lastResponse, setOpenSlangOnNextFeedFocus, router]);

  return null;
}
