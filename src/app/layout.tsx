import type { Metadata } from "next";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CartDrawer from "@/components/customer/CartDrawer";
import FloatingCartBar from "@/components/shared/FloatingCartBar";
import RealtimeOrderToaster from "@/components/shared/RealtimeOrderToaster";
import RecurringReminderBanner from "@/components/customer/RecurringReminderBanner";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "بيتزا هاوس المكلا | Pizza House Mukalla - اطلب واستلم مسبقاً",
  description:
    "مطعم بيتزا هاوس في فوه، حي المساكن، المكلا. اطلب مسبقاً وحدد موعد استلامك واستلم أشهى بيتزا إيطالية وفطائر طازجة بدون انتظار.",
  keywords: [
    "بيتزا هاوس",
    "بيتزا المكلا",
    "مطعم بيتزا فوه",
    "Pizza House Mukalla",
    "فطائر المكلا",
    "طلب بيتزا مسبق حضرموت",
    "معجنات فوه",
  ],
  authors: [{ name: "Pizza House Mukalla" }],
  metadataBase: new URL("https://pizzahouse.ye"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "بيتزا هاوس المكلا | Pizza House Mukalla",
    description: "اطلب مسبقاً وتجنب الانتظار - طعم البيتزا الإيطالية الحقيقي والمخبوزات الطازجة في المكلا، فوه حي المساكن.",
    url: "https://pizzahouse.ye",
    siteName: "بيتزا هاوس المكلا",
    locale: "ar_YE",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "بيتزا هاوس المكلا - بيتزا طازجة مخبوزة على الحجر",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "بيتزا هاوس المكلا | Pizza House Mukalla",
    description: "اطلب مسبقاً وتجنب الانتظار - طعم البيتزا الإيطالية الحقيقي والمخبوزات الطازجة في المكلا.",
    images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdRestaurant = {
    "@context": "https://schema.org",
    "@type": "FastFoodRestaurant",
    name: "Pizza House Mukalla (بيتزا هاوس)",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
    telephone: "+967-5-375561",
    servesCuisine: ["Pizza", "Italian", "Pastries", "Fatayer"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Fuwa, Al-Masaken District, near Al-Ahgaff University and Al-Noor Clinic",
      addressLocality: "Mukalla",
      addressRegion: "Hadhramaut",
      addressCountry: "YE",
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
    priceRange: "$$",
    paymentAccepted: ["Cash", "Kuraimi Bank", "Al-Amqi", "Al-Busairi"],
  };

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRestaurant) }}
        />
      </head>
      <body className="font-cairo antialiased min-h-screen flex flex-col selection:bg-pizza-500 selection:text-white">
        <AppProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <FloatingCartBar />
          <RealtimeOrderToaster />
          <RecurringReminderBanner />
        </AppProvider>
      </body>
    </html>
  );
}
