"use server";

import { prisma } from "@/lib/prisma";
import { CreateOrderSchema } from "@/lib/validation";
import { calculateAuthoritativeOrder } from "@/lib/pricing";
import {
  calculateEarliestPickup,
  calculateKitchenReleaseTime,
} from "@/lib/scheduler";
import { calculateRestaurantStatus, getYemenNow } from "@/lib/businessHours";
import { validateOrderTransition, OrderStatus } from "@/lib/stateMachine";
import {
  isAuthorizedStaff,
  verifyPinForRole,
  setStaffSessionCookie,
  clearStaffSessionCookie,
  getStaffSession,
  checkPinRateLimit,
  recordFailedPinAttempt,
  resetPinAttempts,
  StaffRole,
} from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";

/**
 * Safe wrapper around revalidatePath that prevents errors when called outside an active Next.js static generation store context.
 */
function safeRevalidatePath(targetPath: string) {
  try {
    revalidatePath(targetPath);
  } catch {
    // Intentionally suppressed for standalone / test executions
  }
}

/**
 * Saves a base64 data URI receipt to disk safely.
 * Returns the public relative URL or null if invalid.
 */
async function saveReceiptImage(base64DataUri?: string): Promise<{
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
} | null> {
  if (!base64DataUri || !base64DataUri.startsWith("data:image/")) {
    return null;
  }

  try {
    const match = base64DataUri.match(/^data:(image\/(jpeg|png|webp|jpg));base64,(.+)$/);
    if (!match) return null;

    const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const buffer = Buffer.from(match[3], "base64");

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fileName = `receipt_${uniqueId}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    return {
      fileUrl: `/uploads/receipts/${fileName}`,
      fileName,
      mimeType,
      fileSize: buffer.length,
    };
  } catch (err) {
    console.error("Failed to save receipt image to disk:", err);
    return null;
  }
}

/**
 * Generates a collision-free human-readable order number.
 */
async function generateOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  let candidate = `#PH-${1024 + count}`;

  const exists = await prisma.order.findUnique({
    where: { orderNumber: candidate },
  });

  if (!exists) {
    return candidate;
  }

  // Fallback if collision occurs (e.g. concurrent inserts)
  const randomSalt = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `#PH-${1024 + count}-${randomSalt}`;
}

/**
 * Creates a new order authoritatively on the server.
 */
export async function createOrderAction(rawInput: unknown) {
  try {
    const parseResult = CreateOrderSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join("، "),
      };
    }

    const data = parseResult.data;

    // 1. Check restaurant status (is ordering paused or outside hours?)
    const restaurant = await prisma.restaurant.findFirst({
      include: { businessHours: true },
    });

    if (!restaurant) {
      return { success: false, error: "تعذر العثور على بيانات المطعم." };
    }

    const opStatus = calculateRestaurantStatus({
      businessHours: restaurant.businessHours,
      isOnlineOrderingPaused: restaurant.isOnlineOrderingPaused,
      pauseMessageAr: restaurant.pauseMessageAr,
      pauseMessageEn: restaurant.pauseMessageEn,
      now: getYemenNow(),
    });

    if (!opStatus.canOrderImmediate && !opStatus.canOrderScheduled) {
      return {
        success: false,
        error: opStatus.descriptionAr,
      };
    }

    if (data.pickupMode === "ASAP" && !opStatus.canOrderImmediate) {
      // Gracefully switch to scheduled pre-order for next available opening shift
      data.pickupMode = "SCHEDULED";
      if (!data.requestedTime) {
        data.requestedTime = "08:00";
      }
    }

    // 2. Authoritatively recalculate financial totals and validate items & options
    const calculation = await calculateAuthoritativeOrder(data.items);
    if (!calculation.isValid) {
      return { success: false, error: calculation.errorMessage };
    }

    // 3. Determine Pickup & Preparation Release Timings
    const now = new Date();
    let requestedPickupTime: Date;

    if (data.pickupMode === "ASAP") {
      requestedPickupTime = calculateEarliestPickup(
        now,
        restaurant.defaultPrepDuration,
        5
      );
    } else {
      if (!data.requestedTime) {
        data.requestedTime = "08:00";
      }
      const [h, m] = data.requestedTime.split(":").map(Number);
      requestedPickupTime = new Date(now);
      requestedPickupTime.setHours(h, m, 0, 0);

      // If scheduled time has already passed today or is too close, advance to tomorrow!
      const earliestAllowed = calculateEarliestPickup(
        now,
        restaurant.defaultPrepDuration,
        5
      );

      if (requestedPickupTime.getTime() < earliestAllowed.getTime()) {
        requestedPickupTime.setDate(requestedPickupTime.getDate() + 1);
      }
    }

    // Calculate Planned Prep Start (Release Time)
    const plannedPrepStartTime = calculateKitchenReleaseTime(
      requestedPickupTime,
      restaurant.defaultPrepDuration,
      5
    );

    // 4. Save receipt image to disk if uploaded
    const savedReceipt = await saveReceiptImage(data.receiptUrl);

    // Initial status determined deterministically
    let initialStatus = "CONFIRMED";
    let paymentStatus = "UNPAID";

    if (data.paymentMethod !== "PAY_AT_PICKUP") {
      initialStatus = "PAYMENT_PENDING";
      paymentStatus = "PENDING_VERIFICATION";
    } else {
      // If pickup is more than 30 mins in future, queue it
      if (plannedPrepStartTime.getTime() > now.getTime()) {
        initialStatus = "QUEUED";
      }
    }

    // 5. Generate unique human-readable Order Number
    const orderNumber = await generateOrderNumber();

    // 6. Atomic transaction creating order, items, options, and payment
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          restaurantId: restaurant.id,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          pickupMode: data.pickupMode,
          requestedPickupTime,
          plannedPrepStartTime,
          status: initialStatus,
          subtotal: calculation.subtotal,
          discount: calculation.discount,
          total: calculation.total,
          notes: data.notes,
          items: {
            create: calculation.items.map((item) => ({
              productId: item.productId,
              productNameAr: item.productNameAr,
              productNameEn: item.productNameEn,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,
              itemNotes: item.notes,
              options: {
                create: item.selectedOptions.map((opt) => ({
                  groupNameAr: opt.groupNameAr,
                  groupNameEn: opt.groupNameEn,
                  nameAr: opt.nameAr,
                  nameEn: opt.nameEn,
                  priceDelta: opt.priceDelta,
                })),
              },
            })),
          },
          payment: {
            create: {
              method: data.paymentMethod,
              status: paymentStatus,
              amount: calculation.total,
              referenceNumber: data.referenceNumber,
              receipt: savedReceipt
                ? {
                    create: {
                      fileUrl: savedReceipt.fileUrl,
                      fileName: savedReceipt.fileName,
                      mimeType: savedReceipt.mimeType,
                      fileSize: savedReceipt.fileSize,
                    },
                  }
                : undefined,
            },
          },
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actor: data.customerName,
          action: "ORDER_CREATED",
          entity: "Order",
          entityId: order.id,
          metadata: JSON.stringify({
            orderNumber,
            total: calculation.total,
            pickupMode: data.pickupMode,
            paymentMethod: data.paymentMethod,
          }),
        },
      });

      return order;
    });

    safeRevalidatePath("/kitchen");
    safeRevalidatePath("/admin");

    return {
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      trackingToken: newOrder.trackingToken,
    };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "حدث خطأ غير متوقع أثناء معالجة الطلب." };
  }
}

