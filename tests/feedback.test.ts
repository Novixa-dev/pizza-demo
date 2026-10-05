import { describe, it, expect } from "vitest";
import { submitOrderFeedbackAction } from "@/app/actions/orderActions";
import { prisma } from "@/lib/prisma";

describe("Order Feedback & Rating System", () => {
  it("rejects invalid rating values outside 1-5", async () => {
    const res = await submitOrderFeedbackAction({
      orderId: "invalid-id",
      mealRating: 6,
      serviceRating: 3,
    });

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("rejects non-existent order", async () => {
    const res = await submitOrderFeedbackAction({
      orderId: "non-existent-order-id-xyz",
      mealRating: 5,
      serviceRating: 5,
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("الطلب غير موجود.");
  });

  it("submits feedback for a completed order successfully", async () => {
    const restaurant = await prisma.restaurant.findFirst();
    const product = await prisma.product.findFirst();

    if (!restaurant || !product) {
      throw new Error("Seed data missing");
    }

    // Create a completed test order
    const completedOrder = await prisma.order.create({
      data: {
        orderNumber: `#TEST-FB-${Date.now().toString().slice(-4)}`,
        restaurantId: restaurant.id,
        customerName: "فاطمة العمودي",
        customerPhone: "773344556",
        pickupMode: "ASAP",
        requestedPickupTime: new Date(),
        plannedPrepStartTime: new Date(),
        status: "COMPLETED",
        subtotal: 5500,
        total: 5500,
        items: {
          create: {
            productId: product.id,
            productNameAr: product.nameAr,
            productNameEn: product.nameEn,
            unitPrice: 5500,
            quantity: 1,
            subtotal: 5500,
          },
        },
      },
    });

    const res = await submitOrderFeedbackAction({
      orderId: completedOrder.id,
      token: completedOrder.trackingToken,
      mealRating: 5,
      serviceRating: 5,
      tags: ["HOT_CRISPY", "ON_TIME"],
      comment: "أشهى بيتزا في فوه، ساخنة ولذيذة جداً والتسليم كان بالموعد المحدد!",
    });

    expect(res.success).toBe(true);
    expect(res.feedback).toBeDefined();
    expect(res.feedback?.mealRating).toBe(5);
    expect(res.feedback?.serviceRating).toBe(5);
    expect(res.feedback?.comment).toContain("أشهى بيتزا");

    // Clean up
    await prisma.orderFeedback.deleteMany({ where: { orderId: completedOrder.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: completedOrder.id } });
    await prisma.order.delete({ where: { id: completedOrder.id } });
  });
});
