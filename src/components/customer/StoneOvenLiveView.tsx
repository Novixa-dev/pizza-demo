"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Flame, Clock, CheckCircle2, Pizza, ChefHat } from "lucide-react";

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
    <div className="bg-[#14181f]/95 text-white rounded-3xl p-5 sm:p-6 border border-[#EFCC80]/40 shadow-[0_12px_32px_rgba(0,0,0,0.85)] overflow-hidden relative font-cairo">
      {/* Background Oven Ambient Glow */}
      <div className="absolute top-0 end-0 w-48 h-48 bg-[#EFCC80]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-48 h-48 bg-[#C69843]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header: Oven Status & Internal Temp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222934] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFCC80]/15 text-[#EFCC80] flex items-center justify-center border border-[#EFCC80]/30 shadow-md">
              <Flame className="w-5 h-5 animate-pulse text-[#EFCC80]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#EFCC80] font-cairo block">
                {language === "ar"
                  ? "فرن الحجر الطبيعي المباشر"
                  : language === "id"
                  ? "Oven Batu Tradisional Langsung"
                  : "Live Traditional Stone Oven"}
              </span>
              <h4 className="text-sm font-black font-cairo text-white flex items-center gap-1.5">
                <span>
                  {isReady
                    ? language === "ar"
                      ? "خرجت البيتزا ساخنة من الفرن! 🍕"
                      : language === "id"
                      ? "Pizza Baru Matang Segar dari Oven! 🍕"
                      : "Pizza Baked to Perfection! 🍕"
                    : language === "ar"
                    ? "طلبك في الفرن الحجري الآن 🔥"
                    : language === "id"
                    ? "Pesanan Anda Sedang Dipanggang di Oven Batu 🔥"
                    : "Your Order is in the Stone Oven 🔥"}
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-[#0c0e12] px-3 py-1.5 rounded-xl border border-[#222934] text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EFCC80] animate-ping" />
              <span className="text-white font-outfit font-black">{ovenTemp}°C</span>
              <span className="text-[10px] text-stone-400">
                {language === "ar" ? "حرارة الفرن" : language === "id" ? "Suhu Oven" : "Oven Temp"}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Oven Chamber Representation */}
        <div className="bg-[#0c0e12] rounded-2xl p-4 border border-[#222934] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#14181f] border border-[#222934] flex items-center justify-center relative overflow-hidden">
              <Pizza className={`w-8 h-8 text-[#EFCC80] ${isBaking ? "animate-bounce" : ""}`} />
              {isBaking && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#EFCC80]/20 to-transparent pointer-events-none" />
              )}
            </div>

            <div className="space-y-1">
              <div>
                <span className="text-xs font-black text-white font-cairo">
                  {isReady
                    ? language === "ar"
                      ? "مستوى النضج: 100% مقرمشة وموزاريللا ذائبة"
                      : language === "id"
                      ? "Kematangan: 100% Mozzarella Meleleh & Pinggiran Renyah"
                      : "Bake Level: 100% Melted Mozzarella & Crispy Crust"
                    : language === "ar"
                    ? "مستوى النضج: جاري تحمير الأطراف وإذابة الجبن"
                    : language === "id"
                    ? "Kematangan: Proses Melelehkan Keju & Memanggang Pinggiran"
                    : "Bake Level: Melting Cheese & Stone Crust"}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {language === "ar"
                  ? "تُخبز عجينة بيتزا هاوس المخمرة طبيعياً على أرضية حجرية لتمنحك النكهة المقرمشة والطرية."
                  : language === "id"
                  ? "Adonan fermentasi alami Pizza House dipanggang langsung di atas batu untuk kerenyahan khas dan tekstur lembut."
                  : "Baked directly on volcanic stone floor for our signature artisan crunch and airy crumb."}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 space-y-1.5 shrink-0">
            <div className="flex justify-between text-[11px] font-black">
              <span className="text-stone-400">
                {language === "ar" ? "تقدم الخبز:" : language === "id" ? "Progres Pemanggangan:" : "Bake Progress:"}
              </span>
              <span className="text-[#EFCC80] font-outfit">{isReady ? "100%" : `${bakingProgress}%`}</span>
            </div>
            <div className="w-full bg-[#14181f] h-2.5 rounded-full overflow-hidden border border-[#222934]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isReady
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-[#EFCC80] via-[#C69843] to-[#EFCC80] animate-pulse"
                }`}
                style={{ width: isReady ? "100%" : `${bakingProgress}%` }}
              />
            </div>
            {pickupTimeText && (
              <span className="text-[10px] text-stone-400 block text-end font-bold">
                {language === "ar"
                  ? `الاستلام: ${pickupTimeText}`
                  : language === "id"
                  ? `Pengambilan: ${pickupTimeText}`
                  : `Pickup: ${pickupTimeText}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
