import React from "react";
import { prisma } from "@/lib/prisma";
import HomeClientView from "./HomeClientView";

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  let restaurant = null;
  let testimonials: any[] = [];
  try {
    restaurant = await prisma.restaurant.findFirst({
      include: {
        businessHours: true,
        categories: {
          where: { isActive: true },
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
  } catch (err) {
    console.error("Failed to load restaurant or testimonials on HomePage:", err);
  }

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "بيتزا هاوس | Pizza House Mukalla",
    image: "https://pizzahouse.ye/hero-pizza.jpg",
    "@id": "https://pizzahouse.ye/#restaurant",
    url: "https://pizzahouse.ye",
    telephone: "+9675375561",
    servesCuisine: ["Pizza", "Pastries", "Italian", "Middle Eastern"],
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "حي المساكن، فوه، بعد جامعة الأحقاف ومستوصف النور يمين الشارع العام",
      addressLocality: "المكلا (Al Mukalla)",
      addressRegion: "حضرموت (Hadhramaut)",
      postalCode: "F2QV+HPW",
      addressCountry: "YE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 14.5388,
      longitude: 49.1232,
    },
    sameAs: [
      "https://www.instagram.com/pizza_house66/",
      "https://maps.app.goo.gl/p9awfgXmTeSStM317",
    ],
    hasMap: "https://maps.app.goo.gl/p9awfgXmTeSStM317",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ],
        opens: "08:00",
        closes: "12:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "16:00",
        closes: "23:30",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <HomeClientView
        restaurant={restaurant}
        featuredProducts={restaurant?.products || []}
        categories={restaurant?.categories || []}
        initialTestimonials={testimonials}
      />
    </>
  );
}
