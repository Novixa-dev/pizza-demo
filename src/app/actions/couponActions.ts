"use server";

import { prisma } from "@/lib/prisma";
import { isAuthorizedStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ValidateCouponResult {
  success: boolean;
  message?: string;
  code?: string;
  discountType?: "PERCENTAGE" | "FIXED" | "FREE_ITEM";
  discountValue?: number;
  discountAmount?: number;
  freeItemNameAr?: string;
  freeItemNameEn?: string;
  minOrderAmount?: number;
  descriptionAr?: string;
  descriptionEn?: string;
}

/**
 * Validates a coupon code server-side against current cart subtotal and customer eligibility.
 */
export async function validateCouponAction({
  code,
  subtotal,
  customerPhone,
}: {
  code: string;
  subtotal: number;
  customerPhone?: string;
}): Promise<ValidateCouponResult> {
  try {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: "يرجى إدخال كود الكوبون" };
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return { success: false, message: "كود الكوبون غير صحيح أو منتهي الصلاحية" };
    }

    const now = new Date();
    if (coupon.startDate > now) {
      return { success: false, message: "هذا العرض لم يبدأ بعد" };
    }

    if (coupon.endDate && coupon.endDate < now) {
      return { success: false, message: "عذراً، انتهت صلاحية هذا الكوبون" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, message: "عذراً، اكتمل الحد الأقصى لاستخدام هذا الكوبون" };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        success: false,
        message: `الحد الأدنى لتفعيل هذا الكوبون هو ${coupon.minOrderAmount.toLocaleString()} ر.ي`,
      };
    }

    if (coupon.isFirstOrderOnly && customerPhone) {
      const cleanPhone = customerPhone.replace(/\s+/g, "");
      const pastOrdersCount = await prisma.order.count({
        where: {
          customerPhone: { contains: cleanPhone },
          status: { in: ["COMPLETED", "READY", "PREPARING", "QUEUED", "CONFIRMED"] },
        },
      });

      if (pastOrdersCount > 0) {
        return {
          success: false,
          message: "هذا الكوبون مخصص لطلب العميل الأول فقط",
        };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      const rawDiscount = Math.round((subtotal * coupon.discountValue) / 100);
      discountAmount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
    } else if (coupon.discountType === "FIXED") {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === "FREE_ITEM") {
      discountAmount = 0; // Free item reward
    }

    return {
      success: true,
      code: coupon.code,
      discountType: coupon.discountType as any,
      discountValue: coupon.discountValue,
      discountAmount,
      freeItemNameAr: coupon.freeItemNameAr || undefined,
      freeItemNameEn: coupon.freeItemNameEn || undefined,
      minOrderAmount: coupon.minOrderAmount,
      descriptionAr: coupon.descriptionAr,
      descriptionEn: coupon.descriptionEn,
    };
  } catch (err: any) {
    console.error("Error validating coupon:", err);
    return { success: false, message: "حدث خطأ أثناء فحص الكوبون" };
  }
}

/**
 * Fetches all public active coupons for the /offers page.
 */
export async function getActiveCouponsAction() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { minOrderAmount: "asc" },
    });
    return { success: true, coupons };
  } catch (err: any) {
    console.error("Error fetching coupons:", err);
    return { success: false, coupons: [] };
  }
}

/**
 * Fetches configured automatic gifts and tier thresholds.
 */
export async function getAutomaticGiftsAction() {
  try {
    const gifts = await prisma.automaticGift.findMany({
      where: { isActive: true },
      orderBy: { minSpend: "asc" },
    });
    return { success: true, gifts };
  } catch (err: any) {
    console.error("Error fetching automatic gifts:", err);
    return { success: false, gifts: [] };
  }
}

/**
 * Retrieves customer loyalty status by phone number.
 * Calculates completed orders count and whether the next order qualifies for a free reward.
 */
