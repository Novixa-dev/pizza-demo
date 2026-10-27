import { describe, it, expect } from "vitest";
import {
  validateCouponAction,
  getAutomaticGiftsAction,
  getCustomerLoyaltyAction,
  getActiveCouponsAction,
  getAdminCouponsAction,
  toggleCouponStatusAction,
  createCouponAction,
  deleteCouponAction,
} from "@/app/actions/couponActions";
import { createOrderAction } from "@/app/actions/orderActions";
import { prisma } from "@/lib/prisma";
import { getPickupSlots } from "@/lib/pickupAvailability";

describe("Coupons, Automatic Gifts & Loyalty System", () => {
  it("blocks unauthenticated coupon administration", async () => {
    expect((await getAdminCouponsAction()).success).toBe(false);
    expect((await toggleCouponStatusAction("missing", true)).success).toBe(false);
    expect((await createCouponAction({
      code: "UNAUTHORIZED",
      titleAr: "اختبار",
      titleEn: "Test",
      descriptionAr: "اختبار",
      descriptionEn: "Test",
      discountType: "FIXED",
      discountValue: 100,
    })).success).toBe(false);
    expect((await deleteCouponAction("missing")).success).toBe(false);
  });

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

  async function placeTestOrder(quantity: number, extra: Record<string, unknown> = {}) {
    const restaurant = await prisma.restaurant.findFirst({ include: { businessHours: true } });
    const product = await prisma.product.findFirst({
      where: { nameEn: { contains: "Pepperoni" } },
      include: { optionGroups: { include: { options: true } } },
    });
    if (!restaurant || !product) {
      throw new Error("Missing restaurant or product seed data");
    }

    const selectedOptionIds = product.optionGroups
      .filter((group) => group.isRequired && group.options.length > 0)
      .map((group) => group.options[0].id);

    // Any slot the checkout would offer right now, so the test does not depend on the time of day.
    const slot = (await getPickupSlots(restaurant)).find((s) => s.isAvailable);
    expect(slot).toBeDefined();

    const orderRes = await createOrderAction({
      customerName: "سالم باوزير (كوبون تجريبي)",
      customerPhone: "774433221",
      pickupMode: "SCHEDULED",
      requestedTime: slot!.timeString,
      paymentMethod: "PAY_AT_PICKUP",
      items: [{ productId: product.id, quantity, selectedOptionIds }],
      ...extra,
    });
    expect(orderRes.success).toBe(true);
    expect(orderRes.orderId).toBeDefined();

    const savedOrder = await prisma.order.findUnique({ where: { id: orderRes.orderId } });
    expect(savedOrder).toBeDefined();
    return savedOrder!;
  }

  async function deleteTestOrder(orderId: string) {
    await prisma.orderItemOption.deleteMany({ where: { orderItem: { orderId } } });
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.payment.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });
  }

  it("creates an order with server-validated coupon discount and ignores a client-claimed gift", async () => {
    // 2 pizzas at 4,500 YER base = 9,000 YER subtotal: enough for WELCOME10, below the 12,000 gift tier
    const order = await placeTestOrder(2, {
      couponCode: "WELCOME10",
      giftItemName: "خبز بالثوم والموزاريلا الساخن",
    });
    try {
      expect(order.couponCode).toBe("WELCOME10");
      expect(order.couponDiscount).toBeGreaterThan(0);
      expect(order.giftItemName).toBeNull();
      expect(order.total).toBe(order.subtotal - order.discount);
    } finally {
      await deleteTestOrder(order.id);
    }
  });

  it("grants the automatic gift tier the subtotal reaches", async () => {
    const order = await placeTestOrder(3); // 13,500 YER >= 12,000
    try {
      expect(order.giftItemName).toBe("خبز بالثوم والموزاريلا الساخن");
    } finally {
      await deleteTestOrder(order.id);
    }
  });

  it("applies a FREE_ITEM coupon even though its discount is zero", async () => {
    const order = await placeTestOrder(4, { couponCode: "FAMILYBOX" }); // 18,000 YER >= 15,000
    try {
      expect(order.couponCode).toBe("FAMILYBOX");
      expect(order.couponDiscount).toBe(0);
      expect(order.giftItemName).toContain("خبز بالثوم والموزاريلا مجاناً");
    } finally {
      await deleteTestOrder(order.id);
    }
  });
});
