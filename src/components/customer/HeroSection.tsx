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
} from "lucide-react";

interface HeroSectionProps {
  language: string;
  opStatus: {
    status: string;
    badgeLabelAr: string;
    badgeLabelEn: string;
  };
}

export default function HeroSection({ language, opStatus }: HeroSectionProps) {
  // Animated stats counter
  const [stats, setStats] = useState({ orders: 0, customers: 0, years: 0 });
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // easeOutExpo for realistic fast-then-settle count
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setStats({
        orders: Math.floor(ease * 500),
        customers: Math.floor(ease * 15000),
        years: Math.floor(ease * 15),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Subtle interactive parallax effect on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 22;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 22;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const isRtl = language === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full relative overflow-hidden bg-[#0a0a0a] text-white -mt-4 sm:-mt-6 border-b border-[#1f2530] shadow-2xl">
      {/* ================= BACKGROUND GLOW PULSE ================= */}
      <div className="hero-bg-effects" aria-hidden="true" />

      {/* ================= SMOKE EFFECT ================= */}
      <div className="smoke-container" aria-hidden="true">
        <div className="smoke" />
        <div className="smoke" />
        <div className="smoke" />
        <div className="smoke" />
        <div className="smoke" />
      </div>

      {/* ================= MAIN HERO CONTAINER ================= */}
      <section
        id="home"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 min-h-[85vh] flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* ----------------- LEFT / RIGHT CONTENT COLUMN (7 Cols) ----------------- */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start space-y-6 z-20">
            {/* Top Badge */}
            <div className="hero-badge animate-fade-in-up">
              <span className="dot" />
              <span className="font-semibold text-xs sm:text-sm tracking-wide">
                {language === "ar"
                  ? "طازجة يومياً - جودة إيطالية أصيلة"
                  : "Fresh Daily - Authentic Italian Quality"}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-cairo leading-[1.15] tracking-tight">
              {language === "ar" ? (
                <>
                  بيتزا إيطالية
                  <br />
                  <span className="hero-title-highlight font-playfair">
                    طازجة ولذيذة
                  </span>
                </>
              ) : (
                <>
                  Italian Pizza
                  <br />
                  <span className="hero-title-highlight font-playfair">
                    Fresh & Delicious
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed font-cairo">
              {language === "ar"
                ? "استمتع بأشهى أنواع البيتزا الإيطالية المحضرة بعناية فائقة من أجود المكونات الطازجة، مع عجينة مخمّرة يدوياً وصلصة طماطم خاصة على الحجر الطبيعي"
                : "Experience handcrafted Italian pizza baked to golden perfection on natural stone, featuring freshly fermented dough and our signature herb sauce"}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="#menu"
                className="hero-btn-primary group"
              >
                <span>{language === "ar" ? "استكشف القائمة" : "Explore Menu"}</span>
                <ArrowIcon className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="hero-btn-secondary group"
              >
                <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#ff8c00]/20 flex items-center justify-center text-[#ff8c00] transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>{language === "ar" ? "شاهد الفيديو" : "Watch Video"}</span>
              </button>
            </div>

            {/* Live Counter Stats */}
            <div className="grid grid-cols-3 gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-white/10 w-full max-w-lg">
              <div className="text-center lg:text-start">
                <div className="text-2xl sm:text-4xl font-black text-[#ff8c00] font-playfair tracking-tight">
                  {stats.orders.toLocaleString(language === "ar" ? "ar-EG" : "en-US")}+
                </div>
                <div className="text-xs sm:text-sm text-white/50 uppercase tracking-wider mt-1 font-cairo">
                  {language === "ar" ? "طلب يومي" : "Daily Orders"}
                </div>
              </div>

              <div className="text-center lg:text-start">
                <div className="text-2xl sm:text-4xl font-black text-[#ff8c00] font-playfair tracking-tight">
                  {stats.customers.toLocaleString(language === "ar" ? "ar-EG" : "en-US")}+
                </div>
                <div className="text-xs sm:text-sm text-white/50 uppercase tracking-wider mt-1 font-cairo">
                  {language === "ar" ? "عميل سعيد" : "Happy Clients"}
                </div>
              </div>

              <div className="text-center lg:text-start">
                <div className="text-2xl sm:text-4xl font-black text-[#ff8c00] font-playfair tracking-tight">
                  {stats.years.toLocaleString(language === "ar" ? "ar-EG" : "en-US")}+
                </div>
                <div className="text-xs sm:text-sm text-white/50 uppercase tracking-wider mt-1 font-cairo">
                  {language === "ar" ? "سنة خبرة" : "Years Experience"}
                </div>
              </div>
            </div>
          </div>

          {/* ----------------- RIGHT / LEFT PIZZA IMAGE COLUMN (5 Cols) ----------------- */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
            {/* Glowing Backdrop Circle */}
            <div className="hero-image-bg-glow" aria-hidden="true" />

            {/* Interactive Floating Pizza */}
            <div
              className="relative z-10 w-[300px] sm:w-[420px] lg:w-[480px] aspect-square flex items-center justify-center"
              style={{
                transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
                transition: "transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)",
              }}
            >
              <Image
                src="/pizza-hero-cutout.png"
                alt="بيتزا إيطالية طازجة - بيتزا هاوس"
                width={520}
                height={520}
                priority
                className="pizza-hero-img-floating select-none pointer-events-none drop-shadow-[0_35px_50px_rgba(0,0,0,0.8)]"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes("pngimg.com")) {
                    target.src = "https://pngimg.com/d/pizza_PNG44077.png";
                  }
                }}
              />
            </div>

            {/* Floating Ingredient 1: Tomato */}
            <div className="floating-element-1" title="طماطم طازجة">
              <div className="ingredient-circle-badge">🍅</div>
            </div>

            {/* Floating Ingredient 2: Cheese */}
            <div className="floating-element-2" title="جبنة موزاريلا ذائبة">
              <div className="ingredient-circle-badge">🧀</div>
            </div>

            {/* Floating Ingredient 3: Basil Herb */}
            <div className="floating-element-3" title="ريحان إيطالي طازج">
              <div className="ingredient-circle-badge">🌿</div>
            </div>

            {/* Customer Rating Badge */}
            <div className="absolute bottom-2 sm:bottom-6 left-2 sm:left-4 bg-[#14181f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-4 z-20 shadow-2xl flex items-center gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[#f5a623] text-sm sm:text-base">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
                <div className="text-xs text-white/80 mt-1 font-cairo">
                  <strong className="text-white text-sm font-bold">4.9</strong> / 5.0 —{" "}
                  {language === "ar" ? "أكثر من 2,500 تقييم" : "2,500+ Reviews"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= OPERATIONAL STATUS SUB-BAR ================= */}
      <div className="w-full bg-[#0d151b] border-t border-[#1f2530] py-2.5 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300">
          {/* Live Operational Status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                opStatus.status === "OPEN_FOR_ORDERING"
                  ? "bg-emerald-400 animate-pulse"
                  : opStatus.status === "CLOSING_SOON"
                  ? "bg-amber-300 animate-ping"
                  : "bg-stone-400"
              }`}
            />
            <span className="font-bold text-white font-cairo">
              {language === "ar" ? opStatus.badgeLabelAr : opStatus.badgeLabelEn}
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1 text-amber-300 font-semibold font-cairo">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "ar" ? "المكلا · فوه · حي المساكن" : "Mukalla · Fuwa"}</span>
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[#ff8c00] font-bold font-cairo flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ff8c00]" />
              {language === "ar" ? "فرن حجري 15 دقيقة" : "Stone-baked 15m"}
            </span>
          </div>

          {/* Direct Phone & Ordering Hotline */}
          <div className="flex items-center gap-3">
            <a
              href="tel:05375561"
              className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors"
              title="اتصال مباشر"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#ff8c00]" />
              <span className="font-outfit font-bold tracking-wider text-amber-300">
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
          <div className="relative w-full max-w-3xl bg-[#14181f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold font-cairo">
                <Play className="w-4 h-4 text-[#ff8c00] fill-current" />
                <span>
                  {language === "ar"
                    ? "قصة الشغف والفرن الحجري — بيتزا هاوس"
                    : "The Artisanal Stone-Oven Story"}
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

            {/* Video Container with Responsive 16:9 Aspect */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/1-SJGQ2HLp8?autoplay=1&mute=0"
                title="Pizza House Artisanal Video"
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
