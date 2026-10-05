"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Flame, Clock, Sparkles, CheckCircle2, Pizza, ChefHat } from "lucide-react";

interface StoneOvenLiveViewProps {
  orderStatus: string;
  orderNumber: string;
  pickupTimeText?: string;
}

export default function StoneOvenLiveView({
  orderStatus,
  orderNumber,
  pickupTimeText,
}: StoneOvenLiveViewProps) {
  const { language } = useApp();
  const [bakingProgress, setBakingProgress] = useState(65);
  const [ovenTemp, setOvenTemp] = useState(360);

  // Slight realistic dynamic fluctuations in oven temperature
  useEffect(() => {
    const interval = setInterval(() => {
      setOvenTemp(355 + Math.floor(Math.random() * 12));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isBaking = orderStatus === "PREPARING";
  const isReady = orderStatus === "READY";

  if (!isBaking && !isReady) return null;

  return (
    <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl p-5 sm:p-6 border border-amber-500/30 shadow-xl overflow-hidden relative">
      {/* Background Oven Ambient Glow */}
      <div className="absolute top-0 end-0 w-48 h-48 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header: Oven Status & Internal Temp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Flame className="w-5 h-5 animate-pulse text-orange-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 font-outfit block">
                {language === "ar" ? "فرن الحجر الإيطالي المباشر" : "Live Traditional Stone Oven"}
              </span>
              <h4 className="text-sm font-black font-cairo text-white flex items-center gap-1.5">
                <span>
                  {isReady
                    ? language === "ar"
                      ? "خرجت البيتزا ساخنة من الفرن! 🍕"
                      : "Pizza Baked to Perfection! 🍕"
                    : language === "ar"
                    ? "طلبك في الفرن الحجري الآن 🔥"
                    : "Your Order is in the Stone Oven 🔥"}
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span className="text-stone-300 font-outfit">{ovenTemp}°C</span>
              <span className="text-[10px] text-stone-500">{language === "ar" ? "حرارة الفرن" : "Oven Temp"}</span>
            </div>
          </div>
        </div>

        {/* Visual Oven Chamber Representation */}
        <div className="bg-stone-950/70 rounded-2xl p-4 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center relative overflow-hidden">
              <Pizza className={`w-8 h-8 text-amber-400 ${isBaking ? "animate-bounce" : ""}`} />
              {isBaking && (
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent pointer-events-none" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-cairo">
                  {isReady
                    ? language === "ar"
                      ? "مستوى النضج: 100% مقرمشة وموزاريللا ذائبة"
                      : "Bake Level: 100% Melted Mozzarella & Crispy Crust"
                    : language === "ar"
                    ? "مستوى النضج: جاري تحمير الأطراف وإذابة الجبن"
                      : "Bake Level: Melting Cheese & Stone Crust"}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-stone-400">
                {language === "ar"
                  ? "تُخبز عجينة بيتزا هاوس المخمرة طبيعياً على أرضية حجرية لتمنحك النكهة المقرمشة والطرية."
                  : "Baked directly on volcanic stone floor for our signature artisan crunch and airy crumb."}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 space-y-1.5 shrink-0">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-stone-400">{language === "ar" ? "تقدم الخبز:" : "Bake Progress:"}</span>
              <span className="text-orange-400 font-outfit">{isReady ? "100%" : `${bakingProgress}%`}</span>
            </div>
            <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isReady
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 animate-pulse"
                }`}
                style={{ width: isReady ? "100%" : `${bakingProgress}%` }}
              />
            </div>
            {pickupTimeText && (
              <span className="text-[10px] text-stone-400 block text-end">
                {language === "ar" ? `الاستلام: ${pickupTimeText}` : `Pickup: ${pickupTimeText}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
