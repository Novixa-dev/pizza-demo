import { prisma } from "@/lib/prisma";
import { generatePickupSlots, type BusinessHourRecord } from "@/lib/scheduler";
import { getYemenNow } from "@/lib/businessHours";
import { getRestaurantDayRange, toRestaurantSlotKey } from "@/lib/restaurantTime";
import type { TimeSlotOption } from "@/types";

/**
 * The pickup slots a customer can choose right now, with oven capacity applied.
 * Shared by the checkout page (to render the picker) and order creation (to
 * reject a slot that is closed, past or full), so both always agree.
 */
export async function getPickupSlots(
  restaurant: { businessHours: BusinessHourRecord[]; slotCapacityMax?: number | null },
  now: Date = new Date(),
): Promise<TimeSlotOption[]> {
  const { start, end } = getRestaurantDayRange(now);

  let todayOrders: { requestedPickupTime: Date }[] = [];
  try {
    todayOrders = await prisma.order.findMany({
      where: {
        requestedPickupTime: { gte: start, lt: end },
        status: { notIn: ["CANCELLED", "REJECTED"] },
      },
      select: { requestedPickupTime: true },
    });
  } catch (e) {
    console.error("Failed to query today's orders for slot capacity:", e);
  }

  const slotCounts: Record<string, number> = {};
  for (const order of todayOrders) {
    const key = toRestaurantSlotKey(order.requestedPickupTime);
    slotCounts[key] = (slotCounts[key] || 0) + 1;
  }

  // The scheduler works on the restaurant's wall clock.
  const restaurantNow = getYemenNow(now);
  return generatePickupSlots({
    targetDate: restaurantNow,
    businessHours: restaurant.businessHours,
    existingSlotOrdersCount: slotCounts,
    slotCapacityMax: restaurant.slotCapacityMax || 8,
    now: restaurantNow,
  });
}
