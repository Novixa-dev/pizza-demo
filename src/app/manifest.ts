import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "بيتزا هاوس المكلا | Pizza House Mukalla",
    short_name: "بيتزا هاوس",
    description: "اطلب أشهى بيتزا إيطالية وفطائر طازجة مسبقاً بدون انتظار في المكلا - فوه حي المساكن",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#121110",
    theme_color: "#c2410c",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
