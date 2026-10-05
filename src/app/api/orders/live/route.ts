import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phoneInput = (searchParams.get("phone") || "").trim();
    const orderIdsParam = (searchParams.get("orderIds") || "").trim();

    const orderIdList = orderIdsParam
      ? orderIdsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const digits = phoneInput.replace(/\D/g, "");
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
        phoneInput,
        digits,
        localDigits,
        `0${localDigits}`,
        `+967${localDigits}`,
        `967${localDigits}`,
        `00967${localDigits}`,
      ].filter(Boolean))
    );

    const orConditions: any[] = [];

    if (orderIdList.length > 0) {
      orConditions.push({ id: { in: orderIdList } });
      orConditions.push({ orderNumber: { in: orderIdList } });
    }

    if (digits.length >= 5) {
      orConditions.push(...candidates.map((c) => ({ customerPhone: { equals: c } })));
      if (last7.length >= 7) {
        orConditions.push({ customerPhone: { contains: last7 } });
      }
    }

    if (orConditions.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: orConditions,
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        status: true,
        pickupMode: true,
        requestedPickupTime: true,
        readyTime: true,
        updatedAt: true,
        createdAt: true,
        trackingToken: true,
        total: true,
        items: {
          select: {
            id: true,
            productNameAr: true,
            productNameEn: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      orders,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error("Live orders API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve live order status" },
      { status: 500 }
    );
  }
}
