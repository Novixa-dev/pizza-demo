"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { X, Plus, Minus, Check } from "lucide-react";
import { SelectedOptionPayload } from "@/types";

export interface CustomizerProduct {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  basePrice: number;
  imageUrl: string;
  isAvailable: boolean;
  optionGroups: {
    id: string;
    nameAr: string;
    nameEn: string;
    type: string; // "RADIO" or "CHECKBOX"
    isRequired: boolean;
    minSelect: number;
    maxSelect: number;
    options: {
      id: string;
      nameAr: string;
      nameEn: string;
      priceDelta: number;
      isAvailable: boolean;
    }[];
  }[];
}

interface CustomizerModalProps {
  product: CustomizerProduct | null;
  onClose: () => void;
}

export default function CustomizerModal({
  product,
  onClose,
}: CustomizerModalProps) {
  const { language, addToCart, dict } = useApp();

  const [selectedRadio, setSelectedRadio] = useState<Record<string, string>>({});
  const [selectedCheckbox, setSelectedCheckbox] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  // Initialize default selections when product changes
  useEffect(() => {
    if (!product) return;

    const initialRadio: Record<string, string> = {};
    const initialCheckbox: Record<string, string[]> = {};

    product.optionGroups.forEach((group) => {
      if (group.type === "RADIO" && group.options.length > 0) {
        // Select first available option as default
        const firstAvail = group.options.find((o) => o.isAvailable) || group.options[0];
        initialRadio[group.id] = firstAvail.id;
      } else if (group.type === "CHECKBOX") {
        initialCheckbox[group.id] = [];
      }
    });

    setSelectedRadio(initialRadio);
    setSelectedCheckbox(initialCheckbox);
    setQuantity(1);
    setNotes("");
  }, [product]);

  if (!product) return null;

  // Calculate live unit price
  let unitPrice = product.basePrice;
  const currentSelections: SelectedOptionPayload[] = [];

  product.optionGroups.forEach((group) => {
    if (group.type === "RADIO") {
      const selectedId = selectedRadio[group.id];
      const opt = group.options.find((o) => o.id === selectedId);
      if (opt) {
        unitPrice += opt.priceDelta;
        currentSelections.push({
          groupId: group.id,
          groupNameAr: group.nameAr,
          groupNameEn: group.nameEn,
          optionId: opt.id,
          optionNameAr: opt.nameAr,
          optionNameEn: opt.nameEn,
          priceDelta: opt.priceDelta,
        });
      }
    } else if (group.type === "CHECKBOX") {
      const selectedIds = selectedCheckbox[group.id] || [];
      selectedIds.forEach((id) => {
        const opt = group.options.find((o) => o.id === id);
        if (opt) {
          unitPrice += opt.priceDelta;
          currentSelections.push({
            groupId: group.id,
            groupNameAr: group.nameAr,
            groupNameEn: group.nameEn,
            optionId: opt.id,
            optionNameAr: opt.nameAr,
            optionNameEn: opt.nameEn,
            priceDelta: opt.priceDelta,
          });
        }
      });
    }
  });

  const totalPrice = unitPrice * quantity;

  const handleRadioChange = (groupId: string, optionId: string) => {
    setSelectedRadio((prev) => ({ ...prev, [groupId]: optionId }));
  };

  const handleCheckboxToggle = (
    groupId: string,
    optionId: string,
    maxSelect: number
  ) => {
    const current = selectedCheckbox[groupId] || [];
    if (current.includes(optionId)) {
      setSelectedCheckbox((prev) => ({
        ...prev,
        [groupId]: current.filter((id) => id !== optionId),
      }));
    } else {
      if (maxSelect && current.length >= maxSelect) {
        return; // Max reached
      }
      setSelectedCheckbox((prev) => ({
        ...prev,
        [groupId]: [...current, optionId],
      }));
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      imageUrl: product.imageUrl,
      basePrice: product.basePrice,
      unitPrice,
      quantity,
      selectedOptions: currentSelections,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Dialog Modal */}
      <div className="relative w-full max-w-xl bg-[#14181f] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-10 border border-[#C69843]/40 flex flex-col max-h-[90vh] text-white font-cairo">
        {/* Header with image */}
        <div className="relative h-44 sm:h-52 w-full flex-shrink-0 bg-[#0c0e12]">
          <Image
            src={product.imageUrl}
            alt={
              language === "ar"
                ? product.nameAr
                : language === "id" && (product as any).nameId
                ? (product as any).nameId
                : product.nameEn
            }
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            referrerPolicy="no-referrer"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14181f] via-[#14181f]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Product Title on Image */}
          <div className="absolute bottom-3 start-4 end-4">
            <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {language === "ar"
                ? product.nameAr
                : language === "id" && (product as any).nameId
                ? (product as any).nameId
                : product.nameEn}
            </h3>
            <p className="text-xs text-stone-300 line-clamp-1 mt-0.5 drop-shadow">
              {language === "ar"
                ? product.descriptionAr
                : language === "id" && (product as any).descriptionId
                ? (product as any).descriptionId
                : product.descriptionEn}
            </p>
          </div>
        </div>

        {/* Option Groups Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {product.optionGroups.map((group) => {
            const isRadio = group.type === "RADIO";
            return (
              <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {language === "ar"
                        ? group.nameAr
                        : language === "id" && (group as any).nameId
                        ? (group as any).nameId
                        : group.nameEn}
                    </span>
                    {group.isRequired && (
                      <span className="text-[10px] text-[#EFCC80] bg-[#EFCC80]/15 border border-[#EFCC80]/30 px-2.5 py-0.5 rounded-full font-bold">
                        {language === "ar"
                          ? "إجباري"
                          : language === "id"
                          ? "Wajib"
                          : "Required"}
                      </span>
                    )}
                  </h4>
                  {group.type === "CHECKBOX" && group.maxSelect > 1 && (
                    <span className="text-[11px] text-stone-400">
                      {language === "ar"
                        ? `اختر حتى ${group.maxSelect}`
                        : language === "id"
                        ? `Pilih hingga ${group.maxSelect}`
                        : `Up to ${group.maxSelect}`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.options.map((opt) => {
                    const isSelected = isRadio
                      ? selectedRadio[group.id] === opt.id
                      : (selectedCheckbox[group.id] || []).includes(opt.id);

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        disabled={!opt.isAvailable}
                        onClick={() =>
                          isRadio
                            ? handleRadioChange(group.id, opt.id)
                            : handleCheckboxToggle(
                                group.id,
                                opt.id,
                                group.maxSelect
                              )
                        }
                        className={`p-3 rounded-2xl border text-start flex items-center justify-between transition-all ${
                          !opt.isAvailable
                            ? "opacity-40 cursor-not-allowed border-[#222934] bg-[#0c0e12]"
                            : isSelected
                            ? "border-[#EFCC80] bg-[#0c0e12] text-white shadow-[0_0_15px_rgba(239,204,128,0.2)]"
                            : "border-[#222934] hover:border-[#EFCC80]/40 bg-[#0c0e12]/60 text-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-${
                              isRadio ? "full" : "md"
                            } border flex items-center justify-center ${
                              isSelected
                                ? "border-[#EFCC80] bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04]"
                                : "border-stone-600"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-bold">
                            {language === "ar"
                              ? opt.nameAr
                              : language === "id" && (opt as any).nameId
                              ? (opt as any).nameId
                              : opt.nameEn}
                          </span>
                        </div>

                        {opt.priceDelta !== 0 && (
                          <span className="text-xs font-outfit font-black text-[#EFCC80]">
                            +{opt.priceDelta.toLocaleString()} {dict.menu.currency}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Kitchen Instructions */}
          <div className="space-y-2 pt-2 border-t border-[#222934]">
            <label className="text-xs font-bold text-stone-300">
              {dict.customizer.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={dict.customizer.notesPlaceholder}
              className="w-full text-xs p-3 rounded-xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#EFCC80] transition-colors"
            />
          </div>
        </div>

        {/* Modal Footer with Live Quantity & Add Action */}
        <div className="p-4 sm:p-5 border-t border-[#222934] bg-[#0c0e12] flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-[#14181f] p-1 rounded-xl border border-[#222934]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-[#1a202c] transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-outfit font-black text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-[#1a202c] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add CTA */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 text-[#2C1A04] py-3.5 px-5 rounded-2xl font-black text-sm shadow-lg shadow-[#EFCC80]/20 active:scale-[0.99] transition-all font-cairo"
          >
            <span>{dict.customizer.confirmAdd}</span>
            <span className="font-outfit text-base font-black">
              {totalPrice.toLocaleString()} {dict.menu.currency}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
