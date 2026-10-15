"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getReminderPreferences } from "@/lib/notifications/orderReminderService";
import { Pizza, ArrowLeft, ArrowRight, Clock, RotateCcw } from "lucide-react";

export default function QuickReorderHeroCard() {
  const { language, addToCart, setIsCartOpen } = useApp();
  const [favoriteMeal, setFavoriteMeal] = useState<string | null>(null);
  const [lastOrderDays, setLastOrderDays] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefs = getReminderPreferences();
    const storedName = localStorage.getItem("ph_customer_name");

    if (prefs.favoriteMeal) {
      setFavoriteMeal(prefs.favoriteMeal);
    } else {
      setFavoriteMeal("بيتزا سوبر سوبريم 66");
    }

    if (storedName) {
      setCustomerName(storedName);
    }

    if (prefs.lastOrderDate) {
      const diffDays = Math.floor((Date.now() - prefs.lastOrderDate) / (1000 * 60 * 60 * 24));
      setLastOrderDays(Math.max(0, diffDays));
    }
  }, []);

  if (!favoriteMeal) return null;

  const handleInstantReorder = () => {
    // Quick reorder sample meal payload
    addToCart({
      productId: "prod-supreme-1",
      nameAr: favoriteMeal,
      nameEn: favoriteMeal.includes("66") ? "Super Supreme 66" : "Customer Favorite Pizza",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
      basePrice: 4500,
      unitPrice: 4500,
      quantity: 1,
      selectedOptions: [
        {
          groupId: "size",
          groupNameAr: "الحجم",
          groupNameEn: "Size",
          groupNameId: "Ukuran",
          optionId: "large",
          optionNameAr: "كبير (عائلي 14 بوصة)",
          optionNameEn: "Large (14 inch)",
          optionNameId: "Besar (Keluarga 14 inci)",
          priceDelta: 0,
        },
      ],
      notes: language === "ar" ? "إعادة طلب سريع - طازجة من الفرن الحجري" : language === "id" ? "Pesan ulang cepat - segar dari oven batu" : "Quick reorder - fresh from stone oven",
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <div className="bg-[#14181f]/90 backdrop-blur-xl border border-[#222934] hover:border-[#EFCC80]/40 rounded-3xl p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.85)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3.5 text-center sm:text-start">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shrink-0 shadow-md shadow-[#EFCC80]/20">
          <Pizza className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center justify-center sm:justify-start">
            <span className="text-xs font-bold text-[#EFCC80] font-cairo">
              {customerName
                ? language === "ar"
                  ? `مرحباً بعودتك ${customerName}!`
                  : language === "id"
                  ? `Selamat datang kembali, ${customerName}!`
                  : `Welcome back ${customerName}!`
                : language === "ar"
                ? "إعادة طلب سريعة"
                : language === "id"
                ? "Pesan Ulang Cepat"
                : "Quick Reorder"}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white font-cairo">
            {language === "ar" ? "وجبتك المفضلة:" : language === "id" ? "Menu Favorit Anda:" : "Your Favorite Meal:"}{" "}
            <span className="text-[#EFCC80]">{favoriteMeal}</span>
          </h3>

          <p className="text-[11px] text-stone-400 flex items-center gap-1 justify-center sm:justify-start pt-0.5">
            <Clock className="w-3 h-3 text-[#C69843]" />
            <span>
              {lastOrderDays !== null
                ? language === "ar"
                  ? `آخر طلب لك كان قبل ${lastOrderDays} يوماً · مخبوزة على الحجر بدون انتظار`
                  : language === "id"
                  ? `Pesanan terakhir Anda ${lastOrderDays} hari lalu · Dipanggang batu oven tanpa menunggu`
                  : `Last ordered ${lastOrderDays} days ago · Stone baked with zero wait`
                : language === "ar"
                ? "الأكثر طلباً وتقييماً في فرع وسط المدينة"
                : language === "id"
                ? "Terlaris dan terfavorit di cabang City Center"
                : "Best-seller in City Center"}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
        <button
          type="button"
          onClick={handleInstantReorder}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 font-black px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-[#EFCC80]/20 active:scale-95 transition-all font-cairo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>
            {language === "ar"
              ? "اطلب وجبتك المفضلة طازجة 🍕"
              : language === "id"
              ? "Pesan Menu Favorit Segar 🍕"
              : "Reorder in 1-Click 🍕"}
          </span>
        </button>

        <Link
          href="/menu"
          className="inline-flex items-center justify-center gap-1 text-xs font-bold text-stone-300 hover:text-white px-3.5 py-2.5 rounded-2xl border border-[#222934] bg-[#0c0e12] hover:border-[#EFCC80]/30 transition-colors"
        >
          <span>{language === "ar" ? "القائمة" : language === "id" ? "Menu" : "Menu"}</span>
          {language === "ar" ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
        </Link>
      </div>
    </div>
  );
}
