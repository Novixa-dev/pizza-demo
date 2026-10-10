"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Pizza, Filter } from "lucide-react";
import MenuCard from "@/components/customer/MenuCard";
import CustomizerModal, {
  CustomizerProduct,
} from "@/components/customer/CustomizerModal";

interface CategoryWithProducts {
  id: string;
  nameAr: string;
  nameEn: string;
  nameId?: string;
  slug: string;
  products: any[];
}

interface MenuClientViewProps {
  categories: CategoryWithProducts[];
}

export default function MenuClientView({ categories }: MenuClientViewProps) {
  const { language, dict } = useApp();

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CustomizerProduct | null>(null);

  // Flatten and filter products
  const allProducts = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.products.map((p) => ({ ...p, categorySlug: cat.slug }))
    );
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesCategory =
        activeCategorySlug === "all" || product.categorySlug === activeCategorySlug;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.nameAr?.toLowerCase().includes(q) ||
        product.nameEn?.toLowerCase().includes(q) ||
        (product.nameId && product.nameId.toLowerCase().includes(q)) ||
        product.descriptionAr?.toLowerCase().includes(q) ||
        product.descriptionEn?.toLowerCase().includes(q) ||
        (product.descriptionId && product.descriptionId.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, activeCategorySlug, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 font-cairo">
      {/* Header Banner */}
      <div className="relative text-center space-y-3 max-w-2xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80]/15 to-[#C69843]/10 border border-[#C69843]/30 px-3.5 py-1 rounded-full text-xs font-bold text-[#EFCC80] shadow-[0_0_15px_rgba(239,204,128,0.15)]">
          <Pizza className="w-3.5 h-3.5 text-[#EFCC80]" />
          <span>
            {language === "ar"
              ? "قائمة أطباق الفرن الحجري الفاخرة"
              : language === "id"
              ? "Menu Pilihan Oven Batu Spesial"
              : "Stone-Oven Craft Menu"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-cairo tracking-tight">
          {dict.menu.title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
          {dict.menu.subtitle}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-[#C69843] absolute top-3.5 start-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dict.menu.searchPlaceholder}
          className="w-full text-xs sm:text-sm ps-11 pe-10 py-3.5 rounded-2xl border border-[#222934] bg-[#14181f]/90 text-white placeholder:text-stone-400 shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus:outline-none focus:border-[#C69843] focus:ring-2 focus:ring-[#C69843]/30 transition-all font-cairo"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute top-3.5 end-3 text-xs text-[#EFCC80] hover:text-white transition-colors"
          >
            {language === "ar" ? "مسح" : language === "id" ? "Hapus" : "Clear"}
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-2 scrollbar-none py-1">
        <button
          onClick={() => setActiveCategorySlug("all")}
          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeCategorySlug === "all"
              ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 font-black scale-[1.02]"
              : "bg-[#14181f] text-stone-300 border border-[#222934] hover:border-[#EFCC80]/40 hover:text-white"
          }`}
        >
          {dict.menu.all} ({allProducts.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategorySlug(cat.slug)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeCategorySlug === cat.slug
                ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 font-black scale-[1.02]"
                : "bg-[#14181f] text-stone-300 border border-[#222934] hover:border-[#EFCC80]/40 hover:text-white"
            }`}
          >
            {language === "ar"
              ? cat.nameAr
              : (language === "id" && cat.nameId)
              ? cat.nameId
              : cat.nameEn}{" "}
            ({cat.products.length})
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 space-y-3 bg-[#14181f]/60 rounded-3xl border border-white/5 p-8">
          <div className="w-16 h-16 rounded-full bg-[#1c212d] border border-amber-500/20 flex items-center justify-center mx-auto text-[#EFCC80] shadow-md shadow-amber-950/40">
            <Pizza className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">
            {dict.menu.emptyCategory}
          </h3>
          <p className="text-xs text-stone-400">
            {language === "ar"
              ? "جرب البحث عن أصناف أخرى أو تصفح كامل القائمة"
              : language === "id"
              ? "Coba cari menu lain atau jelajahi seluruh menu kami"
              : "Try searching for other items or browse all"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <MenuCard
              key={product.id}
              product={product}
              onCustomize={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Customizer Modal */}
      {selectedProduct && (
        <CustomizerModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
