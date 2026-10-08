"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  PhoneCall,
  Play,
  ArrowLeft,
  ArrowRight,
  X,
  Sparkles,
  Flame,
  Clock,
  Plus,
  Star,
  CheckCircle2,
  Navigation,
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

  // Animated numbers
  const [stats, setStats] = useState({ orders: 0, customers: 0, years: 0 });
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Overlaid "Get It Hot & Fresh" Form state
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState(
    language === "ar"
      ? "المكلا، فوه، حي المساكن - بالقرب من الجامعة"
      : "Mukalla, Fuwa, Al-Masaken District"
  );
  const [selectedTime, setSelectedTime] = useState<"asap" | "later">("asap");
  const [addedItemMessage, setAddedItemMessage] = useState<string | null>(null);

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setStats({
        orders: Math.floor(ease * 500),
        customers: Math.floor(ease * 15000),
        years: Math.floor(ease * 15),
      });

      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const isRtl = language === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // The 4 Signature Gourmet Pies (matching prompt specifications)
  const signaturePies = [
    {
      id: "sig-truffle",
      nameEn: "Truffle Mushroom",
      nameAr: "بيتزا ماشروم بالترفل",
      priceUSD: "$18.99",
      priceYER: "4,800 YER",
      numericPrice: 4800,
      rating: 4.9,
      reviews: "1.2k",
      descEn: "White truffle crema, sautéed forest mushrooms, fior di latte & fresh thyme",
      descAr: "كريمة الترفل البيضاء، فطر بري مشوي على الحجر، موزاريلا فاخرة وزعتر بري",
      image: "/images/aura/truffle-mushroom.jpg",
      badge: "CHEF'S SIGNATURE",
      badgeAr: "اختيار الشيف",
    },
    {
      id: "sig-pepperoni",
      nameEn: "Double Pepperoni",
      nameAr: "دبل بيبروني كرسبي",
      priceUSD: "$16.50",
      priceYER: "4,200 YER",
      numericPrice: 4200,
      rating: 4.8,
      reviews: "2.4k",
      descEn: "Double crispy cupped beef pepperoni, spicy hot honey drizzle & molten mozzarella",
      descAr: "شرائح بيبروني بقري مضاعفة مقرمشة، لمسة عسل حار، وجبنة موزاريلا تمط",
      image: "/images/aura/double-pepperoni.jpg",
      badge: "MOST POPULAR",
      badgeAr: "الأكثر طلباً",
    },
    {
      id: "sig-margherita",
      nameEn: "Margherita Craft",
      nameAr: "مارغريتا كرافت الحجرية",
      priceUSD: "$14.99",
      priceYER: "3,500 YER",
      numericPrice: 3500,
      rating: 4.7,
      reviews: "950",
      descEn: "San Marzano D.O.P. sauce, artisanal fresh mozzarella, Genovese basil & EVOO",
      descAr: "صلصة سان مارزانو، موزاريلا طازجة، ريحان جينوفيزي وزيت زيتون بكر ممتاز",
      image: "/images/aura/margherita-craft.jpg",
      badge: "CLASSIC ARTISAN",
      badgeAr: "كلاسيك إيطالي",
    },
    {
      id: "sig-burrata",
      nameEn: "Spicy Burrata",
      nameAr: "سبايسي بوراتا الإيطالية",
      priceUSD: "$19.00",
      priceYER: "4,900 YER",
      numericPrice: 4900,
      rating: 4.9,
      reviews: "820",
      descEn: "Whole creamy artisanal burrata crown, spicy chili crisp crunch & herb oil",
      descAr: "كرة جبنة بوراتا كريمية كاملة، صوص فلفل حار كرانشي، وزيت أعشاب فاخر",
      image: "/images/aura/spicy-burrata.jpg",
      badge: "GOURMET LUXURY",
      badgeAr: "إصدار فاخر",
    },
  ];

  const handleAddSignaturePie = (pie: (typeof signaturePies)[0]) => {
    // Check if we can map to a database product first
    const matched = featuredProducts.find(
      (p) =>
        p.nameAr?.includes(pie.nameAr.split(" ")[0]) ||
        p.nameEn?.toLowerCase().includes(pie.nameEn.toLowerCase().split(" ")[0])
    );

    if (matched && onCustomizeProduct) {
      onCustomizeProduct(matched);
      return;
    }

    // Direct add to cart
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
    <div className="w-full relative overflow-hidden bg-[#07080b] text-white -mt-4 sm:-mt-6 border-b border-amber-500/15 shadow-2xl">
      {/* ================= BACKGROUND GLOW & FIRE OVEN ATMOSPHERE ================= */}
      <div className="hero-bg-effects" aria-hidden="true" />

      {/* Floating Ember Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-1" aria-hidden="true">
        <div className="ember-particle" style={{ left: "12%", bottom: "5%", width: 6, height: 6, animationDelay: "0s", animationDuration: "5.5s" }} />
        <div className="ember-particle" style={{ left: "28%", bottom: "8%", width: 8, height: 8, animationDelay: "1.8s", animationDuration: "6.2s" }} />
        <div className="ember-particle" style={{ left: "52%", bottom: "2%", width: 5, height: 5, animationDelay: "0.9s", animationDuration: "4.8s" }} />
        <div className="ember-particle" style={{ left: "74%", bottom: "6%", width: 7, height: 7, animationDelay: "2.5s", animationDuration: "7.0s" }} />
        <div className="ember-particle" style={{ left: "88%", bottom: "4%", width: 6, height: 6, animationDelay: "3.2s", animationDuration: "5.0s" }} />
      </div>

      {/* Subtle Smoke Effect */}
      <div className="smoke-container" aria-hidden="true">
        <div className="smoke" />
        <div className="smoke" />
        <div className="smoke" />
        <div className="smoke" />
        <div className="smoke" />
      </div>

      {/* Quick Toast for Added Item */}
      {addedItemMessage && (
        <div className="fixed top-24 start-1/2 -translate-x-1/2 z-50 bg-[#161a24]/95 text-white border border-amber-500/50 px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{addedItemMessage}</span>
        </div>
      )}

      {/* =========================================================================
          HERO MAIN AREA (16:9 Cinema Canvas)
      ========================================================================= */}
      <section
        id="home"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-12 lg:pb-16 min-h-[82vh] flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* ----------------- LEFT SIDE: TYPOGRAPHY & STORY (4.5 Cols) ----------------- */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-start space-y-6 z-20">
            {/* Top Luxury Brand Badge */}
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500/15 via-[#ff8c00]/15 to-transparent border border-amber-500/30 px-4 py-2 rounded-full text-xs font-bold text-amber-400 tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Flame className="w-4 h-4 text-[#ff8c00] fill-amber-400 animate-pulse" />
              <span>
                {language === "ar"
                  ? "أورا بيتزا · فرن حجري إيطالي فاخر"
                  : "AURA PIZZA · WOOD-FIRED ARTISAN CRAFT"}
              </span>
            </div>

            {/* Captivating Grand Typography */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black font-playfair tracking-tight leading-[1.08] text-white">
              {language === "ar" ? (
                <>
                  تذوّق التميّز
                  <br />
                  <span className="hero-title-highlight font-playfair drop-shadow-[0_4px_25px_rgba(245,158,11,0.5)]">
                    الاستثنائي
                  </span>
                </>
              ) : (
                <>
                  CRAVE THE
                  <br />
                  <span className="hero-title-highlight font-playfair drop-shadow-[0_4px_25px_rgba(245,158,11,0.5)]">
                    EXTRAORDINARY
                  </span>
                </>
              )}
            </h1>

            {/* Cinematic Subtext */}
            <p className="text-sm sm:text-base xl:text-lg text-stone-300/80 max-w-xl leading-relaxed font-cairo font-normal">
              {language === "ar"
                ? "استمتع بأشهى أصناف البيتزا الحرفية المحضرة يدوياً بمكونات فاخرة، مخبوزة على الحجر الطبيعي بحرارة الفرن الحجري المشتعل."
                : "Indulge in artisanal pizzas handcrafted with premium ingredients, baked to perfection in our blazing wood-fired stone oven."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              {/* Explore Menu Button (Warm Golden Gradient) */}
              <Link
                href="#menu"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff8c00] via-[#f59e0b] to-[#dc3c14] hover:shadow-[0_0_30px_rgba(255,140,0,0.65)] hover:-translate-y-0.5 text-white font-bold px-7 py-3.5 rounded-full text-sm sm:text-base shadow-xl shadow-orange-950/60 active:scale-95 transition-all group border border-amber-300/30"
              >
                <span>{language === "ar" ? "استكشف القائمة" : "Explore Menu"}</span>
                <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>

              {/* Watch Us Bake Play Button */}
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="inline-flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-500/40 text-stone-200 hover:text-white px-5 py-3.5 rounded-full text-sm font-semibold transition-all group backdrop-blur-md active:scale-95"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff8c00] to-[#dc2626] flex items-center justify-center text-white shadow-md shadow-orange-950/50 group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-amber-100" />
                </div>
                <span>{language === "ar" ? "شاهد أسرار خَبزنا" : "Watch Us Bake"}</span>
              </button>
            </div>

            {/* Live Stats Row */}
            <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-6 border-t border-white/10 w-full max-w-md">
              <div className="text-center lg:text-start">
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-playfair tracking-tight">
                  {stats.orders.toLocaleString(language === "ar" ? "ar-EG" : "en-US")}+
                </div>
                <div className="text-[11px] sm:text-xs text-stone-400 uppercase tracking-wider mt-0.5 font-cairo">
                  {language === "ar" ? "طلب يومي" : "Daily Orders"}
                </div>
              </div>

              <div className="text-center lg:text-start">
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-playfair tracking-tight">
                  {stats.customers.toLocaleString(language === "ar" ? "ar-EG" : "en-US")}+
                </div>
                <div className="text-[11px] sm:text-xs text-stone-400 uppercase tracking-wider mt-0.5 font-cairo">
                  {language === "ar" ? "عميل سعيد" : "Happy Clients"}
                </div>
              </div>

              <div className="text-center lg:text-start">
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-playfair tracking-tight">
                  {stats.years.toLocaleString(language === "ar" ? "ar-EG" : "en-US")}+
                </div>
                <div className="text-[11px] sm:text-xs text-stone-400 uppercase tracking-wider mt-0.5 font-cairo">
                  {language === "ar" ? "سنة خبرة" : "Years Craft"}
                </div>
              </div>
            </div>
          </div>

          {/* ----------------- CENTER: WOOD-FIRED CHEESE-PULL PIZZA (4 Cols) ----------------- */}
          <div className="lg:col-span-4 relative flex items-center justify-center min-h-[360px] sm:min-h-[460px]">
            {/* Blazing Stone Oven Glow & Arch */}
            <div
              className="absolute w-[360px] sm:w-[460px] aspect-square rounded-full bg-radial from-[#ea580c]/35 via-[#b91c1c]/20 to-transparent blur-3xl pointer-events-none fire-oven-glow"
              aria-hidden="true"
            />

            {/* Glowing Concentric Hearth Rings */}
            <div className="hero-image-bg-glow" aria-hidden="true" />

            {/* Pizza Lifted Out of Stone Oven with Molten Cheese Pull */}
            <div
              className="relative z-10 w-full max-w-[360px] sm:max-w-[420px] aspect-[4/3] rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.25)] group"
              style={{
                transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
                transition: "transform 0.25s cubic-bezier(0.2, 0, 0.2, 1)",
              }}
            >
              <Image
                src="/images/aura/wood-fired-hero.jpg"
                alt="Wood-fired pizza cheese pull from blazing stone oven - AURA PIZZA"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Oven glow overlay & gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

              {/* Badge on the frame */}
              <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-[11px] text-amber-300 font-bold bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-500/30">
                <span className="flex items-center gap-1.5 font-cairo">
                  <Flame className="w-3.5 h-3.5 text-[#ff8c00] fill-amber-400 animate-pulse" />
                  {language === "ar" ? "خَبز حجري حي (450° مئوية)" : "Live Wood-Fired Hearth (450°C)"}
                </span>
                <span className="text-emerald-400 font-cairo">● {language === "ar" ? "طازج ومقرمش" : "Crisp & Hot"}</span>
              </div>
            </div>

            {/* Floating Ingredient 1: San Marzano Tomato */}
            <div className="floating-element-1" title="طماطم سان مارزانو إيطالية">
              <div className="ingredient-circle-badge">🍅</div>
            </div>

            {/* Floating Ingredient 2: Mozzarella Cheese */}
            <div className="floating-element-2" title="جبنة موزاريلا ذائبة فاخرة">
              <div className="ingredient-circle-badge">🧀</div>
            </div>

            {/* Floating Ingredient 3: Fresh Basil Leaves */}
            <div className="floating-element-3" title="ريحان جينوفيزي طازج">
              <div className="ingredient-circle-badge">🌿</div>
            </div>
          </div>

          {/* ----------------- FAR RIGHT: OVERLAID GLASSMORPHIC FORM (3.5 Cols) ----------------- */}
          <div className="lg:col-span-3 z-20 w-full">
            <div className="glass-panel-luxury rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-2xl relative overflow-hidden border border-amber-500/20">
              {/* Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff8c00] to-transparent opacity-80" />

              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-400" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base font-cairo text-white">
                    {language === "ar" ? "استلمها ساخنة وطازجة" : "Get It Hot & Fresh"}
                  </h3>
                </div>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {language === "ar" ? "15 دقيقة" : "15 Mins"}
                </span>
              </div>

              {/* Delivery / Pickup Toggle */}
              <div className="bg-[#0c0e14]/90 p-1 rounded-2xl flex border border-white/5">
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    orderType === "delivery"
                      ? "bg-gradient-to-r from-[#ff8c00] to-[#dc3c14] text-white shadow-md"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  {language === "ar" ? "توصيل للمنزل" : "Delivery"}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    orderType === "pickup"
                      ? "bg-gradient-to-r from-[#ff8c00] to-[#dc3c14] text-white shadow-md"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  {language === "ar" ? "استلام من الفرع" : "Pickup"}
                </button>
              </div>

              {/* Address Input Bar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-300 font-cairo flex items-center justify-between">
                  <span>{orderType === "delivery" ? (language === "ar" ? "عنوان التوصيل" : "Delivery Address") : (language === "ar" ? "فرع الاستلام" : "Pickup Branch")}</span>
                  <span className="text-[10px] text-amber-400 font-normal">المكلا · فوه</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full ps-9 pe-3 py-2.5 bg-[#090b10] border border-white/10 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60 transition-all font-cairo"
                  />
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-300 font-cairo flex items-center justify-between">
                  <span>{language === "ar" ? "وقت الاستلام" : "Preparation Time"}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">{language === "ar" ? "فرن حجري مباشر" : "Live Oven"}</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedTime("asap")}
                    className={`py-2 px-2.5 rounded-xl border text-center font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      selectedTime === "asap"
                        ? "border-amber-500/60 bg-amber-500/15 text-amber-300 font-bold"
                        : "border-white/5 bg-[#090b10] text-stone-400 hover:text-white"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === "ar" ? "الآن (15 دقيقة)" : "ASAP (15m)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTime("later")}
                    className={`py-2 px-2.5 rounded-xl border text-center font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      selectedTime === "later"
                        ? "border-amber-500/60 bg-amber-500/15 text-amber-300 font-bold"
                        : "border-white/5 bg-[#090b10] text-stone-400 hover:text-white"
                    }`}
                  >
                    <span>{language === "ar" ? "جدولة وقت لاحق" : "Schedule"}</span>
                  </button>
                </div>
              </div>

              {/* High-Contrast "Find Nearest Branch / Order" Button */}
              <Link
                href="#menu"
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-[#ff8c00] to-[#dc2626] hover:shadow-[0_0_25px_rgba(255,140,0,0.7)] text-stone-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl uppercase tracking-wider font-cairo active:scale-95 transition-all text-center"
              >
                <Navigation className="w-4 h-4 text-stone-950" />
                <span>
                  {language === "ar" ? "اطلب من أقرب فرع" : "Find Nearest Branch"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          "SIGNATURE PIES" GRID SECTION (Bottom 4 Circular High-Contrast Cards)
      ========================================================================= */}
      <section className="relative z-20 border-t border-amber-500/15 bg-[#090a0f]/90 backdrop-blur-xl py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 font-cairo">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === "ar" ? "تشكيلة التوقيع الحرفية" : "SIGNATURE PIES"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-playfair tracking-tight">
                {language === "ar" ? "أصناف بيتزا أورا المختارة" : "Artisanal Signature Creations"}
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group font-cairo"
            >
              <span>{language === "ar" ? "عرض القائمة الكاملة" : "Explore All Pies"}</span>
              <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>

          {/* 4 Gorgeously Detailed Circular Pizza Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {signaturePies.map((pie) => (
              <div
                key={pie.id}
                className="group relative glass-panel-luxury rounded-3xl p-5 flex flex-col justify-between border border-white/10 hover:border-amber-500/40 hover:shadow-[0_15px_40px_rgba(245,158,11,0.22)] transition-all duration-300"
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
                    {language === "ar" ? pie.badgeAr : pie.badge}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{pie.rating}</span>
                  </div>
                </div>

                {/* Circular Pizza Image with Dark Blurred Plate */}
                <div className="relative my-2 w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 via-[#dc3c14]/10 to-transparent blur-md group-hover:blur-lg transition-all" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/15 shadow-2xl group-hover:scale-105 group-hover:rotate-6 transition-all duration-500">
                    <Image
                      src={pie.image}
                      alt={language === "ar" ? pie.nameAr : pie.nameEn}
                      fill
                      sizes="220px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mt-3">
                  <h3 className="font-black text-base sm:text-lg text-white font-playfair group-hover:text-amber-400 transition-colors">
                    {language === "ar" ? pie.nameAr : pie.nameEn}
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed line-clamp-2 font-cairo">
                    {language === "ar" ? pie.descAr : pie.descEn}
                  </p>
                </div>

                {/* Pricing & Glowing Add (+) Button */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10">
                  <div>
                    <div className="text-lg sm:text-xl font-black text-amber-400 font-playfair">
                      {pie.priceYER}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      {pie.priceUSD} · {language === "ar" ? "طازج بالفرن" : "Stone-Baked"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSignaturePie(pie)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-[#ff8c00] to-[#dc2626] hover:shadow-[0_0_20px_rgba(255,140,0,0.8)] text-white flex items-center justify-center font-bold active:scale-90 transition-all hover:scale-110 shadow-lg shadow-orange-950/60"
                    title={language === "ar" ? "أضف إلى السلة" : "Add to Order"}
                    aria-label={`Add ${pie.nameEn} to cart`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OPERATIONAL STATUS SUB-BAR ================= */}
      <div className="w-full bg-[#050608] border-t border-amber-500/10 py-2.5 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
          {/* Live Operational Status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                opStatus.status === "OPEN_FOR_ORDERING"
                  ? "bg-emerald-400 animate-pulse"
                  : opStatus.status === "CLOSING_SOON"
                  ? "bg-amber-400 animate-ping"
                  : "bg-stone-500"
              }`}
            />
            <span className="font-bold text-white font-cairo">
              {language === "ar" ? opStatus.badgeLabelAr : opStatus.badgeLabelEn}
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold font-cairo">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === "ar" ? "المكلا · فوه · حي المساكن" : "Mukalla · Fuwa"}</span>
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[#ff8c00] font-bold font-cairo flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ff8c00]" />
              {language === "ar" ? "فرن حجري 15 دقيقة" : "Stone-baked 15m"}
            </span>
          </div>

          {/* Direct Hotline */}
          <div className="flex items-center gap-3">
            <a
              href="tel:05375561"
              className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors"
              title="اتصال مباشر"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#ff8c00]" />
              <span className="font-outfit font-bold tracking-wider text-amber-400">
                05375561
              </span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href="https://wa.me/967772207788"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-stone-300 hover:text-emerald-400 transition-colors"
              title="واتساب مباشر"
            >
              <span className="text-emerald-400 font-bold">
                {language === "ar" ? "واتساب: 772207788" : "WhatsApp: 772207788"}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* ================= VIDEO MODAL ================= */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#0f1118] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold font-cairo">
                <Flame className="w-4 h-4 text-[#ff8c00] fill-amber-400" />
                <span>
                  {language === "ar"
                    ? "أسرار الخَبز الحجري الفاخر — AURA PIZZA"
                    : "The Wood-Fired Hearth Craft — AURA PIZZA"}
                </span>
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

            {/* Video Container */}
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
