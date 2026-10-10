"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Pizza, ArrowLeft, ArrowRight } from "lucide-react";

export default function TrackSearchClientView() {
  const { language, dict } = useApp();
  const [orderQuery, setOrderQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderQuery.trim().replace(/^#/, "");
    if (!clean) return;
    window.location.href = `/track/${clean}`;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6 font-cairo">
      <div className="bg-[#14181f]/90 backdrop-blur-xl border border-[#C69843]/30 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
          <Pizza className="w-8 h-8 fill-current" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white font-cairo">
            {dict.tracking.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            {language === "ar"
              ? "أدخل رقم الطلب لمعرفة مرحلة الخبز والتجهيز الحالية في الفرع الحجري"
              : "Enter your order number to track stone oven baking in real-time"}
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <input
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="مثلاً: PH-1024 أو رقم الطلب"
            className="w-full text-center text-sm p-4 rounded-2xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#C69843] focus:ring-2 focus:ring-[#C69843]/30 font-outfit transition-all shadow-inner"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(198,152,67,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <span>{language === "ar" ? "تتبع حالة الطلب الآن" : "Track Order Now"}</span>
            {language === "ar" ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Alternative Phone Lookup */}
        <div className="pt-4 border-t border-white/10 text-xs space-y-2">
          <p className="text-stone-400">
            {language === "ar"
              ? "هل تبحث عن جميع طلباتك السابقة أو نسيت رقم الطلب؟"
              : "Looking for all your past orders or forgot your order #?"}
          </p>
          <a
            href="/history"
            className="inline-flex items-center gap-1.5 font-bold text-[#EFCC80] hover:text-white transition-colors"
          >
            <span>
              {language === "ar"
                ? "استعراض سجل الطلبات برقم الهاتف"
                : "View Order History by Phone"}
            </span>
            {language === "ar" ? (
              <ArrowLeft className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
