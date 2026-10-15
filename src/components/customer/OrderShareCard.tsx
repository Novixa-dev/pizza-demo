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
        return language === "ar"
          ? "جاهز للاستلام الآن! 🍕"
          : language === "id"
          ? "Siap Diambil Sekarang! 🍕"
          : "Ready for Pickup! 🍕";
      case "PREPARING":
        return language === "ar"
          ? "في الفرن (جاري التحضير) 🔥"
          : language === "id"
          ? "Sedang Dipanggang di Oven 🔥"
          : "Baking in Oven 🔥";
      case "QUEUED":
        return language === "ar"
          ? "مجدول بانتظار الخبز ⏱️"
          : language === "id"
          ? "Dalam Antrean Pemanggangan ⏱️"
          : "Queued for Baking ⏱️";
      case "COMPLETED":
        return language === "ar"
          ? "تم الاستلام بنجاح ✅"
          : language === "id"
          ? "Pesanan Selesai Diterima ✅"
          : "Completed ✅";
      default:
        return language === "ar"
          ? "تم تأكيد الطلب 📋"
          : language === "id"
          ? "Pesanan Dikonfirmasi 📋"
          : "Confirmed 📋";
    }
  };

  const getShareText = () => {
    const statusText = getStatusLabel();
    const timeText = pickupTimeText
      ? language === "ar"
        ? ` | موعد الاستلام: ${pickupTimeText}`
        : language === "id"
        ? ` | Waktu Pengambilan: ${pickupTimeText}`
        : ` | Pickup Time: ${pickupTimeText}`
      : "";

    if (language === "ar") {
      return `🍕 تابع معي تجهيز طلبنا من بيتزا نوڤا (${orderNumber})!
الحالة الحالية: ${statusText}${timeText}
رابط المتابعة المباشر:`;
    } else if (language === "id") {
      return `🍕 Lacak bersama proses pesanan kami dari Pizza Nova (${orderNumber})!
Status Terkini: ${statusText}${timeText}
Tautan pelacakan langsung:`;
    } else {
      return `🍕 Track our Pizza Nova order (${orderNumber})!
Current Status: ${statusText}${timeText}
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
          title: `بيتزا نوڤا - تتبع الطلب ${orderNumber}`,
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
      <div className="bg-[#14181f]/95 p-4 sm:p-5 rounded-3xl border border-[#222934] hover:border-[#EFCC80]/40 shadow-[0_12px_32px_rgba(0,0,0,0.85)] flex flex-col sm:flex-row items-center justify-between gap-4 font-cairo">
        <div className="flex items-center gap-3.5 text-center sm:text-start">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shrink-0 shadow-md shadow-[#EFCC80]/20">
            <Share2 className="w-5 h-5 text-[#2C1A04]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <h4 className="text-xs sm:text-sm font-black text-white font-cairo">
                {language === "ar"
                  ? "مشاركة رابط التتبع مع العائلة أو الأصدقاء"
                  : language === "id"
                  ? "Bagikan Tautan Pelacakan dengan Teman atau Keluarga"
                  : "Share Order Tracking with Family or Friends"}
              </h4>
              <Users className="w-3.5 h-3.5 text-[#EFCC80]" />
            </div>
            <p className="text-[11px] text-stone-400">
              {language === "ar"
                ? "يمكن لأصدقائك متابعة مراحل الخبز والاستلام في الفرن الحجري لحظة بلحظة."
                : language === "id"
                ? "Teman atau keluarga Anda dapat memantau tahapan pemanggangan dan pengambilan di oven batu secara langsung."
                : "Allow friends to track stone-oven baking progress and pickup time live."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Main Share Button */}
          <button
            type="button"
            onClick={handlePrimaryShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 font-black px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-[#EFCC80]/20 active:scale-95 transition-all font-cairo"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {language === "ar"
                ? "مشاركة الرابط 📲"
                : language === "id"
                ? "Bagikan Tautan 📲"
                : "Share Progress 📲"}
            </span>
          </button>

          {/* Quick Copy Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 bg-[#0c0e12] hover:bg-[#1a202c] text-stone-300 hover:text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-[#222934] transition-colors"
            title={
              language === "ar"
                ? "نسخ الرابط المباشر"
                : language === "id"
                ? "Salin Tautan Langsung"
                : "Copy Link"
            }
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">
                  {language === "ar" ? "تم النسخ!" : language === "id" ? "Tersalin!" : "Copied!"}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-400" />
                <span>
                  {language === "ar" ? "نسخ" : language === "id" ? "Salin" : "Copy"}
                </span>
              </>
            )}
          </button>

          {/* QR Code Trigger */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-2.5 rounded-2xl bg-[#0c0e12] hover:bg-[#1a202c] text-stone-300 hover:text-[#EFCC80] border border-[#222934] transition-colors"
            title={
              language === "ar"
                ? "رمز الاستجابة السريعة QR"
                : language === "id"
                ? "Tampilkan Kode QR"
                : "Show QR Code"
            }
            aria-label="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Social Media Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm bg-[#14181f] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] border border-[#222934] overflow-hidden p-6 space-y-5 font-cairo">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shadow-md shadow-[#EFCC80]/20">
                  <Share2 className="w-5 h-5 text-[#2C1A04]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-cairo">
                    {language === "ar"
                      ? "مشاركة تتبع الطلب"
                      : language === "id"
                      ? "Bagikan Pelacakan Pesanan"
                      : "Share Order Tracking"}
                  </h3>
                  <span className="text-[11px] text-[#EFCC80] font-outfit">
                    {orderNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-[#1a202c] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              {language === "ar"
                ? "اختر التطبيق لمشاركة رابط التتبع المباشر مع عائلتك أو أصدقائك:"
                : language === "id"
                ? "Pilih aplikasi untuk membagikan tautan pelacakan langsung dengan keluarga atau teman:"
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
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#0c0e12] hover:bg-[#1a202c] border border-[#222934] hover:border-[#EFCC80]/30 text-xs font-bold text-stone-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${channel.iconColor}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </span>
                    <span>{channel.name}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                </a>
              ))}
            </div>

            {/* Link Preview and Copy Input */}
            <div className="pt-2 border-t border-[#222934] space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400 block">
                {language === "ar"
                  ? "أو انسخ الرابط المباشر:"
                  : language === "id"
                  ? "Atau salin tautan langsung:"
                  : "Or copy direct link:"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 text-[11px] p-2.5 rounded-xl bg-[#0c0e12] border border-[#222934] text-stone-300 font-mono truncate select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2.5 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 rounded-xl text-xs font-black shrink-0 transition-all shadow-md shadow-[#EFCC80]/20 font-cairo"
                >
                  {isCopied
                    ? language === "ar"
                      ? "تم!"
                      : language === "id"
                      ? "Tersalin!"
                      : "Copied!"
                    : language === "ar"
                    ? "نسخ"
                    : language === "id"
                    ? "Salin"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xs bg-[#14181f] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] border border-[#222934] p-6 text-center space-y-4 font-cairo">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 end-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-[#1a202c] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-2">
              <h3 className="text-sm font-black text-white font-cairo">
                {language === "ar"
                  ? "مسح رمز التتبع (QR Code)"
                  : language === "id"
                  ? "Pindai Kode QR Pelacakan"
                  : "Scan to Track (QR Code)"}
              </h3>
              <p className="text-xs text-[#EFCC80] font-outfit">{orderNumber}</p>
            </div>

            {/* QR Image Container */}
            <div className="p-3 bg-white rounded-2xl border border-white/20 shadow-inner inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt={`QR Code for ${orderNumber}`}
                className="w-44 h-44 object-contain mx-auto"
                loading="lazy"
              />
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              {language === "ar"
                ? "امسح الرمز بكاميرا الجوال لمتابعة حالة الطلب مباشرة دون الحاجة لنسخ الرابط."
                : language === "id"
                ? "Pindai kode QR dengan kamera ponsel untuk langsung melacak pesanan tanpa perlu menyalin tautan."
                : "Scan with your phone camera to track this order instantly."}
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 text-xs font-black transition-all shadow-md shadow-[#EFCC80]/20 font-cairo"
            >
              {language === "ar" ? "إغلاق" : language === "id" ? "Tutup" : "Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
