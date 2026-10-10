import React, { Suspense } from "react";
import { Metadata } from "next";
import { getActiveCouponsAction, getAutomaticGiftsAction } from "@/app/actions/couponActions";
import OffersClientView from "./OffersClientView";

export const metadata: Metadata = {
  title: "العروض والكوبونات الحصرية | بيتزا هاوس المكلا",
  description: "اكتشف أحدث كوبونات الخصم، الهدايا المجانية التلقائية، وبرنامج مكافآت الزبون الوفي في مطعم بيتزا هاوس فوه المكلا. خصومات تصل إلى 10% وهدايا مع كل طلب كبير.",
  keywords: [
    "عروض بيتزا هاوس",
    "كوبونات بيتزا المكلا",
    "خصم بيتزا هاوس فوه",
    "هدايا مجانية بيتزا",
    "Pizza House Mukalla Offers",
    "Promo Pizza House Hadramout",
  ],
  openGraph: {
    title: "عروض وكوبونات بيتزا هاوس المكلا | تخفيضات وهدايا مجانية",
    description: "استمتع بأقوى العروض: كوبون ترحيبي 10%، هدايا تلقائية عند الوصول لمبلغ 12,000 ر.ي، ومكافأة كل 5 طلبات!",
    type: "website",
    locale: "ar_YE",
  },
};

export const revalidate = 60; // Revalidate every minute

export default async function OffersPage() {
  const [couponsRes, giftsRes] = await Promise.all([
    getActiveCouponsAction(),
    getAutomaticGiftsAction(),
  ]);

  const coupons = couponsRes.success ? (couponsRes.coupons as any) : [];
  const gifts = giftsRes.success ? (giftsRes.gifts as any) : [];

  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 py-24 text-center">
          <div className="w-10 h-10 border-2 border-[#EFCC80] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-400 text-sm font-cairo">جاري تحميل أحدث العروض والكوبونات...</p>
        </div>
      }
    >
      <OffersClientView initialCoupons={coupons} initialGifts={gifts} />
    </Suspense>
  );
}
