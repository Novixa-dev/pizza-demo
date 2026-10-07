import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pizza House Mukalla - بيتزا هاوس المكلا";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function TwitterImage() {
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
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234, 88, 12, 0.3) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "16px",
                background: "#ea580c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🍕
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", fontWeight: 900 }}>بيتزا هاوس المكلا</span>
              <span style={{ fontSize: "14px", color: "#f59e0b", fontWeight: 700 }}>@pizza_house66</span>
            </div>
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "8px 18px",
              borderRadius: "100px",
              fontSize: "14px",
              color: "#fbbf24",
              fontWeight: 800,
            }}
          >
            ★ 4.9 تقييم العملاء (348+)
          </div>
        </div>

        {/* Center */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", zIndex: 10 }}>
          <div style={{ fontSize: "48px", fontWeight: 900, lineHeight: 1.15 }}>
            طعم البيتزا الإيطالية والمخبوزات الطازجة في المكلا
          </div>
          <div style={{ fontSize: "20px", color: "#d6d3d1" }}>
            فوه · حي المساكن · بعد جامعة الأحقاف ومستوصف النور
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "20px",
            fontSize: "15px",
            color: "#a8a29e",
          }}
        >
          <span>هاتف: 05-375561 · واتساب: 772207788</span>
          <span style={{ color: "#ffffff", fontWeight: 800 }}>pizzahouse.ye</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
