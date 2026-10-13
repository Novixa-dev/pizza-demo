"use client";

import React from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { Plus, Star, Clock } from "lucide-react";
import { CustomizerProduct } from "./CustomizerModal";

interface MenuCardProps {
  product: CustomizerProduct;
  onCustomize: (product: CustomizerProduct) => void;
}

/**
 * Mobile-first menu card: a compact horizontal row on phones (fast to scan, one
 * thumb reach to the add button) that becomes a centered showcase card from `sm` up.
 */
export default function MenuCard({ product, onCustomize }: MenuCardProps) {
  const { language, dict } = useApp();

  const prodName =
    language === "ar"
      ? product.nameAr
      : language === "id" && (product as any).nameId
      ? (product as any).nameId
      : product.nameEn;

  const prodDesc =
    language === "ar"
      ? product.descriptionAr
      : language === "id" && (product as any).descriptionId
      ? (product as any).descriptionId
      : product.descriptionEn;

  const isSignature = product.basePrice >= 5000;
  const open = () => product.isAvailable && onCustomize(product);

  return (
    <article
      className={`group relative flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#14181f]/90 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300 motion-safe:hover:-translate-y-1 hover:border-[#EFCC80]/50 hover:shadow-[0_0_25px_rgba(239,204,128,0.18)] sm:text-center ${
        product.isAvailable ? "" : "opacity-70"
      }`}
    >
      {/* Badge (desktop: top row; mobile: overlaid on the thumbnail) */}
      <div className="hidden sm:flex items-center justify-center mb-3 min-h-[20px]">
        <CardBadge isAvailable={product.isAvailable} isSignature={isSignature} />
      </div>

      {/* Product Image */}
      <button
        type="button"
        onClick={open}
        disabled={!product.isAvailable}
        aria-label={`${dict.menu.customize}: ${prodName}`}
        className="relative shrink-0 w-24 h-24 sm:w-full sm:h-auto sm:aspect-square sm:max-w-[190px] sm:mx-auto overflow-hidden rounded-2xl sm:rounded-full bg-[#0a0c10] border border-white/10 group-hover:border-[#EFCC80]/40 transition-colors sm:mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EFCC80] disabled:cursor-not-allowed"
      >
        <Image
          src={product.imageUrl}
          alt={prodName}
          fill
          sizes="(max-width: 640px) 96px, (max-width: 1024px) 40vw, 190px"
          referrerPolicy="no-referrer"
          className="object-cover motion-safe:group-hover:scale-110 transition-transform duration-500"
          unoptimized
        />
        <span className="sm:hidden absolute bottom-1 inset-x-1 flex justify-center">
          <CardBadge isAvailable={product.isAvailable} isSignature={isSignature} compact />
        </span>
      </button>

      {/* Info + price */}
      <div className="flex-1 min-w-0 flex flex-col self-stretch justify-between gap-2">
        <button
          type="button"
          onClick={open}
          disabled={!product.isAvailable}
          className="text-start sm:text-center space-y-1 focus-visible:outline-none disabled:cursor-not-allowed"
        >
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#EFCC80] transition-colors font-cairo line-clamp-1">
            {prodName}
          </h3>
          <p className="text-[11px] sm:text-xs text-stone-400 line-clamp-2 sm:line-clamp-1 leading-relaxed font-cairo">
            {prodDesc}
          </p>
        </button>

        <div className="flex items-center justify-between gap-2 sm:pt-3 sm:mt-1 sm:border-t sm:border-white/10">
          <div className="text-sm sm:text-base font-black text-[#EFCC80] font-outfit whitespace-nowrap">
            {product.basePrice.toLocaleString()}{" "}
            <span className="text-[11px] font-bold text-stone-400 font-cairo">
              {dict.menu.currency}
            </span>
          </div>

          <button
            type="button"
            onClick={open}
            disabled={!product.isAvailable}
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EFCC80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14181f] ${
              product.isAvailable
                ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 shadow-[0_4px_14px_rgba(198,152,67,0.35)]"
                : "bg-stone-900 text-stone-600 cursor-not-allowed"
            }`}
            title={dict.menu.customize}
            aria-label={`${dict.menu.customize}: ${prodName}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function CardBadge({
  isAvailable,
  isSignature,
  compact = false,
}: {
  isAvailable: boolean;
  isSignature: boolean;
  compact?: boolean;
}) {
  const { language, dict } = useApp();
  const size = compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2.5 py-0.5";

  if (!isAvailable) {
    return (
      <span className={`${size} bg-red-950/90 text-red-300 font-bold rounded-full border border-red-800/40`}>
        {dict.menu.soldOut}
      </span>
    );
  }
  if (isSignature) {
    return (
      <span className={`${size} bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black rounded-full shadow-sm inline-flex items-center gap-1 font-cairo`}>
        <Star className="w-2.5 h-2.5 fill-current" />
        <span>{language === "ar" ? "طبق مميز" : language === "id" ? "Istimewa" : "Signature"}</span>
      </span>
    );
  }
  return (
    <span className={`${size} bg-black/70 text-[#EFCC80] border border-amber-800/40 font-bold rounded-full inline-flex items-center gap-1 font-cairo`}>
      <Clock className="w-2.5 h-2.5" />
      <span>{language === "ar" ? "15 دقيقة" : language === "id" ? "15 mnt" : "15 min"}</span>
    </span>
  );
}
