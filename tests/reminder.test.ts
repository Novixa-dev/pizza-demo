import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_PREFERENCES,
  getReminderPreferences,
  saveReminderPreferences,
  checkReminderEligibility,
  recordCompletedOrderForReminders,
  ReminderPreferences,
} from "@/lib/notifications/orderReminderService";

describe("Recurring Order Notification & Inactivity Reminder Service", () => {
  beforeEach(() => {
    // Reset simulated localStorage
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("provides correct default preferences (14 days / 2 weeks)", () => {
    expect(DEFAULT_PREFERENCES.intervalDays).toBe(14);
    expect(DEFAULT_PREFERENCES.enabled).toBe(false);
    expect(DEFAULT_PREFERENCES.favoriteMeal).toBeDefined();
  });

  it("correctly identifies when customer is due for an inactivity reminder after 14 days", () => {
    const now = Date.now();
    const fifteenDaysAgo = now - 15 * 86400000;

    const prefs: ReminderPreferences = {
      enabled: true,
      intervalDays: 14,
      lastOrderDate: fifteenDaysAgo,
      lastReminderSentDate: null,
      favoriteMeal: "بيتزا سوبر سوبريم 66",
    };

    const eligibility = checkReminderEligibility(prefs);
    expect(eligibility.isDue).toBe(true);
    expect(eligibility.daysSinceLastOrder).toBeGreaterThanOrEqual(14);
  });

  it("does not flag as due if customer ordered recently (e.g. 5 days ago)", () => {
    const now = Date.now();
    const fiveDaysAgo = now - 5 * 86400000;

    const prefs: ReminderPreferences = {
      enabled: true,
      intervalDays: 14,
      lastOrderDate: fiveDaysAgo,
      lastReminderSentDate: null,
      favoriteMeal: "بيتزا سوبر سوبريم 66",
    };

    const eligibility = checkReminderEligibility(prefs);
    expect(eligibility.isDue).toBe(false);
    expect(eligibility.daysSinceLastOrder).toBe(5);
  });

  it("does not re-trigger if a reminder was already sent within the past 24 hours", () => {
    const now = Date.now();
    const fifteenDaysAgo = now - 15 * 86400000;
    const twoHoursAgo = now - 2 * 3600000;

    const prefs: ReminderPreferences = {
      enabled: true,
      intervalDays: 14,
      lastOrderDate: fifteenDaysAgo,
      lastReminderSentDate: twoHoursAgo,
      favoriteMeal: "بيتزا سوبر سوبريم 66",
    };

    const eligibility = checkReminderEligibility(prefs);
    expect(eligibility.isDue).toBe(false);
  });

  it("updates last order timestamp and favorite meal when an order is completed", () => {
    recordCompletedOrderForReminders({
      productName: "بيتزا رانش دجاج إيطالية",
      productId: "prod-ranch-123",
      customerName: "سالم باوزير",
    });

    const prefs = getReminderPreferences();
    expect(prefs.favoriteMeal).toBe("بيتزا رانش دجاج إيطالية");
    expect(prefs.favoriteProductId).toBe("prod-ranch-123");
    expect(prefs.customerName).toBe("سالم باوزير");
    expect(prefs.lastOrderDate).toBeDefined();
  });
});
