"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useRecurringOrderReminder } from "@/hooks/useRecurringOrderReminder";
import {
  Bell,
  BellRing,
  Clock,
  Pizza,
  CheckCircle2,
  X,
  AlertCircle,
  Calendar,
  Send,
  HelpCircle,
} from "lucide-react";

interface RecurringReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTERVAL_OPTIONS = [
  { days: 7, labelAr: "كل أسبوع (7 أيام)", labelEn: "Every Week (7 days)" },
  { days: 14, labelAr: "كل أسبوعين (14 يوماً - الموصى به)", labelEn: "Every 2 Weeks (14 days - Recommended)", isRecommended: true },
  { days: 21, labelAr: "كل 3 أسابيع (21 يوماً)", labelEn: "Every 3 Weeks (21 days)" },
  { days: 30, labelAr: "كل شهر (30 يوماً)", labelEn: "Monthly (30 days)" },
];

const POPULAR_MEALS = [
  "بيتزا سوبر سوبريم 66",
  "بيتزا رانش دجاج إيطالية",
  "بيتزا بيبروني فاخرة",
  "فطيرة دجاج حار بالجبن",
  "بيتزا شاورما لحم خاصة",
  "بيتزا خضار مشكل إيطالية",
];

export default function RecurringReminderModal({
  isOpen,
  onClose,
}: RecurringReminderModalProps) {
  const { language } = useApp();
  const {
    preferences,
    permission,
    isSupported,
    eligibility,
    isSimulating,
    enableReminders,
    disableReminders,
    updateInterval,
    updateFavoriteMeal,
    testNotification,
  } = useRecurringOrderReminder();

  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = async () => {
    setTestResult(null);
    if (preferences.enabled) {
      disableReminders();
    } else {
      const granted = await enableReminders();
      if (!granted) {
        setTestResult(
          language === "ar"
            ? "يرجى السماح بالإشعارات من إعدادات المتصفح."
            : "Please allow notifications in browser permissions."
        );
      }
    }
  };

  const handleTestNotification = async () => {
    setTestResult(null);
    const sent = await testNotification();
    if (sent) {
      setTestResult(
        language === "ar"
          ? "تم إرسال إشعار المتصفح بنجاح! تفقد شريط التنبيهات لديك."
          : "Push notification sent! Check your device notifications."
      );
    } else {
      setTestResult(
        language === "ar"
          ? "لم يتم إرسال الإشعار. تأكد من منح الإذن للإشعارات في المتصفح."
          : "Notification could not be displayed. Ensure browser notifications are allowed."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#14181f] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] border border-[#222934] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-[#0c0e12] border-b border-[#222934] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-full bg-[#14181f] hover:bg-[#1a202c] border border-[#222934] text-stone-300 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] flex items-center justify-center text-[#2C1A04] shadow-md shadow-[#EFCC80]/20">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#EFCC80] font-cairo">
                {language === "ar" ? "تنبيهات دورية ذكية" : "Smart Recurring Reminders"}
              </span>
              <h2
                id="reminder-modal-title"
                className="text-lg sm:text-xl font-black font-cairo text-white"
              >
                {language === "ar"
                  ? "تنبيهات الوجبة المفضلة (أسبوعين)"
                  : "Favorite Meal Reminders (2 Weeks)"}
              </h2>
            </div>
          </div>

          <p className="text-xs text-stone-400 mt-2 leading-relaxed">
            {language === "ar"
              ? "نرسل لك إشعاراً لطيفاً عبر المتصفح إذا مر أسبوعان دون طلب، لتتذكر وجبتك المفضلة وتستمتع بها طازجة من الفرن الحجري!"
              : "Receive a browser push reminder when it has been 2 weeks since your last order, so you never miss your favorite stone-baked meal!"}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto font-cairo">
          {/* Main Activation Toggle */}
          <div className="p-4 rounded-2xl bg-[#0c0e12] border border-[#222934] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                {language === "ar" ? "تفعيل إشعارات المتصفح التذكيرية" : "Enable Browser Reminders"}
              </span>
              <span className="text-[11px] text-stone-400">
                {permission === "granted"
                  ? language === "ar"
                    ? "الإذن مفعّل في المتصفح ✅"
                    : "Browser permission granted ✅"
                  : permission === "denied"
                  ? language === "ar"
                    ? "الإشعارات محظورة في إعدادات المتصفح ❌"
                    : "Notifications blocked in browser ❌"
                  : language === "ar"
                  ? "يتطلب الموافقة على إذن المتصفح"
                  : "Requires browser permission prompt"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.enabled ? "bg-gradient-to-r from-[#EFCC80] to-[#C69843]" : "bg-[#222934]"
              }`}
              role="switch"
              aria-checked={preferences.enabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#2C1A04] shadow-lg ring-0 transition duration-200 ease-in-out ${
                  preferences.enabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0 bg-stone-400"
                }`}
              />
            </button>
          </div>

          {/* Interval Configuration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#EFCC80]" />
              <span>{language === "ar" ? "فترة التذكير عند الانقطاع عن الطلب:" : "Inactivity Reminder Period:"}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INTERVAL_OPTIONS.map((opt) => {
                const isSelected = preferences.intervalDays === opt.days;
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => updateInterval(opt.days)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-start flex items-center justify-between ${
                      isSelected
                        ? "bg-[#EFCC80]/10 border-[#EFCC80] text-[#EFCC80] shadow-sm"
                        : "bg-[#0c0e12] border-[#222934] text-stone-300 hover:border-stone-600"
                    }`}
                  >
                    <span>{language === "ar" ? opt.labelAr : opt.labelEn}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#EFCC80] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorite Meal Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Pizza className="w-4 h-4 text-[#EFCC80]" />
              <span>{language === "ar" ? "وجبتك المفضلة للتذكير:" : "Your Favorite Meal to Remind You With:"}</span>
            </label>

            <div className="space-y-1.5">
              <input
                type="text"
                value={preferences.favoriteMeal}
                onChange={(e) => updateFavoriteMeal(e.target.value)}
                placeholder="اسم البيتزا أو الفطيرة المفضلة..."
                className="w-full text-xs p-3 rounded-2xl bg-[#0c0e12] border border-[#222934] text-white focus:outline-none focus:border-[#EFCC80] font-bold placeholder:text-stone-600"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-stone-500 self-center">
                  {language === "ar" ? "مقترحات سريعة:" : "Quick picks:"}
                </span>
                {POPULAR_MEALS.slice(0, 3).map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => updateFavoriteMeal(meal)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#0c0e12] hover:bg-[#1a202c] text-stone-300 hover:text-[#EFCC80] transition-colors border border-[#222934]"
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status Tracker */}
          <div className="p-3.5 bg-[#0c0e12] rounded-2xl border border-[#222934] space-y-1 text-xs">
            <div className="flex justify-between items-center text-[#EFCC80] font-bold">
              <span>{language === "ar" ? "حالة الانقطاع عن الطلب:" : "Inactivity Status:"}</span>
              <span className="font-outfit text-white">
                {eligibility.daysSinceLastOrder} {language === "ar" ? "يوم مضى" : "days elapsed"}
              </span>
            </div>
            <div className="w-full bg-[#14181f] h-2 rounded-full overflow-hidden border border-[#222934]">
              <div
                className="bg-gradient-to-r from-[#EFCC80] to-[#C69843] h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (eligibility.daysSinceLastOrder / preferences.intervalDays) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-stone-400 pt-0.5">
              {language === "ar"
                ? `سيتم إرسال تنبيه بالمتصفح عند وصول العداد إلى ${preferences.intervalDays} يوماً.`
                : `A browser notification will trigger once elapsed days reach ${preferences.intervalDays}.`}
            </p>
          </div>

          {testResult && (
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#EFCC80]/40 text-[#EFCC80] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EFCC80] shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {/* Test Simulation Button */}
          <div className="pt-1">
            <button
              type="button"
              disabled={isSimulating}
              onClick={handleTestNotification}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 font-black py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md shadow-[#EFCC80]/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSimulating
                  ? language === "ar"
                    ? "جاري إرسال التنبيه التجريبي..."
                    : "Sending Test Notification..."
                  : language === "ar"
                  ? "اختبار إرسال إشعار المتصفح فوراً 🚀"
                  : "Send Test Browser Notification Now 🚀"}
              </span>
            </button>
            <p className="text-[11px] text-center text-stone-500 mt-1.5">
              {language === "ar"
                ? "انقر لتجربة شكل ونص الإشعار التذكيري على جهازك الآن."
                : "Click to preview the recurring reminder notification on your device immediately."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c0e12] border-t border-[#222934] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 text-xs font-black transition-all shadow-md shadow-[#EFCC80]/20 active:scale-95 font-cairo"
          >
            {language === "ar" ? "حفظ وإغلاق" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
