"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ShoppingBag, ArrowLeft, ArrowRight, Utensils } from "lucide-react";

export default function FloatingCartBar() {
  const { cart, cartTotal, cartCount, setIsCartOpen, language, dict } = useApp();
  const pathname = usePathname();

  // Hide on checkout, kitchen, and admin screens to avoid interface clutter
  if (
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/kitchen") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  // If cart has items: show floating order summary bar
  if (cart.length > 0) {
    return (
      <div className="fixed bottom-4 inset-x-4 sm:start-auto sm:end-6 sm:bottom-6 z-40 max-w-lg mx-auto sm:max-w-md w-auto">
        <div className="bg-stone-900 dark:bg-stone-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl shadow-black/40 border border-stone-800 flex items-center justify-between gap-3 backdrop-blur-md">
          {/* Cart Icon & Info */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 text-start hover:opacity-90 transition-opacity"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-pizza-600 flex items-center justify-center text-white shadow-md shadow-pizza-600/30 flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-amber-400 text-stone-950 text-[11px] font-black font-outfit flex items-center justify-center shadow">
                {cartCount}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-400 block font-cairo">
                {language === "ar" ? "سلة الطلب الحالية:" : "Your Current Cart:"}
              </span>
              <span className="text-base font-black text-white font-outfit">
                {cartTotal.toLocaleString()} {dict.menu.currency}
              </span>
            </div>
          </button>

          {/* Checkout CTA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="text-xs text-stone-400 hover:text-white px-2 py-1.5 hidden sm:inline-block font-bold"
            >
              {language === "ar" ? "معاينة السلة" : "View"}
            </button>

            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-amber-950/40 transition-all active:scale-95"
            >
              <span>{language === "ar" ? "إتمام الطلب" : "Checkout"}</span>
              {language === "ar" ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and user is on homepage, provide quick sticky order CTA on mobile
  if (pathname === "/") {
    return (
      <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
        <Link
          href="/menu"
          className="w-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] p-3.5 rounded-2xl shadow-xl shadow-amber-950/50 border border-[#EFCC80]/30 flex items-center justify-between font-bold text-xs"
        >
          <div className="flex items-center gap-2.5">
            <Utensils className="w-4 h-4 text-amber-300" />
            <span>{language === "ar" ? "تصفح القائمة واطلب مسبقاً" : "Browse Menu & Pre-Order"}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 text-[11px] font-bold">
            <span>{dict.hero.primaryCta}</span>
            {language === "ar" ? (
              <ArrowLeft className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </div>
        </Link>
      </div>
    );
  }

  return null;
}
