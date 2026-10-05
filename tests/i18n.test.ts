import { describe, it, expect } from "vitest";
import { getDictionary } from "@/lib/i18n/dictionaries";

describe("Global i18n Dictionary and Language Support", () => {
  it("provides complete Arabic dictionary", () => {
    const dictAr = getDictionary("ar");
    expect(dictAr.nav.home).toBe("الرئيسية");
    expect(dictAr.nav.menu).toBe("قائمة الطعام");
    expect(dictAr.nav.orderHistory).toBe("طلباتي السابقة");
    expect(dictAr.cart.title).toBe("سلة الطلب");
    expect(dictAr.checkout.title).toBe("إتمام الطلب وتحديد الاستلام");
    expect(dictAr.history.title).toBe("سجل طلباتي ومتابعة الحساب");
  });

  it("provides complete English dictionary", () => {
    const dictEn = getDictionary("en");
    expect(dictEn.nav.home).toBe("Home");
    expect(dictEn.nav.menu).toBe("Menu");
    expect(dictEn.nav.orderHistory).toBe("Order History");
    expect(dictEn.cart.title).toBe("Your Cart");
    expect(dictEn.checkout.title).toBe("Checkout & Pickup Schedule");
    expect(dictEn.history.title).toBe("Customer Order History");
  });

  it("includes all matching status keys in both languages", () => {
    const dictAr = getDictionary("ar");
    const dictEn = getDictionary("en");

    expect(dictAr.history.filterInOven).toBeDefined();
    expect(dictEn.history.filterInOven).toBeDefined();
    expect(dictAr.history.reorderItem).toBeDefined();
    expect(dictEn.history.reorderItem).toBeDefined();
  });
});
