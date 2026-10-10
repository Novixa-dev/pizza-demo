"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const { language } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed PWA)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (isInstalled || isDismissed) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS Safari or browsers without beforeinstallprompt
      alert(
        language === "ar"
          ? "لتثبيت التطبيق على جهازك: اضغط على زر المشاركة في متصفحك ثم اختر 'إضافة إلى الشاشة الرئيسية' 📲"
          : language === "id"
          ? "Untuk menginstal aplikasi: Ketuk tombol Bagikan di browser Anda lalu pilih 'Tambahkan ke Layar Utama' 📲"
          : "To install: Tap the Share button in your browser and select 'Add to Home Screen' 📲"
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-20 start-4 end-4 sm:start-auto sm:end-6 sm:max-w-sm z-30 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#14181f]/95 backdrop-blur-xl text-white p-3.5 rounded-2xl border border-[#EFCC80]/30 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md border border-[#EFCC80]/40 bg-[#0c0e12]">
            <Image
              src="/icon-192.png"
              alt="Pizza House App Icon"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-cairo text-white">
                {language === "ar" ? "تطبيق بيتزا هاوس" : language === "id" ? "Aplikasi Pizza House" : "Pizza House App"}
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              {language === "ar"
                ? "ثبّت التطبيق للطلب السريع والتنبيهات المباشرة"
                : language === "id"
                ? "Instal aplikasi untuk pemesanan cepat & notifikasi langsung"
                : "Install for 1-tap ordering & fast pickup"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md shadow-amber-950/40 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === "ar" ? "تثبيت" : language === "id" ? "Instal" : "Install"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-stone-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