/**
 * Updates an order status with strict state machine and role authorization safeguards.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  actor = "staff"
) {
  try {
    // 1. Authorization check: Staff must be authenticated
    const session = getStaffSession();
    if (!session.isAuthenticated || !session.role) {
      return {
        success: false,
        error: "غير مصرح لك بتغيير حالة الطلب. يرجى تسجيل الدخول برمز الموظف.",
      };
    }

    // 2. Fetch existing order
    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      return { success: false, error: "الطلب غير موجود." };
    }

    // 3. State machine validation
    const transitionCheck = validateOrderTransition(
      existing.status,
      newStatus,
      session.role
    );
    if (!transitionCheck.isValid) {
      return {
        success: false,
        error: transitionCheck.errorMessage || "الانتقال بين الحالات غير مسموح.",
      };
    }

    // 4. Update timestamps appropriately
    const updates: Record<string, unknown> = { status: newStatus };

    if (newStatus === "PREPARING" && !existing.actualPrepStartTime) {
      updates.actualPrepStartTime = new Date();
    } else if (newStatus === "READY" && !existing.readyTime) {
      updates.readyTime = new Date();
    } else if (newStatus === "COMPLETED" && !existing.completedTime) {
      updates.completedTime = new Date();
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updates,
    });

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        actor: `${actor} (${session.role})`,
        action: `STATUS_CHANGED_TO_${newStatus}`,
        entity: "Order",
        entityId: orderId,
        metadata: JSON.stringify({
          previousStatus: existing.status,
          newStatus,
          role: session.role,
        }),
      },
    });

    safeRevalidatePath("/kitchen");
    safeRevalidatePath("/admin");
    safeRevalidatePath(`/track/${orderId}`);

    return { success: true };
  } catch (err) {
    console.error("Failed to update order status:", err);
    return { success: false, error: "تعذر تحديث حالة الطلب." };
  }
}

/**
 * Approves or rejects an uploaded bank transfer receipt.
 * Restricted to CASHIER or ADMIN roles.
 */
