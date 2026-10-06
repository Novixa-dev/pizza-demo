import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: "بيتزا هاوس المكلا | Pizza House Mukalla - اطلب واستلم مسبقاً بدون انتظار",
  description:
    "مطعم بيتزا هاوس في فوه، حي المساكن، المكلا. اطلب مسبقاً وحدد موعد استلامك واستمتع بأشهى بيتزا إيطالية مخبوزة على الحجر وفطائر طازجة بدون انتظار.",
  applicationName: "بيتزا هاوس المكلا | Pizza House",
  category: "Food & Drink",
  keywords: [
    "بيتزا هاوس المكلا",
    "Pizza House Mukalla",
    "مطعم بيتزا فوه",
    "حي المساكن فوه",
    "أفضل بيتزا في المكلا",
    "طلب مسبق واستلام المكلا",
    "فطائر ومعجنات حضرموت",
    "بيتزا إيطالية فرن حجر",
    "كريمي حاسب بيتزا",
    "العمقي تحويل بيتزا",
    "البسيري تحويل بيتزا",
  ],
  authors: [{ name: "Pizza House Mukalla" }],
  creator: "Pizza House Mukalla",
  publisher: "Pizza House Mukalla",
  metadataBase: new URL("https://pizzahouse.ye"),
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      "ar-YE": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    title: "بيتزا هاوس المكلا | Pizza House Mukalla - اطلب واستلم مسبقاً بدون انتظار",
    description:
      "طعم البيتزا الإيطالية الحقيقي والمخبوزات الطازجة على حجر الفرن البركاني في المكلا، فوه حي المساكن. اطلب مسبقاً واستلم ساخنة فور وصولك.",
    url: "https://pizzahouse.ye",
    siteName: "بيتزا هاوس المكلا | Pizza House",
    locale: "ar_YE",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "بيتزا هاوس المكلا - بيتزا إيطالية طازجة من الفرن الحجري",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "بيتزا هاوس المكلا | Pizza House Mukalla",
    description: "اطلب مسبقاً وتجنب الانتظار - طعم البيتزا الإيطالية الحقيقي والمخبوزات الطازجة في فوه حي المساكن.",
    images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80"],
  },
};

export const jsonLdRestaurantData = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "FastFoodRestaurant"],
  name: "Pizza House Mukalla (بيتزا هاوس المكلا)",
  image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
  telephone: "+967-5-375561",
  url: "https://pizzahouse.ye",
  menu: "https://pizzahouse.ye/menu",
  hasMenu: "https://pizzahouse.ye/menu",
  servesCuisine: ["Italian Pizza", "Pastries", "Fatayer", "Calzone"],
  priceRange: "1,500 - 6,500 YER",
  currenciesAccepted: "YER",
  paymentAccepted: ["Cash", "Kuraimi Bank (Hassib)", "Al-Amqi", "Al-Busairi"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Fuwa, Al-Masaken District, near Ba'abad Station and Al-Ahgaff University",
    addressLocality: "Mukalla",
    addressRegion: "Hadhramaut",
    addressCountry: "YE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 14.5367,
    longitude: 49.1256,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "348",
    bestRating: "5",
    worstRating: "1",
  },
  potentialAction: {
    "@type": "OrderAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://pizzahouse.ye/menu",
      inLanguage: ["ar", "en"],
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
      ],
      opens: "08:00",
      closes: "12:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "16:00",
      closes: "23:30",
    },
  ],
};
