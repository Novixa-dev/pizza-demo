"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { Plus, Flame, Star, ShoppingBag, Heart } from "lucide-react";
import { CustomizerProduct } from "./CustomizerModal";

interface MenuCardProps {
  product: CustomizerProduct;
  onCustomize: (product: CustomizerProduct) => void;
}

export default function MenuCard({ product, onCustomize }: MenuCardProps) {
  const { language, dict } = useApp();
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group bg-[#14181f]/90 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 hover:border-[#EFCC80]/60 shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(239,204,128,0.22)] transition-all duration-300 flex flex-col justify-between p-4 relative text-center">
      {/* Top action row: Wishlist Heart & Availability/Featured Badges */}
      <div className="flex items-center justify-between w-full mb-2 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            isLiked
              ? "text-[#EFCC80] bg-[#EFCC80]/15"
              : "text-stone-400 hover:text-[#EFCC80] hover:bg-white/5"
          }`}
          title={language === "ar" ? "إضافة للمفضلة" : "Add to favorites"}
          aria-label="Favorite"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-[#EFCC80]" : ""}`} />
        </button>

        <div className="flex items-center gap-1">
          {!product.isAvailable ? (
            <span className="bg-red-950/80 text-red-300 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-800/40">
              {dict.menu.soldOut}
            </span>
          ) : product.basePrice >= 5000 ? (
            <span className="bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 font-outfit uppercase">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>SIGNATURE</span>
            </span>
          ) : (
            <span className="bg-amber-950/80 text-[#EFCC80] border border-amber-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 fill-[#EFCC80]" />
              <span>{language === "ar" ? "15 دقيقة" : "15m"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Image */}
      <div
        onClick={() => product.isAvailable && onCustomize(product)}
        className="relative w-full aspect-square max-w-[190px] mx-auto overflow-hidden rounded-full bg-[#0a0c10] cursor-pointer mb-3 border border-white/10 group-hover:border-[#EFCC80]/40 transition-colors"
      >
        <Image
          src={product.imageUrl}
          alt={language === "ar" ? product.nameAr : product.nameEn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          referrerPolicy="no-referrer"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          unoptimized
        />
      </div>

      {/* Star Ratings */}
      <div className="flex items-center justify-center gap-1 mb-1.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-amber-400" />
        ))}
      </div>

      {/* Product Title & Info */}
      <div
        onClick={() => product.isAvailable && onCustomize(product)}
        className="cursor-pointer space-y-1 mb-4"
      >
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors font-cairo line-clamp-1">
          {language === "ar" ? product.nameAr : product.nameEn}
        </h3>
        <p className="text-[11px] text-stone-400 line-clamp-1 leading-relaxed font-cairo">
          {language === "ar" ? product.descriptionAr : product.descriptionEn}
        </p>
      </div>

      {/* Footer / Price & Add to Cart Button */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between mt-auto">
        <div className="text-start">
          <div className="text-sm sm:text-base font-black text-amber-400 font-playfair">
            {product.basePrice.toLocaleString()}{" "}
            <span className="text-[11px] font-bold text-stone-400 font-cairo">
              {dict.menu.currency}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onCustomize(product)}
          disabled={!product.isAvailable}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
            product.isAvailable
              ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 shadow-[0_4px_14px_rgba(198,152,67,0.35)]"
              : "bg-stone-900 text-stone-600 cursor-not-allowed border border-transparent"
          }`}
          title={dict.menu.customize}
          aria-label={dict.menu.customize}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
