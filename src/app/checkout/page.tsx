import React from "react";
import { prisma } from "@/lib/prisma";
import CheckoutClientView from "./CheckoutClientView";
import { getPickupSlots } from "@/lib/pickupAvailability";
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

    const now = new Date();
    const businessHoursList = restaurant?.businessHours || [];
    const slots = restaurant ? await getPickupSlots(restaurant, now) : [];

    const restaurantStatus = calculateRestaurantStatus({
      businessHours: businessHoursList,
      isOnlineOrderingPaused: restaurant?.isOnlineOrderingPaused ?? false,
      pauseMessageAr: restaurant?.pauseMessageAr,
      pauseMessageEn: restaurant?.pauseMessageEn,
      now: getYemenNow(now),
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
