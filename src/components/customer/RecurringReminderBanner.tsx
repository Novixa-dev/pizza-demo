"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useRecurringOrderReminder } from "@/hooks/useRecurringOrderReminder";
import { Bell, Pizza, ArrowLeft, ArrowRight, X, Clock, Sparkles } from "lucide-react";
import RecurringReminderModal from "./RecurringReminderModal";

export default function RecurringReminderBanner() {
  const { language } = useApp();
  const { preferences, eligibility, showInAppReminder, setShowInAppReminder } =
    useRecurringOrderReminder();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show if either explicitly triggered or customer elapsed days >= intervalDays
  const shouldShow =
    !isDismissed &&
    (showInAppReminder || (preferences.enabled && eligibility.isDue));

  if (!shouldShow) {
    return (
      <RecurringReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    );
  }

  const mealName = preferences.favoriteMeal || "وجبتك المفضلة";

  return (
    <>
      <div className="fixed bottom-4 start-4 end-4 sm:start-auto sm:end-6 sm:max-w-md z-40 animate-in slide-in-from-bottom duration-300">
        <div className="bg-[#14181f]/95 backdrop-blur-xl text-white p-4 rounded-3xl border border-[#EFCC80]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
          <div className="absolute top-0 end-0 transform translate-x-6 -translate-y-6 w-24 h-24 bg-[#EFCC80]/10 rounded-full blur-xl pointer-events-none" />

          <button
            onClick={() => {
              setIsDismissed(true);
              setShowInAppReminder(false);
            }}
            className="absolute top-3 end-3 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-[#1a202c] transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shrink-0 shadow-md shadow-[#EFCC80]/20">
              <Pizza className="w-5 h-5 text-[#2C1A04]" />
            </div>

            <div className="space-y-1 pe-5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#EFCC80] font-cairo">
                  {language === "ar" ? "اشتقنا لك في بيتزا هاوس!" : "We Miss You at Pizza House!"}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#EFCC80]" />
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {language === "ar"
                  ? `مرّ ${eligibility.daysSinceLastOrder || preferences.intervalDays} يوماً على آخر طلب. هل حان وقت الاستمتاع بـ (${mealName}) ساخنة من الفرن؟`
                  : `It's been ${eligibility.daysSinceLastOrder || preferences.intervalDays} days since your last order. Ready for (${mealName})?`}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 font-black px-4 py-2 rounded-xl text-xs shadow-md shadow-[#EFCC80]/20 transition-all active:scale-95 font-cairo"
                >
                  <span>{language === "ar" ? "اطلبها الآن" : "Order Now"}</span>
                  {language === "ar" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-stone-400 hover:text-[#EFCC80] px-2 py-1.5 transition-colors underline"
                >
                  {language === "ar" ? "ضبط التنبيهات" : "Settings"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecurringReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
