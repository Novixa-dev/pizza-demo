import type { Metadata, Viewport } from "next";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CartDrawer from "@/components/customer/CartDrawer";
import FloatingCartBar from "@/components/shared/FloatingCartBar";
import RealtimeOrderToaster from "@/components/shared/RealtimeOrderToaster";
import RecurringReminderBanner from "@/components/customer/RecurringReminderBanner";
import PwaInstallPrompt from "@/components/shared/PwaInstallPrompt";
import { siteMetadata, siteViewport, jsonLdRestaurantData } from "@/lib/seoConfig";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRestaurantData) }}
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
          <PwaInstallPrompt />
        </AppProvider>
      </body>
    </html>
  );
}