export async function verifyPaymentAction(
  orderId: string,
  isApproved: boolean,
  rejectReason?: string,
  reviewer = "الكاشير"
) {
  try {
    // 1. Authorization check
    const session = getStaffSession();
    if (
      !session.isAuthenticated ||
      !session.role ||
      !["ADMIN", "CASHIER"].includes(session.role)
    ) {
      return {
        success: false,
        error: "غير مصرح لك بمراجعة المدفوعات. يلزم صلاحية الكاشير أو الإدارة.",
      };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || !order.payment) {
      return { success: false, error: "بيانات الدفع غير متوفرة." };
    }

    // Prevent re-verifying already finalized payments
    if (order.payment.status === "VERIFIED" && isApproved) {
      return { success: false, error: "تم تأكيد هذا الإشعار مسبقاً." };
    }

    const now = new Date();

    if (isApproved) {
      await prisma.payment.update({
        where: { orderId },
        data: {
          status: "VERIFIED",
          verifiedAt: now,
          verifiedBy: `${reviewer} (${session.role})`,
          rejectReason: null,
        },
      });

      // Update order status: If scheduled for later, QUEUED; otherwise, CONFIRMED
      const nextStatus =
        order.plannedPrepStartTime.getTime() > now.getTime()
          ? "QUEUED"
          : "CONFIRMED";

      // Validate state transition
      const check = validateOrderTransition(order.status, nextStatus, session.role);
      if (check.isValid) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: nextStatus },
        });
      }
    } else {
      await prisma.payment.update({
        where: { orderId },
        data: {
          status: "REJECTED",
          rejectReason: rejectReason || "الإشعار غير مطابق أو غير واضح.",
          verifiedAt: now,
          verifiedBy: `${reviewer} (${session.role})`,
        },
      });

      const check = validateOrderTransition(order.status, "REJECTED", session.role);
      if (check.isValid) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "REJECTED" },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        actor: `${reviewer} (${session.role})`,
        action: isApproved ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED",
        entity: "Payment",
        entityId: order.payment.id,
        metadata: JSON.stringify({ orderId, isApproved, rejectReason }),
      },
    });

    safeRevalidatePath("/admin");
    safeRevalidatePath("/kitchen");
    safeRevalidatePath(`/track/${orderId}`);

    return { success: true };
  } catch (err) {
    console.error("Failed to verify payment:", err);
    return { success: false, error: "تعذر استكمال مراجعة الدفع." };
  }
}

/**
 * Manager control: Toggles paused online ordering.
 * Restricted to ADMIN role.
 */
export async function togglePauseOrderingAction(
  isPaused: boolean,
  messageAr?: string
) {
  try {
    const session = getStaffSession();
    if (!session.isAuthenticated || session.role !== "ADMIN") {
      return {
        success: false,
        error: "غير مصرح لك بإيقاف استقبال الطلبات. يلزم صلاحية مدير النظام.",
      };
    }

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) return { success: false, error: "المطعم غير موجود." };

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        isOnlineOrderingPaused: isPaused,
        pauseMessageAr: messageAr,
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: `Admin (${session.role})`,
        action: isPaused ? "ORDERING_PAUSED" : "ORDERING_RESUMED",
        entity: "Restaurant",
        entityId: restaurant.id,
        metadata: JSON.stringify({ isPaused, messageAr }),
      },
    });

    safeRevalidatePath("/");
    safeRevalidatePath("/menu");
    safeRevalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error("Failed to toggle pause:", err);
    return { success: false, error: "تعذر تحديث حالة استقبال الطلبات." };
  }
}

