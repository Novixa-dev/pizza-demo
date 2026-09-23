import { describe, it, expect } from "vitest";
import { calculateRestaurantStatus } from "../src/lib/businessHours";

describe("Business Hours & Operational Status Service", () => {
  it("detects TEMPORARILY_PAUSED when manager pauses online orders", () => {
    const status = calculateRestaurantStatus({
      isOnlineOrderingPaused: true,
      pauseMessageAr: "ضغط أفران مؤقت",
      now: new Date("2026-09-23T18:00:00Z"),
    });

    expect(status.status).toBe("TEMPORARILY_PAUSED");
    expect(status.canOrderImmediate).toBe(false);
    expect(status.canOrderScheduled).toBe(false);
    expect(status.descriptionAr).toContain("ضغط أفران مؤقت");
  });

  it("detects OPEN_FOR_ORDERING during normal evening shift (e.g. 18:00)", () => {
    const mondayEvening = new Date();
    mondayEvening.setHours(18, 0, 0, 0); // 6:00 PM

    const status = calculateRestaurantStatus({
      isOnlineOrderingPaused: false,
      now: mondayEvening,
    });

    expect(status.status).toBe("OPEN_FOR_ORDERING");
    expect(status.isOpen).toBe(true);
    expect(status.canOrderImmediate).toBe(true);
    expect(status.canOrderScheduled).toBe(true);
  });

  it("detects CLOSING_SOON during last 30 minutes of shift (e.g. 23:10)", () => {
    const eveningClosingSoon = new Date();
    eveningClosingSoon.setHours(23, 10, 0, 0); // 11:10 PM (closes 23:30)

    const status = calculateRestaurantStatus({
      isOnlineOrderingPaused: false,
      now: eveningClosingSoon,
    });

    expect(status.status).toBe("CLOSING_SOON");
    expect(status.isOpen).toBe(true);
    expect(status.canOrderImmediate).toBe(false);
    expect(status.canOrderScheduled).toBe(true);
  });

  it("detects SCHEDULED_ONLY between morning and evening shifts (e.g. 14:00)", () => {
    const afternoonBreak = new Date();
    // Monday (day 1) at 14:00
    afternoonBreak.setDate(afternoonBreak.getDate() + ((1 - afternoonBreak.getDay() + 7) % 7));
    afternoonBreak.setHours(14, 0, 0, 0); // 2:00 PM

    const status = calculateRestaurantStatus({
      isOnlineOrderingPaused: false,
      now: afternoonBreak,
    });

    expect(status.status).toBe("SCHEDULED_ONLY");
    expect(status.canOrderImmediate).toBe(false);
    expect(status.canOrderScheduled).toBe(true);
    expect(status.nextShiftOpensAt).toBeDefined();
  });

  it("detects CLOSED late at night (e.g. 02:00 AM)", () => {
    const night = new Date();
    night.setHours(2, 0, 0, 0); // 2:00 AM

    const status = calculateRestaurantStatus({
      isOnlineOrderingPaused: false,
      now: night,
    });

    expect(status.status).toBe("CLOSED");
    expect(status.canOrderImmediate).toBe(false);
    expect(status.canOrderScheduled).toBe(true);
  });
});
