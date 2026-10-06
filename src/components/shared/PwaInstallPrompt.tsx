"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { Download, X, Sparkles, CheckCircle2 } from "lucide-react";

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
      <div className="bg-stone-900/95 dark:bg-stone-850/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-pizza-600/40 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md border border-amber-500/30">
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
              <span className="text-xs font-bold font-cairo">
                {language === "ar" ? "تطبيق بيتزا هاوس" : "Pizza House App"}
              </span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-[11px] text-stone-300">
              {language === "ar"
                ? "ثبّت التطبيق للطلب السريع والتنبيهات المباشرة"
                : "Install for 1-tap ordering & fast pickup"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1 bg-pizza-600 hover:bg-pizza-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === "ar" ? "تثبيت" : "Install"}</span>
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
