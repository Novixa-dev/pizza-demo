import { describe, it, expect } from "vitest";
import { getRecentTestimonialsAction, submitOrderFeedbackAction } from "@/app/actions/orderActions";
import { prisma } from "@/lib/prisma";

describe("Customer Testimonials & Feedback Component Suite", () => {
  it("fetches recent verified testimonials from the database", async () => {
    const res = await getRecentTestimonialsAction(6);
    expect(res.success).toBe(true);
    expect(Array.isArray(res.testimonials)).toBe(true);
    expect(res.testimonials.length).toBeGreaterThanOrEqual(1);

    // Verify properties of seeded testimonials
    const first = res.testimonials[0];
    expect(first).toBeDefined();
    expect(first.customerName).toBeTruthy();
    expect(first.mealRating).toBeGreaterThanOrEqual(4);
    expect(first.serviceRating).toBeGreaterThanOrEqual(1);
    expect(first.comment).toBeTruthy();
    expect(first.order).toBeDefined();
  });

  it("includes ordered product details for rich card context", async () => {
    const res = await getRecentTestimonialsAction(10);
    expect(res.success).toBe(true);

    const withItems = res.testimonials.find((t) => t.order?.items && t.order.items.length > 0);
    expect(withItems).toBeDefined();
    expect(withItems?.order?.items?.[0]?.productNameAr).toBeTruthy();
  });

  it("submits and retrieves a new customer testimonial seamlessly", async () => {
    const restaurant = await prisma.restaurant.findFirst();
    const product = await prisma.product.findFirst();

    if (!restaurant || !product) {
      throw new Error("Missing restaurant or product seed data");
    }

    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `#TEST-REC-${Date.now().toString().slice(-4)}`,
        restaurantId: restaurant.id,
        customerName: "سالم الحضرمي",
        customerPhone: "779911223",
        pickupMode: "SCHEDULED",
        requestedPickupTime: new Date(),
        plannedPrepStartTime: new Date(),
        status: "COMPLETED",
        subtotal: 5000,
        total: 5000,
        items: {
          create: {
            productId: product.id,
            productNameAr: product.nameAr,
            productNameEn: product.nameEn,
            unitPrice: 5000,
            quantity: 1,
            subtotal: 5000,
          },
        },
      },
    });

    const subRes = await submitOrderFeedbackAction({
      orderId: testOrder.id,
      mealRating: 5,
      serviceRating: 5,
      tags: ["عجينة ممتازة", "استلام فوري"],
      comment: "تجربة راقية جداً وبيتزا ساخنة بأطراف محشوة جبنة موزاريلا!",
    });

    expect(subRes.success).toBe(true);

    const recent = await getRecentTestimonialsAction(10);
    expect(recent.success).toBe(true);
    const found = recent.testimonials.find((t) => t.orderId === testOrder.id);
    expect(found).toBeDefined();
    expect(found?.mealRating).toBe(5);
    expect(found?.comment).toContain("تجربة راقية");
  });
});
