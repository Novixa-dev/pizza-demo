/**
 * The restaurant's clock. Pickup times, shifts and slot capacity are all
 * expressed in Yemen local time, independent of the server's or the viewer's
 * time zone (the production container runs in UTC; visitors can be anywhere).
 *
 * Yemen observes no daylight saving time, so the offset is a constant UTC+3.
 */
export const RESTAURANT_TIME_ZONE = "Asia/Aden";

const RESTAURANT_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface RestaurantWallClock {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  hours: number;
  minutes: number;
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
}

/** Reads the restaurant's local calendar date and time for an instant. */
export function getRestaurantWallClock(instant: Date = new Date()): RestaurantWallClock {
  const shifted = new Date(instant.getTime() + RESTAURANT_UTC_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
    dayOfWeek: shifted.getUTCDay(),
  };
}

/** The instant at which the restaurant's clock shows the given local date and time. */
export function restaurantLocalToInstant(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hours, minutes) - RESTAURANT_UTC_OFFSET_MS);
}

/** Start and end (exclusive) of the restaurant's local calendar day containing `instant`. */
export function getRestaurantDayRange(instant: Date = new Date()): { start: Date; end: Date } {
  const { year, month, day } = getRestaurantWallClock(instant);
  const start = restaurantLocalToInstant(year, month, day);
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

/** "HH:mm" slot key of an instant on the restaurant's clock (e.g. "20:15"). */
export function toRestaurantSlotKey(instant: Date): string {
  const { hours, minutes } = getRestaurantWallClock(instant);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Resolves a "HH:mm" pickup slot to a concrete instant: today on the
 * restaurant's clock, or tomorrow when today's occurrence is earlier than
 * `earliestAllowed` (the slot list offers tomorrow's times late in the day).
 */
export function resolveRestaurantSlot(timeString: string, now: Date, earliestAllowed: Date): Date {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeString.trim());
  if (!match) throw new RangeError(`Invalid pickup time "${timeString}"`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new RangeError(`Invalid pickup time "${timeString}"`);

  const { year, month, day } = getRestaurantWallClock(now);
  const today = restaurantLocalToInstant(year, month, day, hours, minutes);
  return today.getTime() < earliestAllowed.getTime() ? new Date(today.getTime() + DAY_MS) : today;
}
