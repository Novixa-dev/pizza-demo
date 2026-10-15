import { SITE_URL } from "./site";
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
  title: "بيتزا نوڤا | Pizza Nova - اطلب واستلم مسبقاً بدون انتظار",
  description:
    "مطعم بيتزا نوڤا في وسط المدينة، المكلا (عنوان تجريبي لأغراض العرض). اطلب مسبقاً وحدد موعد استلامك واستمتع بأشهى بيتزا إيطالية مخبوزة على الحجر وفطائر طازجة بدون انتظار.",
  applicationName: "بيتزا نوڤا | Pizza Nova",
  category: "Food & Drink",
  keywords: [
    "بيتزا نوڤا",
    "Pizza Nova",
    "novixa",
    "مطعم بيتزا وسط المدينة",
    "مطعم بيتزا المكلا",
        "أفضل بيتزا في المكلا",
    "طلب مسبق واستلام المكلا",
    "فطائر ومعجنات حضرموت",
    "بيتزا إيطالية فرن حجر",
    "كريمي حاسب بيتزا",
    "العمقي تحويل بيتزا",
    "البسيري تحويل بيتزا",
    "خريطة بيتزا نوڤا",
  ],
  authors: [{ name: "Pizza Nova (@novixa)", url: "https://www.facebook.com/profile.php?id=61594556255556" }],
  creator: "Pizza Nova",
  publisher: "Pizza Nova",
  metadataBase: new URL(SITE_URL),
  robots: process.env.NEXT_PUBLIC_DEMO_MODE !== "false" ? { index: false, follow: false } : { index: true, follow: true },
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
    title: "بيتزا نوڤا",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: false,
  },
  openGraph: {
    title: "بيتزا نوڤا | Pizza Nova - اطلب واستلم مسبقاً بدون انتظار",
    description:
      "طعم البيتزا الإيطالية الحقيقي والمخبوزات الطازجة على حجر الفرن البركاني في المكلا، وسط المدينة (عنوان تجريبي لأغراض العرض). اطلب مسبقاً واستلم ساخنة فور وصولك.",
    url: SITE_URL,
    siteName: "بيتزا نوڤا | Pizza Nova (@novixa)",
    locale: "ar_YE",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "بيتزا نوڤا - بيتزا حجرية طازجة، اطلب مسبقاً واستلم بلا انتظار",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@novixa",
    creator: "@novixa",
    title: "بيتزا نوڤا | Pizza Nova",
    description: "اطلب مسبقاً وتجنب الانتظار - طعم البيتزا الإيطالية الحقيقي والمخبوزات الطازجة في وسط المدينة، المكلا.",
    images: ["/og-image.jpg"],
  },
  other: {
    "restaurant:contact_info:street_address": "وسط المدينة، عنوان تجريبي لأغراض العرض",
    "restaurant:contact_info:locality": "المكلا",
    "restaurant:contact_info:region": "حضرموت",
    "restaurant:contact_info:postal_code": "Demo",
    "restaurant:contact_info:country_name": "Yemen",
    "restaurant:contact_info:phone_number": "+967-5-000000",
    "restaurant:contact_info:website": `${SITE_URL}`,
    "place:location:latitude": "14.5425",
    "place:location:longitude": "49.1242",
  },
};

export const jsonLdRestaurantData = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "FastFoodRestaurant", "LocalBusiness", "FoodEstablishment"],
  name: "Pizza Nova (بيتزا نوڤا)",
  alternateName: ["بيتزا نوڤا", "Pizza Nova 66", "novixa"],
  description:
    "مطعم بيتزا نوڤا في وسط المدينة بالمكلا. متخصص في البيتزا الإيطالية المخبوزة على الحجر والفطائر الطازجة مع إمكانية الطلب المسبق والاستلام السريع بدون انتظار.",
  image: [
    `${SITE_URL}/og-image.jpg`,
  ],
  logo: `${SITE_URL}/icon-512.png`,
  telephone: "+967-5-000000",
  url: SITE_URL,
  sameAs: [
    "https://www.facebook.com/profile.php?id=61594556255556",
    "https://www.google.com/maps/search/?api=1&query=Mukalla",
    "https://maps.app.goo.gl/p9awfgXmTeSStM317",
  ],
  hasMap: "https://www.google.com/maps/search/?api=1&query=Mukalla",
  menu: `${SITE_URL}/menu`,
  hasMenu: `${SITE_URL}/menu`,
  servesCuisine: ["Italian Pizza", "Pastries", "Fatayer", "Calzone", "Burgers"],
  priceRange: "1,500 - 6,500 YER",
  currenciesAccepted: "YER",
  paymentAccepted: ["Cash", "Kuraimi Bank (Hassib)", "Al-Amqi", "Al-Busairi"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "وسط المدينة، عنوان تجريبي لأغراض العرض (Demo)",
    addressLocality: "المكلا (Al Mukalla)",
    addressRegion: "حضرموت (Hadhramaut)",
    postalCode: "Demo",
    addressCountry: "YE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 14.5425,
    longitude: 49.1242,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+967-5-000000",
      contactType: "customer service",
      areaServed: "YE",
      availableLanguage: ["Arabic", "English"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+967-776248526",
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

  potentialAction: {
    "@type": "OrderAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/menu`,
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
