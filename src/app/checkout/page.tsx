import React from "react";
import { prisma } from "@/lib/prisma";
import CheckoutClientView from "./CheckoutClientView";
import { generatePickupSlots } from "@/lib/scheduler";
import { calculateRestaurantStatus, getYemenNow } from "@/lib/businessHours";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let checkoutProps: React.ComponentProps<typeof CheckoutClientView> = {
    restaurant: null,
    availableSlots: [],
    restaurantStatus: {
      status: "TEMPORARILY_PAUSED",
      canOrderImmediate: false,
      canOrderScheduled: false,
      badgeLabelAr: "متوقف مؤقتاً",
      badgeLabelEn: "Paused",
      descriptionAr: "جاري صيانة خادم الطلبات مؤقتاً، يرجى المحاولة بعد لحظات.",
      descriptionEn: "Server is temporarily undergoing maintenance, please retry shortly.",
    },
  };

  try {
    const restaurant = await prisma.restaurant.findFirst({
      include: { businessHours: true },
    });

    const now = getYemenNow();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's orders to calculate slot capacities
    let todayOrders: { requestedPickupTime: Date }[] = [];
    try {
      todayOrders = await prisma.order.findMany({
        where: {
          requestedPickupTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            notIn: ["CANCELLED", "REJECTED"],
          },
        },
        select: {
          requestedPickupTime: true,
        },
      });
    } catch (e) {
      console.error("Failed to query today's orders for slot capacity:", e);
      todayOrders = [];
    }

    const slotCounts: Record<string, number> = {};
    todayOrders.forEach((o) => {
      if (!o.requestedPickupTime) return;
      const d = new Date(o.requestedPickupTime);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const key = `${h}:${m}`;
      slotCounts[key] = (slotCounts[key] || 0) + 1;
    });

    const businessHoursList = restaurant?.businessHours || [];
    const slotCapacityLimit = restaurant?.slotCapacityMax || 8;

    const slots = generatePickupSlots({
      targetDate: now,
      businessHours: businessHoursList,
      existingSlotOrdersCount: slotCounts,
      slotCapacityMax: slotCapacityLimit,
      now,
    });

    const restaurantStatus = calculateRestaurantStatus({
      businessHours: businessHoursList,
      isOnlineOrderingPaused: restaurant?.isOnlineOrderingPaused ?? false,
      pauseMessageAr: restaurant?.pauseMessageAr,
      pauseMessageEn: restaurant?.pauseMessageEn,
      now,
    });

    // Plain JSON-safe restaurant object
    const serializedRestaurant = restaurant
      ? {
          id: restaurant.id,
          nameAr: restaurant.nameAr,
          nameEn: restaurant.nameEn,
          phone: restaurant.phone,
          whatsapp: restaurant.whatsapp,
          addressAr: restaurant.addressAr,
          addressEn: restaurant.addressEn,
          isOnlineOrderingPaused: restaurant.isOnlineOrderingPaused,
          pauseMessageAr: restaurant.pauseMessageAr,
          pauseMessageEn: restaurant.pauseMessageEn,
          defaultPrepDuration: restaurant.defaultPrepDuration,
          slotCapacityMax: restaurant.slotCapacityMax,
        }
      : null;

    checkoutProps = {
      restaurant: serializedRestaurant,
      availableSlots: slots,
      restaurantStatus,
    };
  } catch (error) {
    console.error("Critical error loading checkout page:", error);
  }

  return <CheckoutClientView {...checkoutProps} />;
}
