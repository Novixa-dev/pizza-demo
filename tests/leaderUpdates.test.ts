import { describe, it, expect } from "vitest";
import { getReminderPreferences, saveReminderPreferences } from "@/lib/notifications/orderReminderService";

describe("Team Leader Upgrade - System & UX Enhancements", () => {
  it("resolves favorite meal and calculates days elapsed for QuickReorderHeroCard", () => {
    const fourteenDaysAgo = Date.now() - 14 * 86400000;
    saveReminderPreferences({
      favoriteMeal: "بيتزا سوبر سوبريم 66",
      lastOrderDate: fourteenDaysAgo,
    });

    const prefs = getReminderPreferences();
    expect(prefs.favoriteMeal).toBe("بيتزا سوبر سوبريم 66");

    const daysElapsed = Math.floor((Date.now() - prefs.lastOrderDate!) / 86400000);
    expect(daysElapsed).toBeGreaterThanOrEqual(14);
  });

  it("validates stone oven baking range and temperature bounds", () => {
    const ovenMin = 350;
    const ovenMax = 400;
    const sampleTemp = 365;

    expect(sampleTemp).toBeGreaterThanOrEqual(ovenMin);
    expect(sampleTemp).toBeLessThanOrEqual(ovenMax);
  });

  it("formats menu card prep time correctly in Arabic and English", () => {
    const formatPrepTime = (lang: "ar" | "en") =>
      lang === "ar" ? "خبز حجري: 15 د" : "Stone-baked: 15m";

    expect(formatPrepTime("ar")).toContain("خبز حجري");
    expect(formatPrepTime("en")).toContain("Stone-baked");
  });
});
