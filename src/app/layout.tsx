import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CartDrawer from "@/components/customer/CartDrawer";
import FloatingCartBar from "@/components/shared/FloatingCartBar";
import RealtimeOrderToaster from "@/components/shared/RealtimeOrderToaster";
import RecurringReminderBanner from "@/components/customer/RecurringReminderBanner";
import PwaInstallPrompt from "@/components/shared/PwaInstallPrompt";
import DemoBanner from "@/components/shared/DemoBanner";
import { siteMetadata, siteViewport, jsonLdRestaurantData } from "@/lib/seoConfig";

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRestaurantData) }}
        />
      </head>
      <body className="font-cairo antialiased min-h-screen flex flex-col selection:bg-pizza-500 selection:text-white">
        <AppProvider>
          <DemoBanner />
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
