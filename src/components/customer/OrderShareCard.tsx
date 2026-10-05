"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Share2,
  Copy,
  Check,
  QrCode,
  X,
  Send,
  Sparkles,
  ExternalLink,
  Users,
} from "lucide-react";

interface OrderShareCardProps {
  orderNumber: string;
  orderStatus: string;
  pickupTimeText?: string;
  trackingToken?: string | null;
  itemsCount?: number;
}

export default function OrderShareCard({
  orderNumber,
  orderStatus,
  pickupTimeText,
  trackingToken,
  itemsCount,
}: OrderShareCardProps) {
  const { language } = useApp();
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Generate the clean public tracking URL
  const getTrackingUrl = () => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin;
    const cleanNumber = orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`;
    return `${base}/track/${encodeURIComponent(cleanNumber)}`;
  };

  const getStatusLabel = () => {
    switch (orderStatus) {
      case "READY":
        return language === "ar" ? "جاهز للاستلام الآن! 🍕" : "Ready for Pickup! 🍕";
      case "PREPARING":
        return language === "ar" ? "في الفرن (جاري التحضير) 🔥" : "Baking in Oven 🔥";
      case "QUEUED":
        return language === "ar" ? "مجدول بانتظار الخبز ⏱️" : "Queued for Baking ⏱️";
      case "COMPLETED":
        return language === "ar" ? "تم الاستلام بنجاح ✅" : "Completed ✅";
      default:
        return language === "ar" ? "تم تأكيد الطلب 📋" : "Confirmed 📋";
    }
  };

  const getShareText = () => {
    const statusText = getStatusLabel();
    const timeText = pickupTimeText ? ` | موعد الاستلام: ${pickupTimeText}` : "";

    if (language === "ar") {
      return `🍕 تابع معي تجهيز طلبنا من بيتزا هاوس المكلا (${orderNumber})!
الحالة الحالية: ${statusText}${timeText}
رابط المتابعة المباشر:`;
    } else {
      return `🍕 Track our Pizza House Mukalla order (${orderNumber})!
Current Status: ${statusText}
Direct tracking link:`;
    }
  };

  const handleCopyLink = async () => {
    const url = getTrackingUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  // Primary share action: Try native Web Share API first on mobile, fallback to modal
  const handlePrimaryShare = async () => {
    const url = getTrackingUrl();
    const text = getShareText();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `بيتزا هاوس المكلا - تتبع الطلب ${orderNumber}`,
          text: text,
          url: url,
        });
        return;
      } catch (err: any) {
        // If user cancelled, don't open modal
        if (err.name === "AbortError") return;
      }
    }

    // Fallback: Open social channels modal
    setShowShareModal(true);
  };

  const url = getTrackingUrl();
  const text = getShareText();
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text} ${url}`);

  const shareChannels = [
    {
      id: "whatsapp",
      name: "واتساب (WhatsApp)",
      iconColor: "bg-emerald-500 text-white",
      href: `https://wa.me/?text=${encodedText}`,
    },
    {
      id: "telegram",
      name: "تيليجرام (Telegram)",
      iconColor: "bg-sky-500 text-white",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
    },
    {
      id: "twitter",
      name: "منصة X (Twitter)",
      iconColor: "bg-stone-900 text-white dark:bg-stone-700",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`,
    },
    {
      id: "facebook",
      name: "فيسبوك (Facebook)",
      iconColor: "bg-blue-600 text-white",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  // Simple clean SVG QR code using quick-chart/qr api
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedUrl}`;

  return (
    <>
      {/* Prominent Share Banner / Button on Tracking Page */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-pizza-50 dark:from-stone-850 dark:via-stone-850 dark:to-stone-850 p-4 sm:p-5 rounded-3xl border border-amber-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-start">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white font-cairo">
                {language === "ar"
                  ? "مشاركة رابط التتبع مع العائلة أو الأصدقاء"
                  : "Share Order Tracking with Family or Friends"}
              </h4>
              <Users className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {language === "ar"
                ? "يمكن لأصدقائك متابعة مراحل الخبز والاستلام في الفرن الحجري لحظة بلحظة."
                : "Allow friends to track stone-oven baking progress and pickup time live."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Main Share Button */}
          <button
            type="button"
            onClick={handlePrimaryShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-pizza-600 hover:from-amber-600 hover:to-pizza-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-pizza-600/20 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{language === "ar" ? "مشاركة الرابط 📲" : "Share Progress 📲"}</span>
          </button>

          {/* Quick Copy Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-stone-200 dark:border-stone-700 transition-colors"
            title={language === "ar" ? "نسخ الرابط المباشر" : "Copy Link"}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">
                  {language === "ar" ? "تم النسخ!" : "Copied!"}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span>{language === "ar" ? "نسخ" : "Copy"}</span>
              </>
            )}
          </button>

          {/* QR Code Trigger */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-2.5 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
            title={language === "ar" ? "رمز الاستجابة السريعة QR" : "Show QR Code"}
            aria-label="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Social Media Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white font-cairo">
                    {language === "ar" ? "مشاركة تتبع الطلب" : "Share Order Tracking"}
                  </h3>
                  <span className="text-[11px] text-stone-400 font-outfit">
                    {orderNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              {language === "ar"
                ? "اختر التطبيق لمشاركة رابط التتبع المباشر مع عائلتك أو أصدقائك:"
                : "Choose an app to share the live tracking link with family or friends:"}
            </p>

            {/* Channels List */}
            <div className="space-y-2">
              {shareChannels.map((channel) => (
                <a
                  key={channel.id}
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-750 border border-stone-200/80 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${channel.iconColor}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </span>
                    <span>{channel.name}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </a>
              ))}
            </div>

            {/* Link Preview and Copy Input */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block">
                {language === "ar" ? "أو انسخ الرابط المباشر:" : "Or copy direct link:"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 text-[11px] p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-mono truncate select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2.5 bg-pizza-600 hover:bg-pizza-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                >
                  {isCopied
                    ? language === "ar"
                      ? "تم!"
                      : "Copied!"
                    : language === "ar"
                    ? "نسخ"
                    : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for easy camera scan */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xs bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 text-center space-y-4">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 end-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-2">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white font-cairo">
                {language === "ar" ? "مسح رمز التتبع (QR Code)" : "Scan to Track (QR Code)"}
              </h3>
              <p className="text-xs text-stone-500 font-outfit">{orderNumber}</p>
            </div>

            {/* QR Image Container */}
            <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-inner inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt={`QR Code for ${orderNumber}`}
                className="w-44 h-44 object-contain mx-auto"
                loading="lazy"
              />
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              {language === "ar"
                ? "امسح الرمز بكاميرا الجوال لمتابعة حالة الطلب مباشرة دون الحاجة لنسخ الرابط."
                : "Scan with your phone camera to track this order instantly."}
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 transition-colors"
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
