"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Utensils,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";

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
        <div className="bg-stone-900/95 dark:bg-stone-900/95 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl shadow-black/50 border border-stone-800 flex items-center justify-between gap-3 backdrop-blur-md">
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pizza-600 to-pizza-700 hover:from-pizza-700 hover:to-pizza-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-pizza-600/30 transition-all active:scale-95"
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

  // If cart is empty and user is on homepage, provide quick sticky mobile navigation dock
  if (pathname === "/") {
    return (
      <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden">
        <div className="bg-stone-900/95 backdrop-blur-md text-white p-2 rounded-2xl shadow-2xl border border-stone-800 flex items-center justify-between gap-1.5">
          {/* 1. Menu & Order Action */}
          <Link
            href="/menu"
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-pizza-700 to-pizza-600 text-white py-2.5 px-2 rounded-xl text-xs font-bold shadow-md shadow-pizza-700/30 active:scale-95 transition-all text-center"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">{language === "ar" ? "قائمة الطعام" : "Menu"}</span>
          </Link>

          {/* 2. Map & Location */}
          <a
            href="https://maps.app.goo.gl/zre73sxKGyM27KvE6"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 bg-stone-800 hover:bg-stone-750 text-stone-200 py-2.5 px-3 rounded-xl text-xs font-bold border border-stone-700/60 active:scale-95 transition-all"
            title="Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-pizza-400 shrink-0" />
            <span>{language === "ar" ? "الخريطة" : "Map"}</span>
          </a>

          {/* 3. WhatsApp Ordering */}
          <a
            href="https://wa.me/967772207788"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 bg-emerald-950/90 text-emerald-300 py-2.5 px-3 rounded-xl text-xs font-bold border border-emerald-800/60 active:scale-95 transition-all"
            title="WhatsApp Orders"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{language === "ar" ? "واتساب" : "WhatsApp"}</span>
          </a>

          {/* 4. Direct Call */}
          <a
            href="tel:05375561"
            className="flex items-center justify-center p-2.5 bg-stone-800 text-stone-300 hover:text-white rounded-xl text-xs border border-stone-700/60 active:scale-95 transition-all"
            title="Call 05375561"
          >
            <Phone className="w-3.5 h-3.5 text-crust-400" />
          </a>
        </div>
      </div>
    );
  }

  return null;
}
