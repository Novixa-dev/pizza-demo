"use client";

import React from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    language,
    dict,
  } = useApp();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 end-0 max-w-full flex w-full sm:max-w-md animate-in slide-in-from-end duration-300">
        <div className="w-full bg-[#0c0e14]/95 backdrop-blur-2xl shadow-2xl flex flex-col justify-between border-s border-[#C69843]/30 transition-colors text-white font-cairo">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#222934] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] flex items-center justify-center text-[#2C1A04] shadow-md shadow-[#EFCC80]/20 flex-shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-cairo">
                  {dict.cart.title}
                </h3>
                <span className="text-xs text-[#EFCC80] font-bold">
                  {cartCount} {language === "ar" ? "أصناف" : "items"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/40 transition-colors"
                  title={dict.cart.clear}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-[#1a202c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#14181f] border border-[#222934] flex items-center justify-center mx-auto text-[#EFCC80] shadow-md">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">
                  {dict.cart.emptyTitle}
                </h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  {dict.cart.emptyDesc}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#2C1A04] bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 px-5 py-2.5 rounded-xl shadow-md shadow-[#EFCC80]/20 transition-all"
                  >
                    <span>{dict.cart.continueShopping}</span>
                    {language === "ar" ? (
                      <ArrowLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3 bg-[#14181f]/80 rounded-2xl border border-[#222934] hover:border-[#EFCC80]/30 flex gap-3 transition-colors shadow-sm"
                >
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#0c0e12] border border-[#222934]">
                    <Image
                      src={item.imageUrl}
                      alt={language === "ar" ? item.nameAr : item.nameEn}
                      fill
                      sizes="80px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-white truncate">
                          {language === "ar" ? item.nameAr : item.nameEn}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-stone-400 hover:text-red-400 p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Selected Options Summary */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-[11px] text-[#EFCC80] mt-1 line-clamp-2">
                          {item.selectedOptions
                            .map((o) => (language === "ar" ? o.optionNameAr : o.optionNameEn))
                            .join(" • ")}
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-[10px] text-amber-300 mt-0.5 italic truncate">
                          &quot;{item.notes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-[#222934]">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-[#0c0e12] px-1.5 py-0.5 rounded-lg border border-[#222934]">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="p-1 text-stone-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-outfit px-1 text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="p-1 text-stone-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-sm font-black text-[#EFCC80] font-outfit">
                        {item.subtotal.toLocaleString()}{" "}
                        <span className="text-xs font-normal font-cairo text-stone-400">
                          {dict.menu.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#222934] bg-[#0c0e12] space-y-3">
              <div className="flex justify-between items-center text-sm text-stone-400">
                <span>{dict.cart.subtotal}</span>
                <span className="font-bold font-outfit text-white">
                  {cartTotal.toLocaleString()} {dict.menu.currency}
                </span>
              </div>

              <div className="flex justify-between items-center text-base font-black text-white pt-1.5 border-t border-[#222934]">
                <span>{dict.cart.total}</span>
                <span className="text-xl text-[#EFCC80] font-outfit font-black">
                  {cartTotal.toLocaleString()} {dict.menu.currency}
                </span>
              </div>

              <a
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 text-[#2C1A04] py-3.5 px-4 rounded-xl text-base font-black shadow-lg shadow-[#EFCC80]/20 active:scale-[0.99] transition-all font-cairo"
              >
                <span>{dict.cart.checkout}</span>
                {language === "ar" ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