/**
 * Manager/Kitchen control: Quick toggle product availability (Available vs Sold Out).
 * Restricted to ADMIN or KITCHEN role.
 */
export async function toggleProductAvailabilityAction(
  productId: string,
  isAvailable: boolean
) {
  try {
    const session = getStaffSession();
    if (
      !session.isAuthenticated ||
      !session.role ||
      !["ADMIN", "KITCHEN"].includes(session.role)
    ) {
      return {
        success: false,
        error: "غير مصرح لك بتعديل توفر الأصناف في القائمة.",
      };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { isAvailable },
    });

    await prisma.auditLog.create({
      data: {
        actor: `Staff (${session.role})`,
        action: isAvailable ? "PRODUCT_AVAILABLE" : "PRODUCT_86ED",
        entity: "Product",
        entityId: productId,
        metadata: JSON.stringify({ isAvailable }),
      },
    });

    safeRevalidatePath("/menu");
    safeRevalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error("Failed to toggle product availability:", err);
    return { success: false, error: "تعذر تحديث حالة الصنف." };
  }
}

/**
 * Staff authentication action via PIN with brute-force rate limiting.
 */
export async function loginStaffAction(pin: string, targetRole: StaffRole) {
  try {
    const headersList = headers();
    const clientIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown-client";

    // 1. Check if client IP is currently locked out
    const rateLimitCheck = checkPinRateLimit(clientIp);
    if (rateLimitCheck.isLocked) {
      return {
        success: false,
        error: `تم حظر المحاولات مؤقتاً لتكرار إدخال الرمز غير الصحيح. يرجى الانتظار ${rateLimitCheck.remainingLockoutMinutes} دقيقة.`,
      };
    }

    // 2. Timing-safe PIN verification
    const verification = verifyPinForRole(pin, targetRole);
    if (!verification.success || !verification.role) {
      const attempt = recordFailedPinAttempt(clientIp);
      if (attempt.isNowLocked) {
        return {
          success: false,
          error:
            "تم تجاوز الحد الأقصى للمحاولات (5 محاولات). تم حظر إدخال الرمز مؤقتاً لمدة 15 دقيقة لحماية النظام.",
        };
      }
      return {
        success: false,
        error: `الرمز السري المدخل غير صحيح. (المحاولات المتبقية: ${attempt.remainingAttempts})`,
      };
    }

    // 3. Reset rate limit counter on success & issue HTTP-only cookie
    resetPinAttempts(clientIp);
    setStaffSessionCookie(verification.role);

    return {
      success: true,
      role: verification.role,
    };
  } catch (err) {
    console.error("Staff login failed:", err);
    return { success: false, error: "تعذر تسجيل الدخول." };
  }
}

/**
 * Customer self-cancellation:
 * Allows a customer holding the tracking token to cancel their order
 * strictly BEFORE preparation begins in the kitchen.
 */
export async function cancelCustomerOrderAction(
  orderId: string,
  trackingToken: string,
  cancelReason?: string
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "الطلب غير موجود." };
    }

    if (order.trackingToken !== trackingToken) {
      return {
        success: false,
        error: "رمز التتبع غير صالح. غير مصرح بإلغاء هذا الطلب.",
      };
    }

    // Only allow cancellation if order has not yet entered the kitchen oven
    if (["PREPARING", "READY", "COMPLETED"].includes(order.status)) {
      return {
        success: false,
        error: "نعتذر، لا يمكن إلغاء الطلب بعد دخوله مرحلة الخبز في الفرن.",
      };
    }

    if (order.status === "CANCELLED") {
      return { success: false, error: "الطلب ملغي مسبقاً." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    await prisma.auditLog.create({
      data: {
        actor: `Customer (${order.customerName})`,
        action: "ORDER_CANCELLED_BY_CUSTOMER",
        entity: "Order",
        entityId: orderId,
        metadata: JSON.stringify({
          orderNumber: order.orderNumber,
          cancelReason: cancelReason || "Customer self-cancelled before prep",
        }),
      },
    });

    safeRevalidatePath("/kitchen");
    safeRevalidatePath("/admin");
    safeRevalidatePath(`/track/${orderId}`);

    return { success: true };
  } catch (err) {
    console.error("Failed to cancel customer order:", err);
    return { success: false, error: "تعذر استكمال إلغاء الطلب." };
  }
}

