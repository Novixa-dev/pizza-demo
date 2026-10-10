"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Star,
  Quote,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Flame,
  Clock,
  Pizza,
} from "lucide-react";
import { getRecentTestimonialsAction } from "@/app/actions/orderActions";

export interface TestimonialItem {
  id: string;
  orderId?: string;
  mealRating: number;
  serviceRating: number;
  tags?: string | null;
  comment?: string | null;
  customerName?: string | null;
  createdAt: string | Date;
  order?: {
    orderNumber?: string;
    pickupMode?: string;
    items?: Array<{
      productNameAr: string;
      productNameEn: string;
      productNameId?: string;
      quantity?: number;
    }>;
  } | null;
}

interface TestimonialsSectionProps {
  initialTestimonials?: TestimonialItem[];
}

export default function TestimonialsSection({
  initialTestimonials = [],
}: TestimonialsSectionProps) {
  const { language, dict } = useApp();
  const t = dict.testimonials;

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);
  const [filterRating, setFilterRating] = useState<"all" | "5star">("all");
  const [isLoading, setIsLoading] = useState(initialTestimonials.length === 0);

  useEffect(() => {
    if (initialTestimonials.length === 0) {
      getRecentTestimonialsAction(8).then((res) => {
        if (res.success && res.testimonials) {
          setTestimonials(res.testimonials as any);
        }
        setIsLoading(false);
      });
    }
  }, [initialTestimonials]);

  const filtered = testimonials.filter((item) => {
    if (filterRating === "5star") {
      return item.mealRating === 5 && item.serviceRating === 5;
    }
    return true;
  });

  // Calculate dynamic stats
  const totalCount = testimonials.length;
  const avgMeal =
    totalCount > 0
      ? (testimonials.reduce((sum, i) => sum + i.mealRating, 0) / totalCount).toFixed(1)
      : "5.0";
  const avgService =
    totalCount > 0
      ? (testimonials.reduce((sum, i) => sum + i.serviceRating, 0) / totalCount).toFixed(1)
      : "4.9";

  const formatRelativeTime = (dateInput: string | Date) => {
    try {
      const d = new Date(dateInput);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (language === "ar") {
        if (diffDays <= 0) return diffHours <= 1 ? "منذ ساعة" : `منذ ${diffHours} ساعات`;
        if (diffDays === 1) return "أمس";
        if (diffDays === 2) return "منذ يومين";
        if (diffDays <= 10) return `منذ ${diffDays} أيام`;
        return `منذ ${diffDays} يوماً`;
      } else if (language === "id") {
        if (diffDays <= 0) return diffHours <= 1 ? "1 jam lalu" : `${diffHours} jam lalu`;
        if (diffDays === 1) return "Kemarin";
        return `${diffDays} hari lalu`;
      } else {
        if (diffDays <= 0) return diffHours <= 1 ? "1h ago" : `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
      }
    } catch {
      return language === "ar" ? "مؤخراً" : language === "id" ? "Baru-baru ini" : "Recently";
    }
  };

  return (
    <section id="reviews" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-8 relative z-20 font-cairo">
      {/* Section Header with unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#222934] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#EFCC80]">
            <Sparkles className="w-4 h-4 text-[#C69843]" />
            <span>{t.badge}</span>
            <span className="text-stone-600">·</span>
            <span className="font-outfit text-amber-400 font-extrabold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#EFCC80] text-[#EFCC80]" />
              <span>{avgMeal} / 5.0</span>
            </span>
            <span className="text-stone-600">·</span>
            <span className="text-stone-400">{t.basedOn}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white font-cairo">
            {t.title}
          </h2>

          <p className="text-sm text-stone-400 leading-relaxed font-cairo">
            {t.subtitle}
          </p>
        </div>

        {/* Filter Buttons & Score Summary */}
        <div className="flex items-center gap-2">
          <div className="bg-[#14181f] p-1 rounded-xl flex items-center gap-1 border border-[#222934]">
            <button
              type="button"
              onClick={() => setFilterRating("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRating === "all"
                  ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 font-black"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {t.filterAll}
            </button>
            <button
              type="button"
              onClick={() => setFilterRating("5star")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRating === "5star"
                  ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 font-black"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {t.filter5Stars}
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => {
            const parsedTags = item.tags
              ? item.tags.split(",").map((s) => s.trim()).filter(Boolean)
              : [];
            const orderedItem = item.order?.items?.[0];

            return (
              <div
                key={item.id || idx}
                className="bg-[#14181f] p-6 rounded-3xl border border-[#222934] hover:border-[#EFCC80]/40 shadow-xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {/* Background watermark quote icon */}
                <Quote className="absolute top-4 end-4 w-12 h-12 text-white/5 pointer-events-none -scale-x-100 transition-transform group-hover:scale-110" />

                <div className="space-y-3.5 relative z-10">
                  {/* Customer Info & Rating */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white font-cairo">
                          {item.customerName || (language === "ar" ? "عميل بيتزا هاوس" : language === "id" ? "Pelanggan Pizza House" : "Pizza House Patron")}
                        </h4>
                        <span title={t.verifiedPatron} className="inline-flex">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </span>
                      </div>
                      {/* Quiet unboxed metadata: time & district */}
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-cairo">
                        <span>{formatRelativeTime(item.createdAt)}</span>
                        <span>·</span>
                        <span>{language === "ar" ? "فوه المساكن" : language === "id" ? "Distrik Fuwah" : "Fuwa District"}</span>
                      </div>
                    </div>

                    {/* Star Rating display */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, sIdx) => (
                        <Star
                          key={sIdx}
                          className={`w-4 h-4 ${
                            sIdx < item.mealRating
                              ? "text-[#EFCC80] fill-[#EFCC80]"
                              : "text-stone-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Customer Review Comment */}
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-cairo">
                    &ldquo;{item.comment || (language === "ar" ? "تجربة ممتازة وبيتزا طازجة ولذيذة جداً!" : language === "id" ? "Pizza lezat dan pelayanan cepat memuaskan!" : "Great pizza and fast service!")}&rdquo;
                  </p>
                </div>

                {/* Bottom Meta: Ordered Dish & Tags */}
                <div className="pt-3 border-t border-[#222934] space-y-2 relative z-10">
                  {orderedItem && (
                    <div className="flex items-center gap-1.5 text-xs text-[#EFCC80] font-bold font-cairo">
                      <Pizza className="w-3.5 h-3.5 text-[#C69843] shrink-0" />
                      <span className="truncate">
                        {language === "ar" ? orderedItem.productNameAr : (language === "id" && orderedItem.productNameId) ? orderedItem.productNameId : orderedItem.productNameEn}
                      </span>
                    </div>
                  )}

                  {/* Clean tags */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-400 font-cairo">
                      {parsedTags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-lg bg-[#0c0e12] border border-[#222934] text-stone-300 text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#14181f] p-10 rounded-3xl border border-[#222934] text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-stone-500 mx-auto" />
          <p className="text-sm text-stone-400 font-cairo">{t.emptyState}</p>
        </div>
      )}

      {/* Leave Feedback / Reorder Spotlight Callout Banner */}
      <div className="bg-gradient-to-r from-[#14181f] via-[#1a202c] to-[#14181f] text-white rounded-3xl p-6 sm:p-8 border border-amber-500/25 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 font-cairo">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center font-bold shadow-md shadow-amber-950/40 shrink-0">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white font-cairo">
              {t.leaveFeedbackPrompt}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed max-w-xl font-cairo">
              {language === "ar"
                ? "رأيك يهمنا في تطوير جودة الخبز وسرعة الخدمة! يمكنك الدخول إلى سجل طلباتك ومشاركتنا تقييمك لطلبك السابق بنقرة واحدة."
                : language === "id"
                ? "Masukan Anda sangat berharga untuk menyempurnakan cita rasa dan kecepatan layanan kami! Buka riwayat pesanan Anda untuk memberikan ulasan."
                : "Your feedback helps us continuously perfect our stone-baked recipes! Check your order history to rate past meals."}
            </p>
          </div>
        </div>

        <Link
          href="/history"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 font-black px-6 py-3.5 rounded-2xl text-xs shadow-lg shadow-amber-950/50 active:scale-95 transition-all whitespace-nowrap w-full md:w-auto font-cairo"
        >
          <span>{t.leaveFeedbackBtn}</span>
          {language === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Link>
      </div>
    </section>
  );
}
