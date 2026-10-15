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

  const MAP_URL = "https://www.google.com/maps/search/?api=1&query=Mukalla";
  const MAP_EMBED =
    "https://www.google.com/maps?q=Mukalla,Yemen&output=embed";
  const DIRECTIONS_URL =
    "https://www.google.com/maps/dir/?api=1&destination=14.5425,49.1242";

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(
        `مطعم بيتزا نوڤا (Pizza Nova) - المكلا، وسط المدينة. موقعنا على الخريطة: ${MAP_URL} - هاتف: 05-000000 / واتساب: 700000000`
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
          title: "مطعم بيتزا نوڤا | Pizza Nova",
          text: "موقع مطعم بيتزا نوڤا على خرائط Google - تفضل بزيارتنا أو اطلب مسبقاً!",
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
      badgeId: "Keluarga & Wanita",
    },
    {
      id: "youth",
      title: loc.youthHall,
      desc: loc.youthHallDesc,
      icon: Building2,
      badgeAr: "صالة شباب",
      badgeEn: "Youth Hall",
      badgeId: "Ruang Pemuda",
    },
    {
      id: "outdoor",
      title: loc.outdoorArea,
      desc: loc.outdoorAreaDesc,
      icon: Compass,
      badgeAr: "جلسات خارجية",
      badgeEn: "Outdoor",
      badgeId: "Area Terbuka",
    },
    {
      id: "pickup",
      title: loc.pickupCounter,
      desc: loc.pickupCounterDesc,
      icon: Store,
      badgeAr: "استلام فوري",
      badgeEn: "Fast Pickup",
      badgeId: "Ambil Cepat",
    },
  ];

  const phones = [
    {
      label: language === "ar" ? "الهاتف الثابت" : language === "id" ? "Telepon Rumah" : "Landline",
      number: "05-000000",
      href: "tel:05000000",
      network: "Landline",
    },
    {
      label: language === "ar" ? "واتساب ويمن موبايل" : language === "id" ? "WhatsApp / Yemen Mobile" : "WhatsApp / Yemen Mobile",
      number: "700000000",
      href: "https://novixa.dev/ar/contact",
      network: "WhatsApp & Mobile",
      primary: true,
    },
    {
      label: language === "ar" ? "شبكة يو (MTN)" : language === "id" ? "Jaringan YOU" : "YOU Network",
      number: "700000001",
      href: "tel:0700000001",
      network: "YOU",
    },
    {
      label: language === "ar" ? "شبكة سبأفون" : language === "id" ? "Jaringan Sabafon" : "Sabafon",
      number: "700000002",
      href: "tel:0700000002",
      network: "Sabafon",
    },
  ];

  const instagramPosts = [
    {
      title: language === "ar" ? "بيتزا سوبر سوبريم إيطالية" : language === "id" ? "Pizza Super Supreme Italia" : "Super Supreme Stone Pizza",
      desc: language === "ar" ? "مخبوزة بجبنة موزاريلا فاخرة وخضار طازجة" : language === "id" ? "Dipanggang dengan keju mozzarella premium & sayuran segar" : "Baked with fine mozzarella and fresh veg",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
    },
    {
      title: language === "ar" ? "فطيرة دجاج وجبن عكاوي" : language === "id" ? "Fatayer Ayam & Keju Akawi" : "Chicken & Akawi Fatayer",
      desc: language === "ar" ? "عجينة مقرمشة من أفران الصباح الباكر" : language === "id" ? "Adonan renyah dari oven pagi hari kami" : "Golden dough from our morning ovens",
      img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
    },
    {
      title: language === "ar" ? "الصلصات المميزة والرانش" : language === "id" ? "Saus Khas & Cocolan Ranch" : "Signature Sauces & Dips",
      desc: language === "ar" ? "ثومية كريمية، هلابينو حار، صوص فرنسي" : language === "id" ? "Bawang putih krimi, jalapeno pedas, saus ranch" : "Creamy garlic, spicy jalapeno, ranch",
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
                  {language === "ar" ? "تم النسخ" : language === "id" ? "Tersalin" : "Copied"}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-400" />
                <span>{language === "ar" ? "نسخ" : language === "id" ? "Salin" : "Copy"}</span>
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
                  {language === "ar" ? "تم نسخ الرابط" : language === "id" ? "Tautan Tersalin" : "Link Copied"}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-stone-400" />
                <span>{language === "ar" ? "مشاركة" : language === "id" ? "Bagikan" : "Share"}</span>
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
              title="Pizza Nova Location Google Map"
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
                    {language === "ar" ? "بيتزا نوڤا | المكلا - وسط المدينة" : "Pizza Nova | Mukalla - City Center"}
                  </h4>
                  <p className="text-[11px] text-stone-300 font-cairo">
                    {language === "ar"
                      ? "وسط المدينة - عنوان تجريبي لأغراض العرض"
                      : language === "id"
                      ? "Pusat kota - alamat demo"
                      : "City center - demo address"}
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
                {language === "ar" ? "إرشادات الوصول السريع:" : language === "id" ? "Petunjuk Arah Cepat:" : "Quick Route Guidance:"}
              </span>
              <span>
                {language === "ar"
                  ? "العنوان المعروض هنا تجريبي لأغراض العرض. عند تخصيص النظام لمطعمك نضع عنوانك الفعلي وإرشادات الوصول ونقطة موقعك على الخريطة."
                  : language === "id"
                  ? "Alamat ini adalah contoh demo. Saat sistem disesuaikan untuk restoran Anda, kami menambahkan alamat, petunjuk arah, dan pin peta asli."
                  : "This address is a demo placeholder. When the system is customized for your restaurant, we add your real address, directions and map pin."}
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
              <span className="text-[11px] text-stone-400 font-outfit">Mukalla, City Center</span>
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
              <span>{language === "ar" ? "جدول الفترات المعتمد" : language === "id" ? "Jadwal Jam Kerja Resmi" : "Official Operating Hours"}</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#0c0e12] border border-[#222934]">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">
                    {language === "ar" ? "السبت – الخميس (الفترة الصباحية)" : language === "id" ? "Sabtu – Kamis (Sesi Pagi)" : "Sat – Thu (Morning Shift)"}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {language === "ar" ? "فطائر طازجة، معجنات، فطور" : language === "id" ? "Fatayer segar, pastri & sarapan" : "Fresh Fatayer & breakfast bakes"}
                  </span>
                </div>
                <span className="font-outfit font-bold text-[#EFCC80] text-xs">
                  {language === "ar" ? "8:00 ص – 12:00 م" : "8:00 AM – 12:00 PM"}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#0c0e12] border border-amber-500/20">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#EFCC80] block">
                    {language === "ar" ? "السبت – الخميس (الفترة المسائية)" : language === "id" ? "Sabtu – Kamis (Sesi Sore)" : "Sat – Thu (Evening Shift)"}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {language === "ar" ? "بيتزا الفرن الحجري، عشاء، كالتشوني" : language === "id" ? "Pizza oven batu, makan malam, calzone" : "Stone-oven pizza, calzones, dinner"}
                  </span>
                </div>
                <span className="font-outfit font-bold text-[#EFCC80] text-xs">
                  {language === "ar" ? "4:00 م – 11:30 م" : "4:00 PM – 11:30 PM"}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#0c0e12] border border-[#222934]">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">
                    {language === "ar" ? "يوم الجمعة (مساءً فقط)" : language === "id" ? "Hari Jumat (Sore Saja)" : "Friday (Evening Only)"}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {language === "ar" ? "خدمة العشاء والبيتزا" : language === "id" ? "Layanan makan malam & pizza" : "Evening dinner & pizza service"}
                  </span>
                </div>
                <span className="font-outfit font-bold text-[#EFCC80] text-xs">
                  {language === "ar" ? "4:00 م – 11:30 م" : "4:00 PM – 11:30 PM"}
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
                    {language === "ar" ? item.badgeAr : language === "id" ? item.badgeId : item.badgeEn}
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

      {/* Official Instagram @novixa Showcase Banner */}
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
              href="https://www.facebook.com/profile.php?id=61594556255556"
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
                href="https://www.facebook.com/profile.php?id=61594556255556"
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