/**
 * Updates restaurant store operational settings (Admin only).
 */
export async function updateStoreSettingsAction(data: {
  defaultPrepDuration?: number;
  slotCapacityLimit?: number;
  phone?: string;
  whatsapp?: string;
  addressAr?: string;
}) {
  try {
    const session = getStaffSession();
    if (!isAuthorizedStaff(["ADMIN"])) {
      return { success: false, error: "غير مصرح لك بتعديل إعدادات الفرع." };
    }

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return { success: false, error: "تعذر العثور على بيانات المطعم." };
    }

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        ...(data.defaultPrepDuration !== undefined && {
          defaultPrepDuration: Math.max(5, Math.min(60, data.defaultPrepDuration)),
        }),
        ...(data.slotCapacityLimit !== undefined && {
          slotCapacityMax: Math.max(1, Math.min(30, data.slotCapacityLimit)),
        }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.whatsapp && { whatsapp: data.whatsapp.trim() }),
        ...(data.addressAr && { addressAr: data.addressAr.trim() }),
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: `Admin (${session.role})`,
        action: "STORE_SETTINGS_UPDATED",
        entity: "Restaurant",
        entityId: restaurant.id,
        metadata: JSON.stringify(data),
      },
    });

    safeRevalidatePath("/admin");
    safeRevalidatePath("/checkout");
    safeRevalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Failed to update store settings:", err);
    return { success: false, error: "تعذر حفظ إعدادات الفرع." };
  }
}

/**
 * Staff logout action.
 */
export async function logoutStaffAction() {
  try {
    clearStaffSessionCookie();
    safeRevalidatePath("/admin");
    safeRevalidatePath("/kitchen");
    return { success: true };
  } catch (err) {
    console.error("Staff logout failed:", err);
    return { success: false, error: "تعذر تسجيل الخروج." };
  }
}

/**
 * Customer Order History Action:
 * Retrieves past orders for a customer by their phone number (with robust Yemen phone normalization).
 */