export async function getCustomerLoyaltyAction(customerPhone: string) {
  try {
    const cleanPhone = customerPhone.replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 7) {
      return { success: false, message: "رقم الهاتف غير صالح" };
    }

    // Query live completed orders count for accuracy
    const completedOrders = await prisma.order.count({
      where: {
        customerPhone: { contains: cleanPhone },
        status: "COMPLETED",
      },
    });

    // Check existing customer loyalty record
    let record = await prisma.customerLoyalty.findUnique({
      where: { customerPhone: cleanPhone },
    });

    if (!record) {
      const rewardsEarned = Math.floor(completedOrders / 5);
      record = await prisma.customerLoyalty.create({
        data: {
          customerPhone: cleanPhone,
          ordersCount: completedOrders,
          rewardsEarned,
          rewardsClaimed: 0,
        },
      });
    } else if (record.ordersCount !== completedOrders) {
      const rewardsEarned = Math.floor(completedOrders / 5);
      record = await prisma.customerLoyalty.update({
        where: { customerPhone: cleanPhone },
        data: {
          ordersCount: completedOrders,
          rewardsEarned,
        },
      });
    }

    const currentCycleProgress = completedOrders % 5;
    const isRewardAvailable = record.rewardsEarned > record.rewardsClaimed;

    return {
      success: true,
      loyalty: {
        customerPhone: cleanPhone,
        totalOrders: completedOrders,
        currentProgress: currentCycleProgress,
        targetOrders: 5,
        rewardsEarned: record.rewardsEarned,
        rewardsClaimed: record.rewardsClaimed,
        isRewardAvailable,
      },
    };
  } catch (err: any) {
    console.error("Error getting customer loyalty:", err);
    return { success: false, message: "تعذر فحص سجل الولاء" };
  }
}

/**
 * Admin action to fetch all coupons for the control panel.
 */
export async function getAdminCouponsAction() {
  if (!(await isAuthorizedStaff(["ADMIN"]))) {
    return { success: false, coupons: [], gifts: [], loyaltyCount: 0 };
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    const gifts = await prisma.automaticGift.findMany({
      orderBy: { minSpend: "asc" },
    });
    const loyaltyCount = await prisma.customerLoyalty.count();

    return { success: true, coupons, gifts, loyaltyCount };
  } catch (err: any) {
    console.error("Error fetching admin coupons:", err);
    return { success: false, coupons: [], gifts: [], loyaltyCount: 0 };
  }
}

/**
 * Admin action to toggle coupon active status.
 */
export async function toggleCouponStatusAction(couponId: string, isActive: boolean) {
  if (!(await isAuthorizedStaff(["ADMIN"]))) {
    return { success: false, message: "غير مصرح بهذا الإجراء" };
  }

  try {
    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive },
    });
    revalidatePath("/offers");
    revalidatePath("/admin");
    return { success: true, coupon: updated };
  } catch (err: any) {
    console.error("Error toggling coupon:", err);
    return { success: false, message: "تعذر تحديث حالة الكوبون" };
  }
}

/**
 * Admin action to create a new coupon.
 */
export async function createCouponAction(data: {
  code: string;
  titleAr: string;
  titleEn: string;
  titleId?: string;
  descriptionAr: string;
  descriptionEn: string;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_ITEM";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  freeItemNameAr?: string;
  freeItemNameEn?: string;
  usageLimit?: number;
  isFirstOrderOnly?: boolean;
}) {
  if (!(await isAuthorizedStaff(["ADMIN"]))) {
    return { success: false, message: "غير مصرح بهذا الإجراء" };
  }

  try {
    const cleanCode = data.code.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return { success: false, message: "كود الكوبون موجود مسبقاً" };
    }

    const created = await prisma.coupon.create({
      data: {
        code: cleanCode,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        titleId: data.titleId,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount || 0,
        maxDiscount: data.maxDiscount,
        freeItemNameAr: data.freeItemNameAr,
        freeItemNameEn: data.freeItemNameEn,
        usageLimit: data.usageLimit,
        isFirstOrderOnly: data.isFirstOrderOnly || false,
        isActive: true,
      },
    });

    revalidatePath("/offers");
    revalidatePath("/admin");
    return { success: true, coupon: created };
  } catch (err: any) {
    console.error("Error creating coupon:", err);
    return { success: false, message: "تعذر إنشاء الكوبون" };
  }
}

/**
 * Admin action to delete a coupon.
 */
export async function deleteCouponAction(couponId: string) {
  if (!(await isAuthorizedStaff(["ADMIN"]))) {
    return { success: false, message: "غير مصرح بهذا الإجراء" };
  }

  try {
    await prisma.coupon.delete({
      where: { id: couponId },
    });
    revalidatePath("/offers");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting coupon:", err);
    return { success: false, message: "تعذر حذف الكوبون" };
  }
}
