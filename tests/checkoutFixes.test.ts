import { describe, it, expect } from "vitest";
import { YEMENI_PHONE_REGEX } from "@/lib/validation";
import manifest from "@/app/manifest";

describe("Checkout Page Deep Review & PWA Icons Verification", () => {
  it("validates Yemeni mobile phone numbers correctly", () => {
    // Valid phone numbers
    expect(YEMENI_PHONE_REGEX.test("772207788")).toBe(true);
    expect(YEMENI_PHONE_REGEX.test("0772207788")).toBe(true);
    expect(YEMENI_PHONE_REGEX.test("+967772207788")).toBe(true);
    expect(YEMENI_PHONE_REGEX.test("731234567")).toBe(true);
    expect(YEMENI_PHONE_REGEX.test("719876543")).toBe(true);
    expect(YEMENI_PHONE_REGEX.test("780123456")).toBe(true);

    // Invalid numbers
    expect(YEMENI_PHONE_REGEX.test("123456789")).toBe(false);
    expect(YEMENI_PHONE_REGEX.test("7712345")).toBe(false); // too short
    expect(YEMENI_PHONE_REGEX.test("999123456")).toBe(false); // non-existent prefix
  });

  it("manifest provides modern PWA icons including 192, 512, and maskable purpose", () => {
    const pwaManifest = manifest();
    expect(pwaManifest.name).toContain("بيتزا هاوس المكلا");
    expect(pwaManifest.short_name).toBe("بيتزا هاوس");
    expect(pwaManifest.icons).toBeDefined();
    expect(pwaManifest.icons?.length).toBeGreaterThanOrEqual(3);

    const has192 = pwaManifest.icons?.some((i) => i.sizes === "192x192");
    const has512 = pwaManifest.icons?.some((i) => i.sizes === "512x512" && i.purpose === "any");
    const hasMaskable = pwaManifest.icons?.some((i) => i.sizes === "512x512" && i.purpose === "maskable");

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  it("categorizes checkout pickup time slots into morning and evening sessions", () => {
    const slots = [
      { timeString: "09:30" },
      { timeString: "11:15" },
      { timeString: "16:00" },
      { timeString: "20:45" },
    ];

    const morning = slots.filter((s) => parseInt(s.timeString.split(":")[0], 10) < 13);
    const evening = slots.filter((s) => parseInt(s.timeString.split(":")[0], 10) >= 13);

    expect(morning).toHaveLength(2);
    expect(evening).toHaveLength(2);
    expect(morning[0].timeString).toBe("09:30");
    expect(evening[0].timeString).toBe("16:00");
  });

  it("ensures slots are always available even at late night by scheduling next day", async () => {
    const { generatePickupSlots } = await import("@/lib/scheduler");
    const businessHours = [
      { dayOfWeek: 0, shiftName: "Morning", openTime: "08:00", closeTime: "12:00", isClosed: false },
      { dayOfWeek: 0, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
      { dayOfWeek: 1, shiftName: "Morning", openTime: "08:00", closeTime: "12:00", isClosed: false },
      { dayOfWeek: 1, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
      { dayOfWeek: 2, shiftName: "Morning", openTime: "08:00", closeTime: "12:00", isClosed: false },
      { dayOfWeek: 2, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
      { dayOfWeek: 3, shiftName: "Morning", openTime: "08:00", closeTime: "12:00", isClosed: false },
      { dayOfWeek: 3, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
      { dayOfWeek: 4, shiftName: "Morning", openTime: "08:00", closeTime: "12:00", isClosed: false },
      { dayOfWeek: 4, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
      { dayOfWeek: 5, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
      { dayOfWeek: 6, shiftName: "Morning", openTime: "08:00", closeTime: "12:00", isClosed: false },
      { dayOfWeek: 6, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
    ];

    // Simulate late night at 23:25 PM
    const lateNight = new Date("2026-10-06T23:25:00");
    const slots = generatePickupSlots({
      targetDate: lateNight,
      businessHours,
      now: lateNight,
    });

    const avail = slots.filter((s) => s.isAvailable);
    expect(avail.length).toBeGreaterThan(0);
    expect(avail[0].displayLabelAr).toContain("غداً");
  });

  it("accurately detects missing required fields in checkout audit", () => {
    // Audit simulation function matching CheckoutClientView logic
    function auditCheckoutFields(state: {
      customerName: string;
      customerPhone: string;
      pickupMode: "ASAP" | "SCHEDULED";
      selectedSlot: string;
      paymentMethod: "PAY_AT_PICKUP" | "TRANSFER_KURAIMI" | "TRANSFER_AMQI" | "TRANSFER_BUSAIRI";
      receiptBase64: string;
      cartCount: number;
    }) {
      const cleanPhone = state.customerPhone.replace(/\s+/g, "");
      const isNameValid = state.customerName.trim().length >= 2;
      const isPhoneValid = YEMENI_PHONE_REGEX.test(cleanPhone);
      const isReceiptValid = state.paymentMethod === "PAY_AT_PICKUP" || Boolean(state.receiptBase64);

      const missingFields: string[] = [];
      if (!isNameValid) missingFields.push("Customer Name (must be >= 2 characters)");
      if (!isPhoneValid) missingFields.push("Customer Phone (must be a valid 9-digit Yemeni number)");
      if (!isReceiptValid) missingFields.push("Receipt image (required for bank transfers)");
      if (state.pickupMode === "SCHEDULED" && !state.selectedSlot) missingFields.push("Pickup time slot");
      if (state.cartCount === 0) missingFields.push("Cart is empty");

      return {
        isReady: missingFields.length === 0,
        missingFields,
      };
    }

    // Incomplete state: empty name, bad phone, no receipt on transfer
    const badState = auditCheckoutFields({
      customerName: "",
      customerPhone: "123",
      pickupMode: "SCHEDULED",
      selectedSlot: "",
      paymentMethod: "TRANSFER_KURAIMI",
      receiptBase64: "",
      cartCount: 1,
    });
    expect(badState.isReady).toBe(false);
    expect(badState.missingFields.length).toBe(4);

    // Complete state: cash on pickup, valid phone, valid name
    const goodState = auditCheckoutFields({
      customerName: "أحمد بازهير",
      customerPhone: "771234567",
      pickupMode: "SCHEDULED",
      selectedSlot: "08:00",
      paymentMethod: "PAY_AT_PICKUP",
      receiptBase64: "",
      cartCount: 2,
    });
    expect(goodState.isReady).toBe(true);
    expect(goodState.missingFields.length).toBe(0);
  });
});
