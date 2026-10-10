"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Phone,
  Clock,
  Instagram,
  Sparkles,
  Users,
  Heart,
  Store,
  Compass,
  Building2,
  ChevronRight,
  Flame,
} from "lucide-react";

export default function LocationAndMapSection() {
  const { language, dict } = useApp();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const loc = dict.location;

  const MAP_URL = "https://maps.app.goo.gl/zre73sxKGyM27KvE6";
  const MAP_EMBED =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.921954946859!2d49.044484499999996!3d14.489169599999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3de8e1986e8cba9d%3A0x375ce5e3654e4040!2z2KjZitiq2LLYpyDZh9in2YjYsw!5e0!3m2!1sen!2ssa!4v1791336550065!5m2!1sen!2ssa";
  const DIRECTIONS_URL =
    "https://www.google.com/maps/dir/?api=1&destination=14.4891696,49.0444845";

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(
        `مطعم بيتزا هاوس المكلا (Pizza House) - المكلا، فوه حي المساكن. موقعنا على الخريطة: ${MAP_URL} - هاتف: 05-375561 / واتساب: 772207788`
      );
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleShareLocation = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "مطعم بيتزا هاوس المكلا | Pizza House Mukalla",
          text: "موقع مطعم بيتزا هاوس على خرائط Google - تفضل بزيارتنا أو اطلب مسبقاً!",
          url: MAP_URL,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }
    // Fallback
    try {
      await navigator.clipboard.writeText(MAP_URL);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    } catch {
      // ignore
    }
  };

  const amenities = [
    {
      id: "family",
      title: loc.familyHall,
      desc: loc.familyHallDesc,
      icon: Users,
      badgeAr: "عوائل ونساء",
      badgeEn: "Families",
    },
    {
      id: "youth",
      title: loc.youthHall,
      desc: loc.youthHallDesc,
      icon: Building2,
      badgeAr: "صالة شباب",
      badgeEn: "Youth Hall",
    },
    {
      id: "outdoor",
      title: loc.outdoorArea,
      desc: loc.outdoorAreaDesc,
      icon: Compass,
      badgeAr: "جلسات خارجية",
      badgeEn: "Outdoor",
    },
    {
      id: "pickup",
      title: loc.pickupCounter,
      desc: loc.pickupCounterDesc,
      icon: Store,
      badgeAr: "استلام فوري",
      badgeEn: "Fast Pickup",
    },
  ];

  const phones = [
    {
      label: language === "ar" ? "الهاتف الثابت" : "Landline",
      number: "05-375561",
      href: "tel:05375561",
      network: "Landline",
    },
    {
      label: language === "ar" ? "واتساب ويمن موبايل" : "WhatsApp / Yemen Mobile",
      number: "772207788",
      href: "https://wa.me/967772207788",
      network: "WhatsApp & Mobile",
      primary: true,
    },
    {
      label: language === "ar" ? "شبكة يو (MTN)" : "YOU Network",
      number: "738227788",
      href: "tel:0738227788",
      network: "YOU",
    },
    {
      label: language === "ar" ? "شبكة سبأفون" : "Sabafon",
      number: "711227788",
      href: "tel:0711227788",
      network: "Sabafon",
    },
  ];

  const instagramPosts = [
    {
      title: language === "ar" ? "بيتزا سوبر سوبريم إيطالية" : "Super Supreme Stone Pizza",
      desc: language === "ar" ? "مخبوزة بجبنة موزاريلا فاخرة وخضار طازجة" : "Baked with fine mozzarella and fresh veg",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
    },
    {
      title: language === "ar" ? "فطيرة دجاج وجبن عكاوي" : "Chicken & Akawi Fatayer",
      desc: language === "ar" ? "عجينة مقرمشة من أفران الصباح الباكر" : "Golden dough from our morning ovens",
      img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
    },
    {
      title: language === "ar" ? "الصلصات المميزة والرانش" : "Signature Sauces & Dips",
      desc: language === "ar" ? "ثومية كريمية، هلابينو حار، صوص فرنسي" : "Creamy garlic, spicy jalapeno, ranch",
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
    },
  ];

  return (
    <section id="branches" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-8 relative z-20 font-cairo">
      {/* Header section with clean unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#222934] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#EFCC80]">
            <MapPin className="w-4 h-4 text-[#C69843]" />
            <span>{loc.mapBadge}</span>
            <span className="text-stone-600">·</span>
            <span className="font-outfit text-amber-400">{loc.plusCode}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-cairo">
            {loc.title}
          </h2>
          <p className="text-sm text-stone-400 leading-relaxed font-cairo">
            {loc.subtitle}
          </p>
        </div>

        {/* Action buttons for quick map navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={MAP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-amber-950/40 active:scale-95 transition-all font-cairo"
          >
            <Navigation className="w-4 h-4 text-[#2C1A04]" />
            <span>{loc.openInGoogleMaps}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#14181f] hover:bg-[#1a202c] text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-[#222934] hover:border-amber-500/30 transition-colors font-cairo"
          >
            <Compass className="w-4 h-4 text-[#C69843]" />
            <span>{loc.getDirections}</span>
          </a>

          <button
            onClick={handleCopyAddress}
            type="button"
            className="inline-flex items-center gap-1.5 bg-[#14181f] hover:bg-[#1a202c] text-stone-300 hover:text-white px-3 py-2.5 rounded-xl text-xs font-medium border border-[#222934] transition-colors font-cairo"
            title={loc.copyAddress}
          >
            {copiedAddress ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">
                  {language === "ar" ? "تم النسخ" : "Copied"}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-400" />
                <span>{language === "ar" ? "نسخ" : "Copy"}</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareLocation}
            type="button"
            className="inline-flex items-center gap-1.5 bg-[#14181f] hover:bg-[#1a202c] text-stone-300 hover:text-white px-3 py-2.5 rounded-xl text-xs font-medium border border-[#222934] transition-colors font-cairo"
            title={loc.shareLocation}
          >
            {shareFeedback ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">
                  {language === "ar" ? "تم نسخ الرابط" : "Link Copied"}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-stone-400" />
                <span>{language === "ar" ? "مشاركة" : "Share"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Location Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Google Map Embed Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-[#222934] shadow-2xl bg-[#0c0e12] aspect-[16/11] sm:aspect-[16/10]">
            <iframe
              src={MAP_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Pizza House Mukalla Location Google Map"
              className="w-full h-full grayscale-[0.05] contrast-[1.05]"
            />

            {/* Floating Map Info Capsule */}
            <div className="absolute bottom-3 start-3 end-3 sm:start-4 sm:end-auto bg-[#090b10]/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-amber-500/25 shadow-xl flex items-center justify-between gap-4 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shrink-0 font-bold shadow-md shadow-amber-950/40">
                  <MapPin className="w-5 h-5 text-[#2C1A04]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-cairo">
                    {language === "ar" ? "بيتزا هاوس | المكلا - فوه" : "Pizza House | Mukalla - Fuwa"}
                  </h4>
                  <p className="text-[11px] text-stone-300 font-cairo">
                    {language === "ar"
                      ? "حي المساكن - بعد جامعة الأحقاف ومستوصف النور"
                      : "Al-Masaken - near Al-Ahgaff Univ & Al-Noor"}
                  </p>
                </div>
              </div>
              <a
                href={MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 text-[#EFCC80] p-2 rounded-xl transition-colors shrink-0"
                title="فتح في Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Detailed Street Landmarks description */}
          <div className="bg-[#14181f] p-4 sm:p-5 rounded-2xl border border-[#222934] flex items-start gap-3.5 text-xs text-stone-300 leading-relaxed font-cairo">
            <Compass className="w-5 h-5 text-[#C69843] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">
                {language === "ar" ? "إرشادات الوصول السريع:" : "Quick Route Guidance:"}
              </span>
              <span>
                {language === "ar"
                  ? "عند الدخول إلى فوه من الخط الدائري العام باتجاه حي المساكن، تجاوز مجمع كليات جامعة الأحقاف، وبمجرد الوصول إلى مستوصف النور انعطف يميناً مباشرة لتجد المطعم بواجهته المميزة ومواقف السيارات المريحة."
                  : "Entering Fuwa via the main artery towards Al-Masaken district, pass Al-Ahgaff University campus; right after Al-Noor Dispensary take an immediate right turn to find Pizza House with convenient parking."}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Numbers & Operating Hours */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Phone & Ordering Numbers Card */}
          <div className="bg-[#14181f] rounded-3xl p-6 border border-[#222934] shadow-xl space-y-4 font-cairo">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-cairo flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C69843]" />
                <span>{loc.phonesList}</span>
              </h3>
              <span className="text-[11px] text-stone-400 font-outfit">Mukalla, Fuwa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {phones.map((p, idx) => (
                <a
                  key={idx}
                  href={p.href}
                  target={p.href.startsWith("http") ? "_blank" : undefined}
                  rel={p.href.startsWith("http") ? "noreferrer" : undefined}
                  className={`p-3 rounded-2xl border flex flex-col gap-1 transition-all active:scale-95 ${
                    p.primary
                      ? "bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400"
                      : "bg-[#0c0e12] border-[#222934] hover:border-amber-500/30"
                  }`}
                >
                  <span className="text-[10px] text-stone-400 font-medium">
                    {p.label}
                  </span>
                  <span
                    className={`font-outfit font-bold text-sm tracking-wider ${
                      p.primary ? "text-emerald-300" : "text-white"
                    }`}
                  >
                    {p.number}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Working Hours Card */}
          <div className="bg-[#14181f] rounded-3xl p-6 border border-[#222934] shadow-xl space-y-4 font-cairo">
            <h3 className="text-base font-bold text-white font-cairo flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{language === "ar" ? "جدول الفترات المعتمد" : "Official Operating Hours"}</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#0c0e12] border border-[#222934]">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">
                    {language === "ar" ? "السبت – الخميس (الفترة الصباحية)" : "Sat – Thu (Morning Shift)"}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {language === "ar" ? "فطائر طازجة، معجنات، فطور" : "Fresh Fatayer & breakfast bakes"}
                  </span>
                </div>
                <span className="font-outfit font-bold text-[#EFCC80] text-xs">
                  8:00 ص – 12:00 م
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#0c0e12] border border-amber-500/20">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#EFCC80] block">
                    {language === "ar" ? "السبت – الخميس (الفترة المسائية)" : "Sat – Thu (Evening Shift)"}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {language === "ar" ? "بيتزا الفرن الحجري، عشاء، كالتشوني" : "Stone-oven pizza, calzones, dinner"}
                  </span>
                </div>
                <span className="font-outfit font-bold text-[#EFCC80] text-xs">
                  4:00 م – 11:30 م
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#0c0e12] border border-[#222934]">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">
                    {language === "ar" ? "يوم الجمعة (مساءً فقط)" : "Friday (Evening Only)"}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {language === "ar" ? "خدمة العشاء والبيتزا" : "Evening dinner & pizza service"}
                  </span>
                </div>
                <span className="font-outfit font-bold text-[#EFCC80] text-xs">
                  4:00 م – 11:30 م
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hall Amenities & Services Grid */}
      <div className="space-y-4 pt-4 font-cairo">
        <h3 className="text-xl font-black text-white font-cairo">
          {loc.hallAmenities}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {amenities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#14181f] p-5 rounded-2xl border border-[#222934] shadow-lg space-y-2.5 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#0c0e12] border border-amber-500/20 flex items-center justify-center text-[#EFCC80]">
                    <Icon className="w-5 h-5 text-[#C69843]" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0c0e12] text-[#EFCC80] border border-[#222934]">
                    {language === "ar" ? item.badgeAr : item.badgeEn}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-cairo">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed font-cairo">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Instagram @pizza_house66 Showcase Banner */}
      <div className="bg-gradient-to-r from-[#14181f] via-[#1a202c] to-[#14181f] text-white rounded-3xl p-6 sm:p-8 border border-amber-500/25 shadow-2xl relative overflow-hidden font-cairo">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222934] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Instagram className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black font-cairo">
                    {loc.instagramTitle}
                  </h3>
                  <span className="text-xs font-outfit text-amber-400 font-bold">
                    {loc.instagramHandle}
                  </span>
                </div>
                <p className="text-xs text-stone-400 max-w-xl font-cairo">
                  {loc.instagramDesc}
                </p>
              </div>
            </div>

            <a
              href="https://www.instagram.com/pizza_house66/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 font-black px-6 py-3 rounded-2xl text-xs shadow-lg shadow-amber-950/40 transition-transform active:scale-95 whitespace-nowrap font-cairo"
            >
              <Instagram className="w-4 h-4 text-[#2C1A04]" />
              <span>{loc.instagramAction}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Mini preview food showcase from Instagram highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {instagramPosts.map((post, idx) => (
              <a
                key={idx}
                href="https://www.instagram.com/pizza_house66/"
                target="_blank"
                rel="noreferrer"
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#222934] bg-[#0c0e12] block hover:border-amber-500/40 transition-colors"
              >
                <Image
                  src={post.img}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-3 start-3 end-3 space-y-0.5">
                  <h5 className="text-xs font-bold font-cairo text-white">
                    {post.title}
                  </h5>
                  <p className="text-[10px] text-stone-300 line-clamp-1 font-cairo">
                    {post.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
