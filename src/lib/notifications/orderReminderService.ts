/**
 * Recurring Order Notification Service for Pizza Nova
 * Manages browser push notification permissions, inactivity tracking,
 * favorite meal detection, and reminders when customers haven't ordered for X days (e.g. 2 weeks).
 */

export interface ReminderPreferences {
  enabled: boolean;
  intervalDays: number; // e.g. 14 for 2 weeks
  lastOrderDate: number | null; // timestamp ms
  lastReminderSentDate: number | null;
  favoriteMeal: string;
  favoriteProductId?: string | null;
  customerName?: string | null;
}

const STORAGE_KEYS = {
  PREFERENCES: "ph_order_reminder_prefs",
  LAST_ORDER: "ph_last_order_timestamp",
  FAVORITE_MEAL: "ph_favorite_meal_name",
  CUSTOMER_PHONE: "ph_customer_phone",
};

export const DEFAULT_PREFERENCES: ReminderPreferences = {
  enabled: false,
  intervalDays: 14, // 2 weeks default
  lastOrderDate: null,
  lastReminderSentDate: null,
  favoriteMeal: "بيتزا سوبر سوبريم 66",
  favoriteProductId: null,
  customerName: null,
};

let memoryPreferences: ReminderPreferences = { ...DEFAULT_PREFERENCES };

/**
 * Loads current reminder preferences from localStorage (or memory in SSR/tests)
 */
export function getReminderPreferences(): ReminderPreferences {
  if (typeof window === "undefined") return memoryPreferences;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error("Failed to load reminder preferences:", e);
  }

  // Fallback checks from existing app storage
  const legacyLastOrder = localStorage.getItem(STORAGE_KEYS.LAST_ORDER);
  const legacyFavMeal = localStorage.getItem(STORAGE_KEYS.FAVORITE_MEAL);

  return {
    ...DEFAULT_PREFERENCES,
    lastOrderDate: legacyLastOrder ? Number(legacyLastOrder) : null,
    favoriteMeal: legacyFavMeal || DEFAULT_PREFERENCES.favoriteMeal,
  };
}

/**
 * Saves reminder preferences to localStorage (or memory in SSR/tests)
 */
export function saveReminderPreferences(
  prefs: Partial<ReminderPreferences>
): ReminderPreferences {
  const current = getReminderPreferences();
  const updated: ReminderPreferences = { ...current, ...prefs };

  if (typeof window === "undefined") {
    memoryPreferences = updated;
    return updated;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    if (updated.lastOrderDate) {
      localStorage.setItem(STORAGE_KEYS.LAST_ORDER, String(updated.lastOrderDate));
    }
    if (updated.favoriteMeal) {
      localStorage.setItem(STORAGE_KEYS.FAVORITE_MEAL, updated.favoriteMeal);
    }
  } catch (e) {
    console.error("Failed to save reminder preferences:", e);
  }

  return updated;
}

/**
 * Checks if browser supports Notification API
 */
export function isNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "Notification" in window;
}

/**
 * Gets the current browser notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

/**
 * Requests notification permission from user and registers Service Worker
 */
export async function requestReminderPermission(): Promise<{
  granted: boolean;
  permission: NotificationPermission;
}> {
  if (!isNotificationSupported()) {
    return { granted: false, permission: "denied" };
  }

  try {
    // Register service worker if available
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (err) {
        console.warn("Service worker registration skipped or failed:", err);
      }
    }

    const permission = await Notification.requestPermission();
    const granted = permission === "granted";

    if (granted) {
      saveReminderPreferences({ enabled: true });
    }

    return { granted, permission };
  } catch (e) {
    console.error("Error requesting notification permission:", e);
    return { granted: false, permission: "denied" };
  }
}

/**
 * Sends a browser notification (via ServiceWorker registration or Notification constructor)
 */
export async function sendBrowserNotification(
  title: string,
  options: NotificationOptions & { url?: string }
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  try {
    // Prefer Service Worker registration if active
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        await (registration as any).showNotification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          vibrate: [200, 100, 200],
          ...options,
          data: {
            url: options.url || "/menu",
            ...(options.data || {}),
          },
        });
        return true;
      }
    }

    // Fallback to standard window Notification
    const notif = new Notification(title, {
      icon: "/favicon.ico",
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notif.close();
    };

    return true;
  } catch (e) {
    console.error("Failed to display notification:", e);
    return false;
  }
}

