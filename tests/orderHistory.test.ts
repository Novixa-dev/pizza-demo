import { describe, it, expect } from "vitest";
import { getCustomerOrderHistoryAction } from "@/app/actions/orderActions";

describe("Customer Order History Lookup by Phone", () => {
  it("rejects empty or very short phone numbers", async () => {
    const res1 = await getCustomerOrderHistoryAction("");
    expect(res1.success).toBe(false);

    const res2 = await getCustomerOrderHistoryAction("123");
    expect(res2.success).toBe(false);
  });

  it("finds seeded orders for customer phone 771234567", async () => {
    const res = await getCustomerOrderHistoryAction("771234567");
    expect(res.success).toBe(true);
    expect(res.orders).toBeDefined();
    expect(res.orders!.length).toBeGreaterThan(0);
    expect(res.stats).toBeDefined();
    expect(res.stats?.totalOrders).toBeGreaterThan(0);
    expect(res.stats?.latestCustomerName).toBe("سالم بن محفوظ");
  });

  it("normalizes phone with leading zero, spaces or country code", async () => {
    // With country code +967
    const res1 = await getCustomerOrderHistoryAction("+967771234567");
    expect(res1.success).toBe(true);
    expect(res1.orders!.length).toBeGreaterThan(0);

    // With leading 0
    const res2 = await getCustomerOrderHistoryAction("0771234567");
    expect(res2.success).toBe(true);
    expect(res2.orders!.length).toBeGreaterThan(0);

    // With spaces
    const res3 = await getCustomerOrderHistoryAction("771 234 567");
    expect(res3.success).toBe(true);
    expect(res3.orders!.length).toBeGreaterThan(0);
  });

  it("returns orders with operational statuses and item details", async () => {
    const res = await getCustomerOrderHistoryAction("733445566");
    expect(res.success).toBe(true);
    expect(res.orders!.length).toBeGreaterThan(0);
    const order = res.orders![0];
    expect(["PREPARING", "QUEUED", "CONFIRMED", "READY", "COMPLETED", "PENDING", "PAYMENT_PENDING"]).toContain(order.status);
    expect(order.items.length).toBeGreaterThan(0);
    expect(order.total).toBeGreaterThan(0);
  });
});
