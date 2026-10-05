"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ReminderPreferences,
  getReminderPreferences,
  saveReminderPreferences,
  requestReminderPermission,
  getNotificationPermission,
  triggerDueReminder,
  simulateDueReminder,
  isNotificationSupported,
  checkReminderEligibility,
} from "@/lib/notifications/orderReminderService";
import { useApp } from "@/context/AppContext";

export function useRecurringOrderReminder() {
  const { language } = useApp();
  const [preferences, setPreferences] = useState<ReminderPreferences>(getReminderPreferences());
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [eligibility, setEligibility] = useState(() => checkReminderEligibility(preferences));
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showInAppReminder, setShowInAppReminder] = useState<boolean>(false);

  // Sync state on client mount
  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    const prefs = getReminderPreferences();
    setPreferences(prefs);
    setEligibility(checkReminderEligibility(prefs));

    // Register service worker if supported
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("ServiceWorker register failed:", err));
    }

    // Automatic inactivity check: If user enabled reminders and is due (e.g. 14 days elapsed), fire!
    const timer = setTimeout(() => {
      if (prefs.enabled) {
        const check = checkReminderEligibility(prefs);
        if (check.isDue) {
          triggerDueReminder(language).then((sent) => {
            if (!sent) {
              // Fallback to in-app banner if browser notifications are blocked/unsupported
              setShowInAppReminder(true);
            }
          });
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [language]);

  const enableReminders = useCallback(async () => {
    const res = await requestReminderPermission();
    setPermission(res.permission);
    if (res.granted) {
      const updated = saveReminderPreferences({ enabled: true });
      setPreferences(updated);
      setEligibility(checkReminderEligibility(updated));
      return true;
    }
    return false;
  }, []);

  const disableReminders = useCallback(() => {
    const updated = saveReminderPreferences({ enabled: false });
    setPreferences(updated);
    setEligibility(checkReminderEligibility(updated));
  }, []);

  const updateInterval = useCallback((intervalDays: number) => {
    const updated = saveReminderPreferences({ intervalDays });
    setPreferences(updated);
    setEligibility(checkReminderEligibility(updated));
  }, []);

  const updateFavoriteMeal = useCallback((favoriteMeal: string) => {
    const updated = saveReminderPreferences({ favoriteMeal });
    setPreferences(updated);
    setEligibility(checkReminderEligibility(updated));
  }, []);

  const testNotification = useCallback(async () => {
    setIsSimulating(true);
    try {
      const sent = await simulateDueReminder(language);
      if (!sent) {
        setShowInAppReminder(true);
      }
      return sent;
    } finally {
      setIsSimulating(false);
    }
  }, [language]);

  return {
    preferences,
    permission,
    isSupported,
    eligibility,
    isSimulating,
    showInAppReminder,
    setShowInAppReminder,
    enableReminders,
    disableReminders,
    updateInterval,
    updateFavoriteMeal,
    testNotification,
  };
}
