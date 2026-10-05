import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", time: Date.now() })}\n\n`)
      );

      let lastSeenStatus: Record<string, string> = {};

      const pollInterval = setInterval(async () => {
        if (isClosed) {
          clearInterval(pollInterval);
          return;
        }

        if (orConditions.length === 0) {
          // Heartbeat keep-alive
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          return;
        }

        try {
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
              trackingToken: true,
              total: true,
            },
            take: 10,
          });

          for (const order of orders) {
            const previous = lastSeenStatus[order.id];
            if (previous && previous !== order.status) {
              // Status changed! Push SSE event
              controller.enqueue(
                encoder.encode(
                  `event: status_change\ndata: ${JSON.stringify({
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    previousStatus: previous,
                    newStatus: order.status,
                    trackingToken: order.trackingToken,
                    total: order.total,
                    timestamp: Date.now(),
                  })}\n\n`
                )
              );
            }
            lastSeenStatus[order.id] = order.status;
          }

          // Heartbeat keep-alive
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // Silently handle transient DB errors
        }
      }, 3500);

      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(pollInterval);
      });
    },
    cancel() {
      isClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
