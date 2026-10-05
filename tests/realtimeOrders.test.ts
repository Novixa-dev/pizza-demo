import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/orders/live/route";
import { NextRequest } from "next/server";

describe("Real-time Live Orders API (/api/orders/live)", () => {
  it("returns orders for customer phone", async () => {
    const req = new NextRequest("http://localhost:3000/api/orders/live?phone=771234567");
    const response = await GET(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders.length).toBeGreaterThan(0);
    expect(data.orders[0].orderNumber).toBeDefined();
    expect(data.orders[0].status).toBeDefined();
  });

  it("handles normalized phones with leading zeros and country codes", async () => {
    const req = new NextRequest("http://localhost:3000/api/orders/live?phone=%2B967771234567");
    const response = await GET(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.orders.length).toBeGreaterThan(0);
  });

  it("returns empty list safely if no phone or order ids provided", async () => {
    const req = new NextRequest("http://localhost:3000/api/orders/live");
    const response = await GET(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.orders).toEqual([]);
  });
});
