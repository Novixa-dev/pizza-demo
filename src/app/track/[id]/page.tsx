import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TrackingClientView from "./TrackingClientView";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { token?: string };
}) {
  const cleanParam = decodeURIComponent(params.id || "").trim();
  const withHash = cleanParam.startsWith("#") ? cleanParam : `#${cleanParam}`;
  const withoutHash = cleanParam.replace(/^#/, "");

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: cleanParam },
        { orderNumber: cleanParam },
        { orderNumber: withHash },
        { orderNumber: withoutHash },
        { trackingToken: cleanParam },
      ],
    },
    include: {
      items: {
        include: {
          options: true,
        },
      },
      payment: {
        include: {
          receipt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const isOwner = Boolean(
    searchParams.token && searchParams.token === order.trackingToken
  );

  // If visitor is the verified order owner (holds secret token), provide full tracking access.
  // Otherwise, sanitize data strictly to prevent IDOR and data harvesting.
  const sanitizedOrder = {
    ...order,
    // Redact secret tracking token if not owner
    trackingToken: isOwner ? order.trackingToken : null,
    // Mask customer name if unauthenticated visitor
    customerName: isOwner
      ? order.customerName
      : order.customerName.replace(/^(.).*(.)$/, "$1***$2"),
    // Mask phone number completely for strangers
    customerPhone: isOwner
      ? order.customerPhone.replace(/(\d{2})\d+(\d{3})/, "$1****$2")
      : "***",
    // Protect uploaded payment receipt image from public scrapers
    payment: order.payment
      ? {
          ...order.payment,
          receipt: isOwner ? order.payment.receipt : null,
        }
      : null,
    isOwner,
  };

  return <TrackingClientView order={sanitizedOrder} isOwner={isOwner} />;
}
