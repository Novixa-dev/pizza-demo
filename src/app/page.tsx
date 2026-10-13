import React from "react";
import { prisma } from "@/lib/prisma";
import HomeClientView from "./HomeClientView";

// Rendered per request: menu availability (86ing) and reviews must reflect the
// live SQLite state immediately, and the image build has no database to prerender from.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let restaurant = null;
  let testimonials: any[] = [];
  let latestProducts: any[] = [];
  try {
    restaurant = await prisma.restaurant.findFirst({
      include: {
        businessHours: true,
        categories: {
          where: { isActive: true },
          include: {
            products: {
              where: { isAvailable: true },
              take: 1,
              select: {
                imageUrl: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        products: {
          where: { isAvailable: true, isFeatured: true },
          include: {
            optionGroups: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    testimonials = await prisma.orderFeedback.findMany({
      where: {
        mealRating: { gte: 4 },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            pickupMode: true,
            createdAt: true,
            items: {
              select: {
                productNameAr: true,
                productNameEn: true,
                quantity: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    latestProducts = await prisma.product.findMany({
      where: { isAvailable: true },
      include: {
        optionGroups: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch (err) {
    console.error("Failed to load restaurant or testimonials on HomePage:", err);
  }

  return (
    <>
      <HomeClientView
        restaurant={restaurant}
        featuredProducts={restaurant?.products || []}
        latestProducts={latestProducts || []}
        categories={restaurant?.categories || []}
        initialTestimonials={testimonials}
      />
    </>
  );
}
