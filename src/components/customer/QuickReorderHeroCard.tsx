"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getReminderPreferences } from "@/lib/notifications/orderReminderService";
import { Pizza, Sparkles, ArrowLeft, ArrowRight, Clock, RotateCcw } from "lucide-react";

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
          optionId: "large",
          optionNameAr: "كبير (عائلي 14 بوصة)",
          optionNameEn: "Large (14 inch)",
          priceDelta: 0,
        },
      ],
      notes: "إعادة طلب سريع - طازجة من الفرن الحجري",
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-pizza-500/10 to-amber-500/10 border border-amber-300/60 dark:border-amber-700/50 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3.5 text-center sm:text-start">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
          <Pizza className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-outfit">
              {customerName
                ? language === "ar"
                  ? `مرحباً بعودتك ${customerName}!`
                  : `Welcome back ${customerName}!`
                : language === "ar"
                ? "إعادة طلب سريعة"
                : "Quick Reorder"}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white font-cairo">
            {language === "ar" ? "وجبتك المفضلة:" : "Your Favorite Meal:"}{" "}
            <span className="text-pizza-700 dark:text-pizza-400">{favoriteMeal}</span>
          </h3>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 justify-center sm:justify-start pt-0.5">
            <Clock className="w-3 h-3 text-pizza-600" />
            <span>
              {lastOrderDays !== null
                ? language === "ar"
                  ? `آخر طلب لك كان قبل ${lastOrderDays} يوماً · مخبوزة على الحجر بدون انتظار`
                  : `Last ordered ${lastOrderDays} days ago · Stone baked with zero wait`
                : language === "ar"
                ? "الأكثر طلباً وتقييماً في فرع فوه المساكن"
                : "Best-seller in Fuwah Al-Masaken"}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
        <Link
          href="/menu"
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-pizza-600 hover:bg-pizza-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-pizza-600/20 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>
            {language === "ar"
              ? "اطلب وجبتك المفضلة طازجة 🍕"
              : "Reorder in 1-Click 🍕"}
          </span>
        </Link>

        <Link
          href="/menu"
          className="inline-flex items-center justify-center gap-1 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <span>{language === "ar" ? "القائمة" : "Menu"}</span>
          {language === "ar" ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
        </Link>
      </div>
    </div>
  );
}
