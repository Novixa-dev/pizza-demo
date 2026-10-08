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
    <div className="group bg-[#14181f] rounded-2xl overflow-hidden border border-[#222934] hover:border-[#e45a38]/60 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 flex flex-col justify-between p-4 relative text-center">
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
              ? "text-[#e45a38] bg-[#e45a38]/15"
              : "text-stone-400 hover:text-[#e45a38] hover:bg-[#1a202a]"
          }`}
          title={language === "ar" ? "إضافة للمفضلة" : "Add to favorites"}
          aria-label="Favorite"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-[#e45a38]" : ""}`} />
        </button>

        <div className="flex items-center gap-1">
          {!product.isAvailable ? (
            <span className="bg-red-950/80 text-red-300 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-800/40">
              {dict.menu.soldOut}
            </span>
          ) : product.basePrice >= 5000 ? (
            <span className="bg-[#e45a38] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 font-outfit uppercase">
              <Star className="w-2.5 h-2.5 fill-white" />
              <span>SALE</span>
            </span>
          ) : (
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-2.5 h-2.5" />
              <span>{language === "ar" ? "15 دقيقة" : "15m"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Image */}
      <div
        onClick={() => product.isAvailable && onCustomize(product)}
        className="relative w-full aspect-square max-w-[190px] mx-auto overflow-hidden rounded-full bg-[#101318] cursor-pointer mb-3 border border-[#1f2530]"
      >
        <Image
          src={product.imageUrl}
          alt={language === "ar" ? product.nameAr : product.nameEn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          referrerPolicy="no-referrer"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
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
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#e45a38] transition-colors font-cairo line-clamp-1">
          {language === "ar" ? product.nameAr : product.nameEn}
        </h3>
        <p className="text-[11px] text-stone-400 line-clamp-1 leading-relaxed">
          {language === "ar" ? product.descriptionAr : product.descriptionEn}
        </p>
      </div>

      {/* Footer / Price & Add to Cart Button */}
      <div className="pt-2 border-t border-[#1f2530] flex items-center justify-between mt-auto">
        <div className="text-start">
          <div className="text-sm sm:text-base font-black text-white font-outfit">
            {product.basePrice.toLocaleString()}{" "}
            <span className="text-[11px] font-bold text-[#e45a38] font-cairo">
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
              ? "bg-[#1c222b] hover:bg-[#e45a38] text-white border border-[#2b3544] hover:border-[#e45a38] shadow-sm"
              : "bg-stone-900 text-stone-600 cursor-not-allowed border border-transparent"
          }`}
          title={dict.menu.customize}
          aria-label={dict.menu.customize}
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