/**
 * Computes whether a customer is due for an inactivity reminder
 */
export function checkReminderEligibility(prefs?: ReminderPreferences): {
  isDue: boolean;
  daysSinceLastOrder: number;
  thresholdDays: number;
  favoriteMeal: string;
} {
  const current = prefs || getReminderPreferences();
  const now = Date.now();

  // If customer has never ordered, default to an anchor 14 days ago for demonstration
  const lastOrder = current.lastOrderDate || now - current.intervalDays * 86400000;
  const elapsedMs = now - lastOrder;
  const daysSinceLastOrder = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));

  const isDue =
    current.enabled &&
    daysSinceLastOrder >= current.intervalDays &&
    // Don't send more than once every 24 hours
    (!current.lastReminderSentDate || now - current.lastReminderSentDate > 86400000);

  return {
    isDue,
    daysSinceLastOrder,
    thresholdDays: current.intervalDays,
    favoriteMeal: current.favoriteMeal || "بيتزا نوڤا المفضلة",
  };
}

import { Language } from "@/types";

/**
 * Checks customer inactivity and triggers the push reminder if eligible
 */
export async function triggerDueReminder(
  language: Language = "ar",
  force: boolean = false
): Promise<boolean> {
  const prefs = getReminderPreferences();

  if (!prefs.enabled && !force) {
    return false;
  }

  const eligibility = checkReminderEligibility(prefs);

  if (!eligibility.isDue && !force) {
    return false;
  }

  const meal =
    prefs.favoriteMeal ||
    (language === "ar"
      ? "وجبتك المفضلة"
      : language === "id"
      ? "menu favorit Anda"
      : "your favorite meal");
  const days = eligibility.daysSinceLastOrder || prefs.intervalDays;

  const title =
    language === "ar"
      ? `🍕 اشتقنا لك في بيتزا نوڤا!`
      : language === "id"
      ? `🍕 Kami Rindu Anda di Pizza Nova!`
      : `🍕 Pizza Nova: We Miss You!`;

  const body =
    language === "ar"
      ? `مرّ ${days} يوماً على آخر طلب لك! هل حان وقت الاستمتاع بـ (${meal}) ساخنة من الفرن الحجري؟ اطلب مسبقاً الآن واستلم بدون انتظار.`
      : language === "id"
      ? `Sudah ${days} hari sejak pesanan terakhir Anda! Waktunya menikmati (${meal}) hangat dari oven batu? Pesan sekarang tanpa antre!`
      : `It's been ${days} days since your last order! Craving your favorite (${meal}) fresh from the stone oven? Order ahead now!`;

  const sent = await sendBrowserNotification(title, {
    body,
    tag: "pizza-house-recurring-order-reminder",
    url: "/menu",
    requireInteraction: true,
  });

  if (sent) {
    saveReminderPreferences({
      lastReminderSentDate: Date.now(),
    });
  }

  return sent;
}

/**
 * Simulates a due reminder immediately for user testing / preview
 */
export async function simulateDueReminder(language: Language = "ar"): Promise<boolean> {
  const prefs = getReminderPreferences();

  // Ensure permission is requested
  const perm = getNotificationPermission();
  if (perm !== "granted") {
    const res = await requestReminderPermission();
    if (!res.granted) {
      return false;
    }
  }

  // Force trigger reminder
  return triggerDueReminder(language, true);
}

/**
 * Automatically updates customer's last order timestamp and favorite item
 * Called upon successful order placement
 */
export function recordCompletedOrderForReminders(orderData: {
  productName?: string;
  productId?: string;
  customerName?: string;
}) {
  const current = getReminderPreferences();
  const updates: Partial<ReminderPreferences> = {
    lastOrderDate: Date.now(),
  };

  if (orderData.productName) {
    updates.favoriteMeal = orderData.productName;
  }
  if (orderData.productId) {
    updates.favoriteProductId = orderData.productId;
  }
  if (orderData.customerName) {
    updates.customerName = orderData.customerName;
  }

  saveReminderPreferences(updates);
}