export async function getCustomerOrderHistoryAction(phoneInput: string) {
  try {
    const raw = (phoneInput || "").trim();
    if (!raw) {
      return { success: false, error: "يرجى إدخال رقم الهاتف." };
    }

    // Clean non-digits
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 5) {
      return { success: false, error: "رقم الهاتف المدخل قصير جداً." };
    }

    // Generate phone variants:
    // e.g. "967771234567" -> "771234567"
    // e.g. "0771234567" -> "771234567"
    let localDigits = digits;
    if (localDigits.startsWith("967")) {
      localDigits = localDigits.substring(3);
    }
    if (localDigits.startsWith("0")) {
      localDigits = localDigits.substring(1);
    }

    const last7 = digits.slice(-7);

    const candidates = Array.from(
      new Set([
        raw,
        digits,
        localDigits,
        `0${localDigits}`,
        `+967${localDigits}`,
        `967${localDigits}`,
        `00967${localDigits}`,
      ])
    );

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          ...candidates.map((c) => ({ customerPhone: { equals: c } })),
          { customerPhone: { contains: last7 } },
        ],
      },
      include: {
        items: {
          include: {
            options: true,
            product: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                imageUrl: true,
                isAvailable: true,
                basePrice: true,
                categoryId: true,
                optionGroups: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
        payment: {
          include: {
            receipt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // In-memory precision filter to ensure only true matches for this phone
    const filteredOrders = orders.filter((o) => {
      const oDigits = o.customerPhone.replace(/\D/g, "");
      return (
        oDigits.endsWith(last7) ||
        candidates.includes(o.customerPhone.trim())
      );
    });

    // Calculate customer profile summary stats
    const totalOrders = filteredOrders.length;
    const totalSpent = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const activeOrdersCount = filteredOrders.filter((o) =>
      ["PENDING", "PAYMENT_PENDING", "CONFIRMED", "QUEUED", "PREPARING", "READY"].includes(o.status)
    ).length;

    const latestCustomerName = filteredOrders[0]?.customerName || "";

    // Count product frequencies to find favorite item
    const productCounts: Record<string, { nameAr: string; nameEn: string; count: number }> = {};
    for (const ord of filteredOrders) {
      for (const it of ord.items) {
        if (!productCounts[it.productId]) {
          productCounts[it.productId] = {
            nameAr: it.productNameAr,
            nameEn: it.productNameEn,
            count: 0,
          };
        }
        productCounts[it.productId].count += it.quantity;
      }
    }

    const sortedProducts = Object.values(productCounts).sort((a, b) => b.count - a.count);
    const favoriteItem = sortedProducts[0] || null;

    return {
      success: true,
      orders: filteredOrders,
      stats: {
        totalOrders,
        totalSpent,
        activeOrdersCount,
        latestCustomerName,
        favoriteItem,
        searchedPhone: raw,
        lastOrderDate: filteredOrders[0]?.createdAt || null,
      },
    };
  } catch (err) {
    console.error("Failed to query customer order history:", err);
    return { success: false, error: "تعذر استرجاع سجل الطلبات. يرجى المحاولة مرة أخرى." };
  }
}

/**
 * Customer action: Submit or update feedback and rating for a completed order.
 * Validates that order exists and is in COMPLETED status.
 */
export async function submitOrderFeedbackAction(payload: {
  orderId: string;
  token?: string;
  mealRating: number;
  serviceRating: number;
  tags?: string[];
  comment?: string;
}) {
  try {
    const { orderId, token, mealRating, serviceRating, tags = [], comment = "" } = payload;

    if (!orderId) {
      return { success: false, error: "معرف الطلب مفقود." };
    }

    if (
      !mealRating ||
      mealRating < 1 ||
      mealRating > 5 ||
      !serviceRating ||
      serviceRating < 1 ||
      serviceRating > 5
    ) {
      return {
        success: false,
        error: "يرجى تحديد التقييم بالنجوم من 1 إلى 5 لكل من الوجبة والخدمة.",
      };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { feedback: true },
    });

    if (!order) {
      return { success: false, error: "الطلب غير موجود." };
    }

    // Authorization: If token provided, ensure it matches trackingToken
    if (token && order.trackingToken && token !== order.trackingToken) {
      return { success: false, error: "غير مصرح لك بتقديم تقييم لهذا الطلب." };
    }

    // Ensure order is completed
    if (order.status !== "COMPLETED") {
      return {
        success: false,
        error: "يمكنك تقييم الطلب بعد استلامه واكتماله بنجاح.",
      };
    }

    const tagsString = Array.isArray(tags) ? tags.filter(Boolean).join(",") : "";
    const sanitizedComment = (comment || "").slice(0, 500).trim();

    const feedback = await prisma.orderFeedback.upsert({
      where: { orderId },
      create: {
        orderId,
        mealRating: Math.round(mealRating),
        serviceRating: Math.round(serviceRating),
        tags: tagsString,
        comment: sanitizedComment,
        customerName: order.customerName,
      },
      update: {
        mealRating: Math.round(mealRating),
        serviceRating: Math.round(serviceRating),
        tags: tagsString,
        comment: sanitizedComment,
        customerName: order.customerName,
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: `${order.customerName} (Customer)`,
        action: "ORDER_FEEDBACK_SUBMITTED",
        entity: "OrderFeedback",
        entityId: feedback.id,
        metadata: JSON.stringify({
          orderId,
          orderNumber: order.orderNumber,
          mealRating: Math.round(mealRating),
          serviceRating: Math.round(serviceRating),
          tags,
        }),
      },
    });

    safeRevalidatePath(`/track/${order.orderNumber}`);
    safeRevalidatePath(`/track/${orderId}`);
    safeRevalidatePath("/admin");

    return {
      success: true,
      feedback: {
        id: feedback.id,
        mealRating: feedback.mealRating,
        serviceRating: feedback.serviceRating,
        tags: feedback.tags ? feedback.tags.split(",") : [],
        comment: feedback.comment,
        createdAt: feedback.createdAt,
      },
    };
  } catch (err) {
    console.error("Failed to submit feedback:", err);
    return { success: false, error: "تعذر حفظ التقييم. يرجى المحاولة مرة أخرى." };
  }
}

/**
 * Customer Testimonials Action:
 * Fetches recent verified customer feedback stored in the database.
 */
export async function getRecentTestimonialsAction(limit = 6) {
  try {
    const feedback = await prisma.orderFeedback.findMany({
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
      take: limit,
    });

    return {
      success: true,
      testimonials: feedback,
    };
  } catch (err) {
    console.error("Failed to query recent testimonials:", err);
    return { success: false, testimonials: [] };
  }
}



