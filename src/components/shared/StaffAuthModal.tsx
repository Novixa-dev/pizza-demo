"use client";

import React, { useState } from "react";
import { loginStaffAction } from "@/app/actions/orderActions";
import { StaffRole } from "@/lib/auth";
import { ShieldCheck, Lock, ArrowLeft, ArrowRight, AlertCircle, KeyRound } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface StaffAuthModalProps {
  requiredRole: StaffRole;
  titleAr: string;
  titleEn: string;
  titleId?: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionId?: string;
  onSuccess?: () => void;
}

export default function StaffAuthModal({
  requiredRole,
  titleAr,
  titleEn,
  titleId,
  descriptionAr,
  descriptionEn,
  descriptionId,
  onSuccess,
}: StaffAuthModalProps) {
  const { language } = useApp();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pin.trim()) {
      setError(
        language === "ar"
          ? "يرجى إدخال الرمز السري."
          : language === "id"
          ? "Silakan masukkan kode PIN."
          : "Please enter PIN."
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginStaffAction(pin.trim(), requiredRole);
      if (res.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else {
        setError(
          res.error ||
            (language === "ar"
              ? "رمز الدخول غير صحيح."
              : language === "id"
              ? "Kode PIN salah."
              : "Invalid PIN code.")
        );
      }
    } catch {
      setError(
        language === "ar"
          ? "حدث خطأ أثناء الاتصال بالخادم."
          : language === "id"
          ? "Terjadi kesalahan koneksi server."
          : "Connection error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#14181f] border border-[#C69843]/40 rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-6 text-center font-cairo">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center mx-auto shadow-lg shadow-[#EFCC80]/20">
          <KeyRound className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white font-cairo">
            {language === "ar" ? titleAr : (language === "id" && titleId) ? titleId : titleEn}
          </h2>
          <p className="text-xs text-stone-400">
            {language === "ar" ? descriptionAr : (language === "id" && descriptionId) ? descriptionId : descriptionEn}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 text-start">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[0.5em] py-3.5 px-4 rounded-2xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-600 focus:outline-none focus:border-[#EFCC80] font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 disabled:opacity-50 text-[#2C1A04] py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#EFCC80]/20 active:scale-95 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              {isLoading
                ? language === "ar"
                  ? "جاري التحقق..."
                  : language === "id"
                  ? "Memverifikasi..."
                  : "Verifying..."
                : language === "ar"
                ? "تأكيد الدخول"
                : language === "id"
                ? "Konfirmasi Akses"
                : "Unlock Access"}
            </span>
            {language === "ar" ? (
              <ArrowLeft className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#222934]">
          <a
            href="/"
            className="text-xs text-[#EFCC80]/70 hover:text-[#EFCC80] transition-colors"
          >
            {language === "ar" ? "العودة للرئيسية" : language === "id" ? "Kembali ke Beranda" : "Back to Home"}
          </a>
        </div>
      </div>
    </div>
  );
}
