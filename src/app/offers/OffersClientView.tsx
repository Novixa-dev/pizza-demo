"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getCustomerLoyaltyAction } from "@/app/actions/couponActions";
import {
  Sparkles,
  Tag,
  Gift,
  Award,
  Copy,
  Check,
  Share2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Phone,
  Search,
  Percent,
  TrendingUp,
  Pizza,
} from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  titleId?: string | null;
  descriptionAr: string;
  descriptionEn: string;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_ITEM";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  freeItemNameAr?: string | null;
  freeItemNameEn?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isFirstOrderOnly: boolean;
  startDate: string | Date;
  endDate?: string | Date | null;
  isActive: boolean;
}

interface AutomaticGiftItem {
  id: string;
  tierNameAr: string;
  tierNameEn: string;
  tierNameId?: string | null;
  minSpend: number;
  giftItemNameAr: string;
  giftItemNameEn: string;
  giftItemNameId?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
}

interface OffersClientViewProps {
  initialCoupons: CouponItem[];
  initialGifts: AutomaticGiftItem[];
}

export default function OffersClientView({
  initialCoupons = [],
  initialGifts = [],
}: OffersClientViewProps) {
  const { language, dict } = useApp();
  const [activeTab, setActiveTab] = useState<"all" | "coupons" | "gifts" | "loyalty">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Loyalty lookup state
  const [loyaltyPhone, setLoyaltyPhone] = useState("");
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [loyaltyResult, setLoyaltyResult] = useState<any | null>(null);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2500);
    }
  };

  const handleCheckLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoyaltyError(null);
    setLoyaltyResult(null);

    const cleanPhone = loyaltyPhone.trim().replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 7) {
      setLoyaltyError(
        language === "ar"
          ? "يرجى إدخال رقم هاتف صحيح للبحث"
          : language === "id"
          ? "Silakan masukkan nomor telepon yang valid"
          : "Please enter a valid phone number"
      );
      return;
    }

    setLoyaltyLoading(true);
    try {
      const res = await getCustomerLoyaltyAction(cleanPhone);
      if (res.success && res.loyalty) {
        setLoyaltyResult(res.loyalty);
      } else {
        setLoyaltyError(
          res.message ||
            (language === "ar"
              ? "تعذر العثور على سجلات ولاء لهذا الرقم"
              : language === "id"
              ? "Catatan loyalitas tidak ditemukan untuk nomor ini"
              : "No loyalty records found for this phone")
        );
      }
    } catch {
      setLoyaltyError(
        language === "ar"
          ? "حدث خطأ أثناء فحص سجل الولاء"
          : language === "id"
          ? "Terjadi kesalahan saat memeriksa poin loyalitas"
          : "An error occurred while checking loyalty stamps"
      );
    } finally {
      setLoyaltyLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const shareText =
      language === "ar"
        ? `🔥 عروض وتخفيضات بيتزا نوڤا الحصرية!\nاستخدم كود WELCOME10 للحصول على خصم 10%، بالإضافة لهدايا مجانية عند الطلب!\nتصفح العروض الآن:`
        : language === "id"
        ? `🔥 Promo & Kupon Spesial Pizza Nova!\nGunakan kupon WELCOME10 untuk diskon 10% dan dapatkan hadiah gratis!\nLihat promo lengkap:`
        : `🔥 Exclusive Pizza Nova Offers & Coupons!\nUse WELCOME10 for 10% discount plus free gifts on eligible orders!\nBrowse offers:`;

    const url = typeof window !== "undefined" ? window.location.href : "/offers";
    const fullMessage = encodeURIComponent(`${shareText}\n${url}`);
    window.open(`https://wa.me/?text=${fullMessage}`, "_blank");
  };

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo py-8 sm:py-12">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14181f] via-[#0c0e14] to-[#1a150b] border border-[#C69843]/30 p-6 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EFCC80]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFCC80]/15 border border-[#EFCC80]/30 text-[#EFCC80] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{dict.offers.badge}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {dict.offers.title}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {dict.offers.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 bg-[#1b222c] hover:bg-[#252f3d] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{dict.offers.shareOffers}</span>
            </button>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 text-[#2C1A04] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-[#EFCC80]/20 transition-all active:scale-95"
            >
              <span>{dict.hero.primaryCta}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-8 pt-6 border-t border-[#222934] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-stone-300">
            <div className="w-7 h-7 rounded-lg bg-[#EFCC80]/15 text-[#EFCC80] flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <span>
              {language === "ar"
                ? "كوبونات خصم فورية عند إتمام الطلب"
                : language === "id"
                ? "Diskon instan kupon saat checkout"
                : "Instant coupon discounts at checkout"}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-stone-300">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <span>
              {language === "ar"
                ? "هدايا تلقائية للأوردرات فوق 12,000 ر.ي"
                : language === "id"
                ? "Hadiah gratis untuk pesanan di atas 12.000 YER"
                : "Free gifts for orders above 12,000 YER"}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-stone-300">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <span>
              {language === "ar"
                ? "مكافأة صنف مجاني لكل 5 طلبات مستلمة"
                : language === "id"
                ? "Hadiah gratis setiap 5 pesanan selesai"
                : "Free reward for every 5 completed orders"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#222934]">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "all"
              ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-[#EFCC80]/20"
              : "bg-[#14181f] text-stone-400 hover:text-white border border-[#222934]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === "ar" ? "جميع العروض" : language === "id" ? "Semua Promo" : "All Offers"}</span>
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "coupons"
              ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-[#EFCC80]/20"
              : "bg-[#14181f] text-stone-400 hover:text-white border border-[#222934]"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>{language === "ar" ? "كوبونات الخصم" : language === "id" ? "Kupon Diskon" : "Coupons"}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-outfit">
            {initialCoupons.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("gifts")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "gifts"
              ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-[#EFCC80]/20"
              : "bg-[#14181f] text-stone-400 hover:text-white border border-[#222934]"
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>{dict.offers.autoGiftsTitle}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-outfit">
            {initialGifts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("loyalty")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "loyalty"
              ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-[#EFCC80]/20"
              : "bg-[#14181f] text-stone-400 hover:text-white border border-[#222934]"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{dict.offers.loyaltyTitle}</span>
        </button>
      </div>

      {/* 3. Section: Active Coupons */}
      {(activeTab === "all" || activeTab === "coupons") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#EFCC80]" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {language === "ar"
                  ? "كوبونات الخصم الفعالة"
                  : language === "id"
                  ? "Kupon Diskon Aktif"
                  : "Active Discount Coupons"}
              </h2>
            </div>
            <span className="text-xs text-stone-400">
              {initialCoupons.length}{" "}
              {language === "ar" ? "كوبونات متاحة" : language === "id" ? "kupon tersedia" : "coupons available"}
            </span>
          </div>

          {initialCoupons.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#14181f] border border-[#222934] text-center text-stone-400 text-xs sm:text-sm">
              {dict.offers.emptyState}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialCoupons.map((coupon) => {
                const title =
                  language === "ar"
                    ? coupon.titleAr
                    : language === "id" && coupon.titleId
                    ? coupon.titleId
                    : coupon.titleEn;
                const desc =
                  language === "ar"
                    ? coupon.descriptionAr
                    : language === "id"
                    ? coupon.descriptionEn
                    : coupon.descriptionEn;
                const isCopied = copiedCode === coupon.code;

                return (
                  <div
                    key={coupon.id}
                    className="group relative flex flex-col justify-between rounded-3xl bg-[#14181f]/90 border border-[#222934] hover:border-[#EFCC80]/40 p-5 transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[#EFCC80]/5"
                  >
                    <div className="space-y-3">
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#EFCC80]/15 text-[#EFCC80] text-[11px] font-bold border border-[#EFCC80]/30">
                          {coupon.discountType === "PERCENTAGE" &&
                            `${coupon.discountValue}% ${language === "ar" ? "خصم" : language === "id" ? "Diskon" : "OFF"}`}
                          {coupon.discountType === "FIXED" &&
                            `${coupon.discountValue.toLocaleString()} ${dict.menu.currency} ${language === "ar" ? "خصم" : language === "id" ? "Diskon" : "OFF"}`}
                          {coupon.discountType === "FREE_ITEM" &&
                            (language === "ar"
                              ? coupon.freeItemNameAr || "صنف مجاني"
                              : language === "id"
                              ? "Item Gratis"
                              : coupon.freeItemNameEn || "Free Side Item")}
                        </span>

                        {coupon.isFirstOrderOnly && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            {language === "ar"
                              ? "للطلب الأول فقط"
                              : language === "id"
                              ? "Pesanan Pertama"
                              : "First Order Only"}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#EFCC80] transition-colors">
                          {title}
                        </h3>
                        <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {desc}
                        </p>
                      </div>

                      {/* Coupon Code Pill */}
                      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#0c0e12] border border-[#222934] font-outfit">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-400 font-cairo">
                            {language === "ar" ? "كود الخصم" : language === "id" ? "Kode Kupon" : "Coupon Code"}
                          </span>
                          <span className="text-base font-black text-[#EFCC80] tracking-widest uppercase">
                            {coupon.code}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isCopied
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-[#1c222b] text-stone-300 hover:text-white hover:bg-[#252e3b] border border-[#2e3745]"
                          }`}
                          title={dict.offers.copyCode}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-cairo">
                                {dict.offers.codeCopied}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-cairo">
                                {dict.offers.copyCode}
                              </span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Condition Rules */}
                      <div className="space-y-1 text-[11px] text-stone-400 pt-1">
                        <div className="flex justify-between">
                          <span>{dict.offers.minOrder}</span>
                          <span className="font-outfit font-bold text-stone-200">
                            {coupon.minOrderAmount.toLocaleString()} {dict.menu.currency}
                          </span>
                        </div>
                        {coupon.maxDiscount && (
                          <div className="flex justify-between">
                            <span>
                              {language === "ar" ? "أقصى خصم:" : language === "id" ? "Maks. Diskon:" : "Max Discount:"}
                            </span>
                            <span className="font-outfit font-bold text-stone-200">
                              {coupon.maxDiscount.toLocaleString()} {dict.menu.currency}
                            </span>
                          </div>
                        )}
                        {coupon.endDate && (
                          <div className="flex justify-between">
                            <span>{dict.offers.expires}</span>
                            <span className="font-outfit text-stone-300">
                              {new Date(coupon.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-5 pt-3 border-t border-[#222934]">
                      <Link
                        href={`/menu?coupon=${encodeURIComponent(coupon.code)}`}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#EFCC80]/15 to-[#C69843]/15 hover:from-[#EFCC80]/25 hover:to-[#C69843]/25 border border-[#EFCC80]/30 text-[#EFCC80] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>{dict.offers.useNow}</span>
                        <ArrowIcon className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 4. Section: Automatic Gifts */}
      {(activeTab === "all" || activeTab === "gifts") && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {dict.offers.autoGiftsTitle}
                </h2>
                <p className="text-xs text-stone-400">{dict.offers.autoGiftsDesc}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialGifts.map((gift) => {
              const tierName =
                language === "ar"
                  ? gift.tierNameAr
                  : language === "id" && gift.tierNameId
                  ? gift.tierNameId
                  : gift.tierNameEn;
              const giftName =
                language === "ar"
                  ? gift.giftItemNameAr
                  : language === "id" && gift.giftItemNameId
                  ? gift.giftItemNameId
                  : gift.giftItemNameEn;
              const desc =
                language === "ar" ? gift.descriptionAr : gift.descriptionEn;

              return (
                <div
                  key={gift.id}
                  className="rounded-3xl bg-[#14181f]/90 border border-[#222934] p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.85)] flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        {tierName}
                      </span>
                      <span className="text-xs font-bold text-stone-300">
                        {language === "ar" ? "قيمة الطلب:" : language === "id" ? "Minimal Belanja:" : "Order Spend:"}{" "}
                        <span className="font-outfit text-[#EFCC80] font-black text-sm">
                          {gift.minSpend.toLocaleString()} {dict.menu.currency}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {giftName}
                        </h3>
                        <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
                      </div>
                    </div>

                    {/* Progress representation */}
                    <div className="p-3 rounded-2xl bg-[#0c0e12] border border-[#222934] space-y-1.5">
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>{language === "ar" ? "مستوى الهدية" : language === "id" ? "Batas Hadiah" : "Gift Tier Threshold"}</span>
                        <span className="text-emerald-400 font-bold font-outfit">
                          {gift.minSpend.toLocaleString()} {dict.menu.currency}
                        </span>
                      </div>
                      <div className="w-full bg-[#1c222b] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-[#EFCC80] h-full rounded-full"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <p className="text-[10px] text-stone-500">
                        {language === "ar"
                          ? "✓ تضاف الهدية تلقائياً للسلة بدون إدخال أي كود بمجرد وصول قيمة المشتريات للحد المطلوب"
                          : language === "id"
                          ? "✓ Hadiah otomatis masuk ke keranjang tanpa kupon begitu total belanja mencapai batas ini"
                          : "✓ Automatically unlocked and added to cart when cart reaches this value"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#222934]">
                    <Link
                      href="/menu"
                      className="w-full py-2.5 px-3 rounded-xl bg-[#1c222b] hover:bg-[#252e3b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-[#2e3745]"
                    >
                      <span>{dict.cart.continueShopping}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Section: Loyalty Rewards & Interactive Stamp Card */}
      {(activeTab === "all" || activeTab === "loyalty") && (
        <section className="space-y-4 pt-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#14181f] via-[#0e1117] to-[#1a150b] border border-[#C69843]/30 p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
            <div className="max-w-2xl space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>{dict.offers.loyaltyTitle}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {language === "ar"
                  ? "اطلب 5 مرات واحصل على الصنف السادس مجاناً!"
                  : language === "id"
                  ? "Pesan 5 Kali & Dapatkan Hadiah Gratis ke-6!"
                  : "Order 5 Times & Get a Free Reward on the 6th!"}
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                {dict.offers.loyaltyDesc}
              </p>
            </div>

            {/* Interactive Phone Lookup */}
            <form
              onSubmit={handleCheckLoyalty}
              className="bg-[#0c0e12] p-4 sm:p-5 rounded-2xl border border-[#222934] max-w-xl space-y-3"
            >
              <label className="text-xs font-bold text-stone-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#EFCC80]" />
                <span>
                  {language === "ar"
                    ? "أدخل رقم هاتفك لفحص عدد الأختام والمكافآت:"
                    : language === "id"
                    ? "Masukkan nomor HP Anda untuk mengecek cap & hadiah:"
                    : "Enter your phone number to check stamps & rewards:"}
                </span>
              </label>

              <div className="flex gap-2">
                <input
                  type="tel"
                  value={loyaltyPhone}
                  onChange={(e) => setLoyaltyPhone(e.target.value)}
                  placeholder="77XXXXXXX"
                  className="flex-1 bg-[#14181f] border border-[#222934] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-[#EFCC80] font-outfit"
                />
                <button
                  type="submit"
                  disabled={loyaltyLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {loyaltyLoading ? (
                    <span className="w-4 h-4 border-2 border-[#2C1A04] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>{language === "ar" ? "فحص الأختام" : language === "id" ? "Cek Cap" : "Check Stamps"}</span>
                    </>
                  )}
                </button>
              </div>

              {loyaltyError && (
                <p className="text-xs text-red-400 font-bold">{loyaltyError}</p>
              )}
            </form>

            {/* Stamp Card Result */}
            {loyaltyResult && (
              <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#0c0e12] border border-[#C69843]/40 space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222934] pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{language === "ar" ? "بطاقة أختام العميل" : language === "id" ? "Kartu Cap Pelanggan" : "Customer Stamp Card"}</span>
                      <span className="font-outfit text-xs text-stone-400">
                        ({loyaltyResult.customerPhone})
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {language === "ar"
                        ? `إجمالي الطلبات المكتملة: ${loyaltyResult.totalOrders} طلب`
                        : language === "id"
                        ? `Total pesanan selesai: ${loyaltyResult.totalOrders} pesanan`
                        : `Total completed orders: ${loyaltyResult.totalOrders}`}
                    </p>
                  </div>

                  {loyaltyResult.isRewardAvailable ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1.5 animate-bounce">
                      <Sparkles className="w-4 h-4" />
                      <span>{dict.offers.claimReward}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">
                      {language === "ar"
                        ? `متبقي ${5 - loyaltyResult.currentProgress} طلبات للمكافأة القادمة`
                        : language === "id"
                        ? `Tersisa ${5 - loyaltyResult.currentProgress} pesanan lagi menuju hadiah berikutnya`
                        : `${5 - loyaltyResult.currentProgress} orders left until next reward`}
                    </span>
                  )}
                </div>

                {/* 5 Physical Stamp Circles */}
                <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-lg mx-auto py-2">
                  {[1, 2, 3, 4, 5].map((index) => {
                    const isCompleted = index <= loyaltyResult.currentProgress;
                    const isFifth = index === 5;

                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all ${
                          isCompleted
                            ? "bg-gradient-to-br from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-lg shadow-[#EFCC80]/20 scale-105"
                            : isFifth
                            ? "bg-[#14181f] border-2 border-dashed border-[#EFCC80]/40 text-[#EFCC80]"
                            : "bg-[#14181f] border border-[#222934] text-stone-600"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-[10px] font-outfit font-black mt-1">
                              #{index}
                            </span>
                          </>
                        ) : isFifth ? (
                          <>
                            <Gift className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                            <span className="text-[9px] font-bold mt-1">
                              {language === "ar" ? "هدية" : language === "id" ? "Hadiah" : "Reward"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Pizza className="w-4 h-4 sm:w-5 sm:h-5 opacity-40" />
                            <span className="text-[10px] font-outfit mt-1">#{index}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {loyaltyResult.isRewardAvailable && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm text-center font-bold">
                    🎉 {language === "ar"
                      ? "تهانينا! لديك مكافأة صنف جانبي مجاني جاهزة! عند إتمام طلبك التالي بهذا الرقم، سيتم إضافة المكافأة تلقائياً."
                      : language === "id"
                      ? "Selamat! Anda memiliki hadiah gratis yang siap digunakan pada pesanan berikutnya dengan nomor ini!"
                      : "Congratulations! You have an earned reward ready for your next order!"}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
