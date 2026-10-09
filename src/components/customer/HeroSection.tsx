"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Play,
  X,
  Flame,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface HeroSectionProps {
  language: string;
  opStatus: {
    status: string;
    badgeLabelAr: string;
    badgeLabelEn: string;
  };
  onCustomizeProduct?: (product: any) => void;
  featuredProducts?: any[];
}

export default function HeroSection({
  language,
  opStatus,
  onCustomizeProduct,
  featuredProducts = [],
}: HeroSectionProps) {
  const { addToCart, setIsCartOpen } = useApp();

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("المكلا · فوه");
  const [selectedTime, setSelectedTime] = useState<"asap" | "later">("asap");
  const [addedItemMessage, setAddedItemMessage] = useState<string | null>(null);

  // The 4 Signature Gourmet Pies
  const signaturePies = [
    {
      id: "sig-truffle",
      nameEn: "Truffle Mushroom",
      nameAr: "بيتزا ماشروم بالترفل",
      priceYER: "4,800 YER",
      numericPrice: 4800,
      rating: 4.9,
      descEn: "White truffle crema, roasted forest mushrooms, melted cheese",
      descAr: "كريمة الترفل البيضاء، فطر بري مشوي... بطير البشاميل...",
      image: "/images/aura/pan_truffle.png",
      fallbackImage: "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?q=80&w=800",
    },
    {
      id: "sig-pepperoni",
      nameEn: "Double Pepperoni",
      nameAr: "دبل بيبروني كرسبي",
      priceYER: "4,200 YER",
      numericPrice: 4800,
      rating: 4.8,
      descEn: "Double crispy beef pepperoni cups, rich tomato base",
      descAr: "شرائح بيبروني بقري مضاعفة مضاعفة دبل البيبروني...",
      image: "/images/aura/pan_pepperoni.png",
      fallbackImage: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800",
    },
    {
      id: "sig-margherita",
      nameEn: "Margherita Craft",
      nameAr: "مارغريتا كرافت الحجرية",
      priceYER: "3,500 YER",
      numericPrice: 3500,
      rating: 4.7,
      descEn: "San Marzano tomato sauce, fresh mozzarella patches, basil",
      descAr: "صلصة سان مارزانو، موزاريلا طازجة ملسة كريزاا...",
      image: "/images/aura/pan_margherita.png",
      fallbackImage: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800",
    },
    {
      id: "sig-burrata",
      nameEn: "Spicy Burrata",
      nameAr: "سبايسي بوراتا الإيطالية",
      priceYER: "4,900 YER",
      numericPrice: 4900,
      rating: 4.9,
      descEn: "Creamy artisanal burrata cheese, hot chili crisp crunch",
      descAr: "كرة جبنة بوراتا كريمية، صوص حار كريسب...",
      image: "/images/aura/pan_burrata.png",
      fallbackImage: "https://images.unsplash.com/photo-1555072956-7758afb20e8f?q=80&w=800",
    },
  ];

  const handleAddSignaturePie = (pie: (typeof signaturePies)[0]) => {
    const matched = featuredProducts.find(
      (p) =>
        p.nameAr?.includes(pie.nameAr.split(" ")[0]) ||
        p.nameEn?.toLowerCase().includes(pie.nameEn.toLowerCase().split(" ")[0])
    );

    if (matched && onCustomizeProduct) {
      onCustomizeProduct(matched);
      return;
    }

    addToCart({
      productId: pie.id,
      nameAr: pie.nameAr,
      nameEn: pie.nameEn,
      price: pie.numericPrice,
      quantity: 1,
      selectedOptions: [],
      imageUrl: pie.image,
    });

    setAddedItemMessage(language === "ar" ? `تمت إضافة ${pie.nameAr} إلى السلة 🍕` : `Added ${pie.nameEn} to cart 🍕`);
    setIsCartOpen(true);
    setTimeout(() => setAddedItemMessage(null), 3000);
  };

  return (
    <div
      dir="rtl"
      className="w-full relative overflow-hidden bg-[#111111] text-white -mt-4 sm:-mt-6 border-b border-[#dab165]/15 shadow-2xl selection:bg-[#dab165] selection:text-black font-cairo"
    >
      {/* Quick Toast for Added Item */}
      {addedItemMessage && (
        <div className="fixed top-24 start-1/2 -translate-x-1/2 z-50 bg-[#161a24]/95 text-white border border-[#dab165]/50 px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{addedItemMessage}</span>
        </div>
      )}

      {/* =========================================================================
          HERO MAIN AREA (Exact Colors, Fonts & Layout Matching Mockup 100%)
      ========================================================================= */}
      <div className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center font-cairo">
        {/* Full Hero Background: img22.png */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/img22.png"
            alt="AURA PIZZA - Wood Fired Oven"
            fill
            priority
            quality={100}
            className="object-cover object-center select-none pointer-events-none"
          />
          {/* Subtle gradient overlays for flawless contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Hero Content Section */}
        <section
          id="home"
          className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 w-full"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6 w-full">
            
            {/* 1. RIGHT SIDE: TYPOGRAPHY, BUTTONS & STATS */}
            <div className="max-w-md lg:max-w-xl flex flex-col items-start text-start space-y-5 z-20">
              {/* Main Headline (Cairo 900 Black) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.12] text-white font-cairo drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                تذوّق التميّز الاستثنائي
              </h1>

              {/* Sub-title */}
              <p className="text-sm sm:text-[15px] text-[#a8a8b2] max-w-lg leading-relaxed font-cairo font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
                استمتع بأشهى أصناف البيتزا الحرفية المحضرة يدوياً بمكونات فاخرة، مخبوزة على الحجر الطبيعي بحرارة الفرن الحجري المشتعل.
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1 w-full sm:w-auto font-cairo">
                {/* Explore Menu Button (Exact requested bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04]) */}
                <Link
                  href="#menu"
                  className="inline-flex items-center justify-center bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-bold px-8 py-3.5 rounded-[14px] text-sm sm:text-base shadow-[0_4px_22px_rgba(198,152,67,0.38)] active:scale-95 transition-all font-cairo cursor-pointer"
                >
                  استكشف القائمة
                </Link>

                {/* Watch Us Bake Button with Golden Circle Play Icon */}
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 bg-black/50 hover:bg-white/5 border border-[#C69843]/60 text-[#EFCC80] px-6 py-3.5 rounded-[14px] text-sm font-semibold transition-all backdrop-blur-md active:scale-95 font-cairo cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] flex items-center justify-center text-[#2C1A04] shadow-sm">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                  <span>شاهد أسرار خُبزنا</span>
                </button>
              </div>

              {/* Stats Row (Exact #EFCC80 Gold Numbers & Dividers) */}
              <div className="flex items-center gap-6 sm:gap-8 pt-3 text-center font-cairo">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#EFCC80] font-cairo tracking-wide">
                    +٥٠٠
                  </div>
                  <div className="text-xs text-[#8c8c96] font-cairo mt-0.5">
                    طلب يومي
                  </div>
                </div>

                <div className="h-8 w-px bg-white/15" />

                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#EFCC80] font-cairo tracking-wide">
                    ١٥,٠٠٠
                  </div>
                  <div className="text-xs text-[#8c8c96] font-cairo mt-0.5">
                    عميل سعيد
                  </div>
                </div>

                <div className="h-8 w-px bg-white/15" />

                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#EFCC80] font-cairo tracking-wide">
                    +١٥
                  </div>
                  <div className="text-xs text-[#8c8c96] font-cairo mt-0.5">
                    سنة خبرة
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LEFT SIDE: OVERLAID GLASSMORPHIC FORM */}
            <div className="max-w-sm w-full z-20">
              <div className="bg-black/60 backdrop-blur-md rounded-[18px] p-5 sm:p-6 text-white space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative border border-white/10 max-w-sm mx-auto lg:mx-0 font-cairo">
                <h3 className="font-bold text-base sm:text-lg font-cairo text-white text-start">
                  استلمها ساخنة وطازجة (15 دقيقة)
                </h3>

                {/* Delivery / Pickup Radio Toggle */}
                <div className="bg-[#0b0c10]/80 p-2.5 rounded-xl flex items-center justify-between border border-white/5 text-xs font-cairo">
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    className="flex items-center gap-2 text-stone-200 hover:text-white transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        orderType === "delivery"
                          ? "border-[#C69843] bg-gradient-to-b from-[#EFCC80] to-[#C69843]"
                          : "border-gray-500 bg-transparent"
                      }`}
                    >
                      {orderType === "delivery" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2C1A04]" />
                      )}
                    </div>
                    <span className="font-semibold text-white">توصيل للمنزل</span>
                  </button>

                  <span className="text-gray-600">/</span>

                  <button
                    type="button"
                    onClick={() => setOrderType("pickup")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        orderType === "pickup"
                          ? "border-[#C69843] bg-gradient-to-b from-[#EFCC80] to-[#C69843]"
                          : "border-gray-500 bg-transparent"
                      }`}
                    >
                      {orderType === "pickup" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2C1A04]" />
                      )}
                    </div>
                    <span className="font-semibold">استلام من الفرع</span>
                  </button>
                </div>

                {/* Address Input Bar */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#0b0c10]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-[#C69843] font-cairo"
                      placeholder="عنوان التوصيل: المكلا · فوه"
                    />
                  </div>
                </div>

                {/* Time Selection Dropdown */}
                <div className="relative">
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value as any)}
                    className="w-full appearance-none bg-[#0b0c10]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C69843] font-cairo cursor-pointer"
                  >
                    <option value="asap">وقت الاستلام: الآن (15 دقيقة)</option>
                    <option value="later">جدولة وقت لاحق (اليوم)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Full-width Gold Button (Exact requested bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04]) */}
                <Link
                  href="#menu"
                  className="w-full py-3.5 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-bold text-xs sm:text-sm rounded-[14px] flex items-center justify-center shadow-[0_4px_20px_rgba(198,152,67,0.35)] font-cairo active:scale-95 transition-all text-center cursor-pointer"
                >
                  اطلب من أقرب فرع
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================================
          "التواقيع الحرفية" - SIGNATURE PIZZAS SECTION
      ========================================================================= */}
      <section className="relative z-20 py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full font-cairo">
        <h2 className="text-2xl font-bold text-white font-cairo mb-5 text-start tracking-wide">
          التواقيع الحرفية
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {signaturePies.map((pie) => (
            <div
              key={pie.id}
              className="bg-[#16171b]/85 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-row-reverse items-center gap-3.5 hover:border-[#dab165]/50 hover:scale-[1.02] transition-all duration-300 shadow-xl group"
            >
              {/* Circular Pan on Left */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-[#1a1b20] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.8)] shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                  src={pie.image}
                  alt={pie.nameAr}
                  width={110}
                  height={110}
                  className="w-full h-full object-cover rounded-full group-hover:rotate-6 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== pie.fallbackImage) {
                      target.src = pie.fallbackImage;
                    }
                  }}
                />
              </div>

              {/* Info on Right */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5 text-right font-cairo">
                <div>
                  <div className="flex items-center justify-end gap-1 text-[#EFCC80] text-xs font-bold mb-1">
                    <span>★</span>
                    <span>{pie.rating}</span>
                  </div>

                  <h3 className="font-bold text-white text-sm sm:text-base font-cairo truncate">
                    {pie.nameAr}
                  </h3>

                  <p className="text-[11px] text-[#8c8c96] font-cairo line-clamp-2 mt-0.5 leading-tight">
                    {pie.descAr}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                  <span className="font-bold text-xs sm:text-sm text-gray-200 font-cairo">
                    {pie.priceYER}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddSignaturePie(pie)}
                    className="w-7 h-7 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-black flex items-center justify-center text-sm shadow-md active:scale-90 transition-all cursor-pointer"
                    title="أضف إلى السلة"
                    aria-label={`Add ${pie.nameAr} to cart`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= OPERATIONAL STATUS SUB-BAR ================= */}
      <div className="w-full bg-[#0a0b0e] border-t border-[#dab165]/10 py-2.5 px-4 sm:px-6 relative z-10 font-cairo">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                opStatus.status === "OPEN_FOR_ORDERING"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-amber-400 animate-ping"
              }`}
            />
            <span className="font-bold text-white font-cairo">
              {opStatus.badgeLabelAr}
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1 text-[#dab165] font-semibold font-cairo">
              <MapPin className="w-3.5 h-3.5 text-[#dab165]" />
              <span>المكلا · فوه · حي المساكن</span>
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[#dab165] font-bold font-cairo flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-[#dab165]" />
              <span>فرن حجري 15 دقيقة</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:05375561"
              className="text-gray-300 hover:text-white transition-colors font-bold text-[#dab165]"
            >
              هاتف: 05375561
            </a>
            <span className="text-white/20">|</span>
            <a
              href="https://wa.me/967772207788"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
            >
              واتساب: 772207788
            </a>
          </div>
        </div>
      </div>

      {/* ================= VIDEO MODAL ================= */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-cairo">
          <div className="relative w-full max-w-3xl bg-[#0f1118] border border-[#dab165]/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold font-cairo">
                <Flame className="w-4 h-4 text-[#dab165] fill-[#dab165]" />
                <span>أسرار الخَبز الحجري الفاخر — AURA PIZZA</span>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/1-SJGQ2HLp8?autoplay=1&mute=0"
                title="AURA PIZZA Wood-Fired Bake Story"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
