import { describe, it, expect } from "vitest";

describe("Order Tracking Social Media Share System", () => {
  const sampleOrder = {
    orderNumber: "#PH-2048",
    status: "PREPARING",
    pickupTime: "08:30 م",
  };

  const generateShareData = (
    order: typeof sampleOrder,
    origin: string = "https://pizzahouse.ye",
    language: "ar" | "en" = "ar"
  ) => {
    const cleanNumber = order.orderNumber.startsWith("#")
      ? order.orderNumber
      : `#${order.orderNumber}`;
    const directUrl = `${origin}/track/${encodeURIComponent(cleanNumber)}`;

    const statusLabel =
      order.status === "READY"
        ? language === "ar"
          ? "جاهز للاستلام الآن! 🍕"
          : "Ready for Pickup! 🍕"
        : order.status === "PREPARING"
        ? language === "ar"
          ? "في الفرن (جاري التحضير) 🔥"
          : "Baking in Oven 🔥"
        : language === "ar"
        ? "تم تأكيد الطلب 📋"
        : "Confirmed 📋";

    const text =
      language === "ar"
        ? `🍕 تابع معي تجهيز طلبنا من بيتزا نوڤا (${order.orderNumber})!\nالحالة الحالية: ${statusLabel} | موعد الاستلام: ${order.pickupTime}\nرابط المتابعة المباشر:`
        : `🍕 Track our Pizza Nova order (${order.orderNumber})!\nCurrent Status: ${statusLabel}\nDirect tracking link:`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${directUrl}`)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(directUrl)}&text=${encodeURIComponent(text)}`;

    return { directUrl, text, whatsappUrl, telegramUrl };
  };

  it("generates valid direct tracking URL containing order number", () => {
    const data = generateShareData(sampleOrder);
    expect(data.directUrl).toBe("https://pizzahouse.ye/track/%23PH-2048");
  });

  it("constructs proper share message containing status and order number in Arabic", () => {
    const data = generateShareData(sampleOrder, "https://pizzahouse.ye", "ar");
    expect(data.text).toContain("#PH-2048");
    expect(data.text).toContain("في الفرن");
    expect(data.text).toContain("بيتزا نوڤا");
  });

  it("formats WhatsApp share link correctly with encoded text and tracking URL", () => {
    const data = generateShareData(sampleOrder);
    expect(data.whatsappUrl).toContain("https://wa.me/?text=");
    expect(decodeURIComponent(data.whatsappUrl)).toContain(data.directUrl);
  });

  it("formats Telegram share link with proper url and text parameters", () => {
    const data = generateShareData(sampleOrder);
    expect(data.telegramUrl).toContain("https://t.me/share/url?url=");
    expect(decodeURIComponent(data.telegramUrl)).toContain(data.directUrl);
  });
});
