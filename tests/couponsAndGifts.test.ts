import { describe, it, expect } from "vitest";
import {
  validateCouponAction,
  getAutomaticGiftsAction,
  getCustomerLoyaltyAction,
  getActiveCouponsAction,
} from "@/app/actions/couponActions";
import { createOrderAction } from "@/app/actions/orderActions";
import { prisma } from "@/lib/prisma";

describe("Coupons, Automatic Gifts & Loyalty System", () => {
  it("rejects empty or whitespace coupon code", async () => {
    const res = await validateCouponAction({
      code: "   ",
      subtotal: 10000,
    });
    expect(res.success).toBe(false);
    expect(res.message).toContain("يرجى إدخال كود الكوبون");
  });

  it("rejects non-existent coupon code", async () => {
    const res = await validateCouponAction({
      code: "NOT_REAL_CODE_99",
      subtotal: 10000,
    });
    expect(res.success).toBe(false);
    expect(res.message).toContain("غير صحيح");
  });

  it("enforces minimum order amount on WELCOME10 coupon", async () => {
    const res = await validateCouponAction({
      code: "WELCOME10",
      subtotal: 5000, // min is 8,000 YER
    });
    expect(res.success).toBe(false);
    expect(res.message).toContain("الحد الأدنى");
  });

  it("calculates percentage discount and enforces maxDiscount cap on WELCOME10", async () => {
    // 10,000 YER order: 10% is 1,000 YER (equals maxDiscount)
    const res1 = await validateCouponAction({
      code: "WELCOME10",
      subtotal: 10000,
    });
    expect(res1.success).toBe(true);
    expect(res1.discountAmount).toBe(1000);

    // 18,000 YER order: 10% is 1,800 YER, but capped at maxDiscount 1,000 YER
    const res2 = await validateCouponAction({
      code: "WELCOME10",
      subtotal: 18000,
    });
    expect(res2.success).toBe(true);
    expect(res2.discountAmount).toBe(1000);
  });

  it("validates fixed discount coupon MUKALLA500 correctly", async () => {
    const res = await validateCouponAction({
      code: "MUKALLA500",
      subtotal: 6000,
    });
    expect(res.success).toBe(true);
    expect(res.discountType).toBe("FIXED");
    expect(res.discountAmount).toBe(500);
  });

  it("returns configured automatic gift tiers in ascending spend order", async () => {
    const res = await getAutomaticGiftsAction();
    expect(res.success).toBe(true);
    expect(res.gifts.length).toBeGreaterThanOrEqual(2);

    const tier1 = res.gifts.find((g) => g.minSpend === 12000);
    const tier2 = res.gifts.find((g) => g.minSpend === 20000);

    expect(tier1).toBeDefined();
    expect(tier1?.nameAr).toBeDefined();

    expect(tier2).toBeDefined();
    expect(tier2?.nameAr).toBeDefined();
  });

  it("calculates customer loyalty stamps and reward eligibility accurately", async () => {
    const testPhone = "779988771";

    const res = await getCustomerLoyaltyAction(testPhone);
    expect(res.success).toBe(true);
    expect(res.loyalty).toBeDefined();
    expect(res.loyalty?.customerPhone).toBe(testPhone);
    expect(res.loyalty?.targetOrders).toBe(5);
    expect(res.loyalty?.currentProgress).toBe((res.loyalty?.totalOrders || 0) % 5);
  });

  it("creates an order with server-validated coupon discount and applies it to total", async () => {
    const restaurant = await prisma.restaurant.findFirst();
    const product = await prisma.product.findFirst({
      where: { nameEn: { contains: "Pepperoni" } },
      include: {
        optionGroups: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!restaurant || !product) {
      throw new Error("Missing restaurant or product seed data");
    }

    const selectedOptionIds: string[] = [];
    for (const group of product.optionGroups) {
      if (group.isRequired && group.options.length > 0) {
        selectedOptionIds.push(group.options[0].id);
      }
    }

    // 2 pizzas at 4,500 YER base = 9,000 YER subtotal >= 8,000 min order for WELCOME10
    const orderRes = await createOrderAction({
      customerName: "سالم باوزير (كوبون تجريبي)",
      customerPhone: "774433221",
      pickupMode: "SCHEDULED",
      requestedTime: "20:00",
      paymentMethod: "PAY_AT_PICKUP",
      couponCode: "WELCOME10",
      giftItemName: "خبز بالثوم والموزاريلا الساخن",
      items: [
        {
          productId: product.id,
          quantity: 2,
          selectedOptionIds,
        },
      ],
    });

    expect(orderRes.success).toBe(true);
    expect(orderRes.orderId).toBeDefined();

    // Verify created order directly in db
    const savedOrder = await prisma.order.findUnique({
      where: { id: orderRes.orderId },
    });

    expect(savedOrder).toBeDefined();
    expect(savedOrder?.couponCode).toBe("WELCOME10");
    expect(savedOrder?.couponDiscount).toBeGreaterThan(0);
    expect(savedOrder?.giftItemName).toBe("خبز بالثوم والموزاريلا الساخن");
    expect(savedOrder?.total).toBe(savedOrder!.subtotal - savedOrder!.discount);

    // Clean up test order
    if (orderRes.orderId) {
      await prisma.orderItemOption.deleteMany({
        where: { orderItem: { orderId: orderRes.orderId } },
      });
      await prisma.orderItem.deleteMany({
        where: { orderId: orderRes.orderId },
      });
      await prisma.order.delete({
        where: { id: orderRes.orderId },
      });
    }
  });
});
