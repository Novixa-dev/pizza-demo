import type { Metadata, Viewport } from "next";

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export const siteMetadata: Metadata = {
  title: "بيتزا هاوس المكلا | Pizza House Mukalla - اطلب واستلم مسبقاً بدون انتظار",
  description:
    "مطعم بيتزا هاوس في فوه، حي المساكن، المكلا (بعد جامعة الأحقاف ومستوصف النور). اطلب مسبقاً وحدد موعد استلامك واستمتع بأشهى بيتزا إيطالية مخبوزة على الحجر وفطائر طازجة بدون انتظار.",
  applicationName: "بيتزا هاوس المكلا | Pizza House Mukalla",
  category: "Food & Drink",
  keywords: [
    "بيتزا هاوس المكلا",
    "Pizza House Mukalla",
    "pizza_house66",
    "مطعم بيتزا فوه",
    "حي المساكن فوه",
    "جامعة الأحقاف فوه",
    "مستوصف النور فوه",
    "أفضل بيتزا في المكلا",
    "طلب مسبق واستلام المكلا",
    "فطائر ومعجنات حضرموت",
    "بيتزا إيطالية فرن حجر",
    "كريمي حاسب بيتزا",
    "العمقي تحويل بيتزا",
    "البسيري تحويل بيتزا",
    "خريطة بيتزا هاوس المكلا",
  ],
  authors: [{ name: "Pizza House Mukalla (@pizza_house66)", url: "https://www.instagram.com/pizza_house66/" }],
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "بيتزا هاوس",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: false,
  },
  openGraph: {
    title: "بيتزا هاوس المكلا | Pizza House Mukalla - اطلب واستلم مسبقاً بدون انتظار",
    description:
      "طعم البيتزا الإيطالية الحقيقي والمخبوزات الطازجة على حجر الفرن البركاني في المكلا، فوه حي المساكن (بعد جامعة الأحقاف ومستوصف النور). اطلب مسبقاً واستلم ساخنة فور وصولك.",
    url: "https://pizzahouse.ye",
    siteName: "بيتزا هاوس المكلا | Pizza House Mukalla (@pizza_house66)",
    locale: "ar_YE",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "بيتزا هاوس المكلا - هوية المطعم والطلب المسبق - فوه حي المساكن",
        type: "image/png",
      },
      {
        url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "بيتزا هاوس المكلا - بيتزا إيطالية طازجة من الفرن الحجري - فوه حي المساكن",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@pizza_house66",
    creator: "@pizza_house66",
    title: "بيتزا هاوس المكلا | Pizza House Mukalla",
    description: "اطلب مسبقاً وتجنب الانتظار - طعم البيتزا الإيطالية الحقيقي والمخبوزات الطازجة في فوه حي المساكن، المكلا.",
    images: [
      "/twitter-image",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
    ],
  },
  other: {
    "restaurant:contact_info:street_address": "فوه، حي المساكن، بعد جامعة الأحقاف ومستوصف النور يمين الشارع العام",
    "restaurant:contact_info:locality": "المكلا",
    "restaurant:contact_info:region": "حضرموت",
    "restaurant:contact_info:postal_code": "F2QV+HPW",
    "restaurant:contact_info:country_name": "Yemen",
    "restaurant:contact_info:phone_number": "+967-5-375561",
    "restaurant:contact_info:website": "https://pizzahouse.ye",
    "place:location:latitude": "14.4892",
    "place:location:longitude": "49.0445",
  },
};

export const jsonLdRestaurantData = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "FastFoodRestaurant", "LocalBusiness", "FoodEstablishment"],
  name: "Pizza House Mukalla (بيتزا هاوس المكلا)",
  alternateName: ["بيتزا هاوس", "Pizza House 66", "pizza_house66"],
  description:
    "مطعم بيتزا هاوس في فوه حي المساكن بالمكلا. متخصص في البيتزا الإيطالية المخبوزة على الحجر والفطائر الطازجة مع إمكانية الطلب المسبق والاستلام السريع بدون انتظار.",
  image: [
    "https://pizzahouse.ye/opengraph-image",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
  ],
  logo: "https://pizzahouse.ye/icon-512.png",
  telephone: "+967-5-375561",
  url: "https://pizzahouse.ye",
  sameAs: [
    "https://www.instagram.com/pizza_house66/",
    "https://maps.app.goo.gl/zre73sxKGyM27KvE6",
    "https://maps.app.goo.gl/p9awfgXmTeSStM317",
  ],
  hasMap: "https://maps.app.goo.gl/zre73sxKGyM27KvE6",
  menu: "https://pizzahouse.ye/menu",
  hasMenu: "https://pizzahouse.ye/menu",
  servesCuisine: ["Italian Pizza", "Pastries", "Fatayer", "Calzone", "Burgers"],
  priceRange: "1,500 - 6,500 YER",
  currenciesAccepted: "YER",
  paymentAccepted: ["Cash", "Kuraimi Bank (Hassib)", "Al-Amqi", "Al-Busairi"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "فوه، حي المساكن، بعد جامعة الأحقاف ومستوصف النور يمين الشارع العام (F2QV+HPW)",
    addressLocality: "المكلا (Al Mukalla)",
    addressRegion: "حضرموت (Hadhramaut)",
    postalCode: "F2QV+HPW",
    addressCountry: "YE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 14.4891696,
    longitude: 49.0444845,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+967-5-375561",
      contactType: "customer service",
      areaServed: "YE",
      availableLanguage: ["Arabic", "English"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+967-772207788",
      contactType: "orders and reservations (WhatsApp)",
      areaServed: "YE",
      availableLanguage: ["Arabic", "English"],
    },
  ],
  amenityFeature: [
    {
      "@type": "LocationFeatureSpecification",
      name: "قسم عائلات ونساء خاص ومستقل",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "صالة شبابية عامة",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "جلسات خارجية هادئة",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "ركن استلام سريع مسبق (Pickup Express)",
      value: true,
    },
  ],
  servesBreakfast: true,
  servesDinner: true,
  acceptsReservations: "True",
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
