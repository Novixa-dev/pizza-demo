import { describe, it, expect } from "vitest";
import {
  getRestaurantDayRange,
  getRestaurantWallClock,
  resolveRestaurantSlot,
  restaurantLocalToInstant,
  toRestaurantSlotKey,
} from "@/lib/restaurantTime";
import { getYemenNow } from "@/lib/businessHours";

describe("Restaurant clock (Asia/Aden, UTC+3)", () => {
  // 02:50 UTC = 05:50 in Mukalla
  const now = new Date("2026-10-27T02:50:00.000Z");
  const earliest = new Date(now.getTime() + 20 * 60 * 1000);

  it("stores a chosen 8:00 slot as 8:00 Yemen time (05:00 UTC), not 8:00 UTC", () => {
    const pickup = resolveRestaurantSlot("08:00", now, earliest);
    expect(pickup.toISOString()).toBe("2026-10-27T05:00:00.000Z");
    expect(toRestaurantSlotKey(pickup)).toBe("08:00");
  });

  it("moves a slot that already passed today to tomorrow", () => {
    const pickup = resolveRestaurantSlot("05:30", now, earliest);
    expect(pickup.toISOString()).toBe("2026-10-28T02:30:00.000Z");
  });

  it("uses the Yemen calendar day even when UTC is still on the previous day", () => {
    // 22:30 UTC on the 26th is already 01:30 on the 27th in Mukalla
    const lateUtc = new Date("2026-10-26T22:30:00.000Z");
    expect(getRestaurantWallClock(lateUtc)).toMatchObject({ year: 2026, month: 10, day: 27, hours: 1, minutes: 30, dayOfWeek: 2 });

    const { start, end } = getRestaurantDayRange(lateUtc);
    expect(start.toISOString()).toBe("2026-10-26T21:00:00.000Z");
    expect(end.toISOString()).toBe("2026-10-27T21:00:00.000Z");
  });

  it("round-trips local time and rejects malformed slots", () => {
    expect(restaurantLocalToInstant(2026, 10, 27, 20, 15).toISOString()).toBe("2026-10-27T17:15:00.000Z");
    expect(() => resolveRestaurantSlot("25:00", now, earliest)).toThrow(RangeError);
    expect(() => resolveRestaurantSlot("8pm", now, earliest)).toThrow(RangeError);
  });

  it("exposes the Yemen wall clock through local getters for shift arithmetic", () => {
    const wall = getYemenNow(now);
    expect([wall.getHours(), wall.getMinutes(), wall.getDay()]).toEqual([5, 50, 2]);
  });
});
