import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "بيتزا هاوس المكلا | Pizza House Mukalla - فوه حي المساكن";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px 64px",
          background: "linear-gradient(135deg, #181512 0%, #0d0c0b 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          direction: "rtl",
        }}
      >
        {/* Ambient Warm Embers / Glowing stone oven reflections */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234, 88, 12, 0.28) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-80px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #ea580c, #c2410c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                boxShadow: "0 10px 30px rgba(234, 88, 12, 0.4)",
              }}
            >
              66
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "30px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>
                بيتزا هاوس المكلا
              </span>
              <span style={{ fontSize: "15px", color: "#f59e0b", fontWeight: 700, letterSpacing: "1px" }}>
                PIZZA HOUSE MUKALLA · @pizza_house66
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "8px 20px",
              borderRadius: "100px",
              fontSize: "15px",
              color: "#fbbf24",
              fontWeight: 800,
            }}
          >
            <span>4.9/5 تقييم العملاء</span>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
            <span style={{ color: "#ffffff" }}>فوه حي المساكن</span>
          </div>
        </div>

        {/* Center Main Headline & Value Proposition */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            zIndex: 10,
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              fontWeight: 900,
              lineHeight: 1.15,
              color: "#ffffff",
            }}
          >
            طعم البيتزا الإيطالية الأصيل والمخبوزات الطازجة
          </div>
          <div style={{ fontSize: "22px", color: "#d6d3d1", lineHeight: 1.45, fontWeight: 500 }}>
            اطلب مسبقاً وتجنب الانتظار · مخبوزة على الحجر البركاني · بعد جامعة الأحقاف ومستوصف النور
          </div>
        </div>

        {/* Bottom Feature Badges & Details */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "22px", fontSize: "15px", color: "#a8a29e", fontWeight: 600 }}>
            <span style={{ color: "#f59e0b" }}>حضرموت · المكلا · فوه</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span>05-375561 · 772207788</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ color: "#34d399" }}>كريمي · العمقي · البسيري</span>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #ea580c, #c2410c)",
              color: "#ffffff",
              padding: "10px 24px",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: 800,
              boxShadow: "0 10px 25px rgba(234, 88, 12, 0.4)",
            }}
          >
            pizzahouse.ye
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
