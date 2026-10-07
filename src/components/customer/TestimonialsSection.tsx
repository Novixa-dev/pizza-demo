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
      } else {
        if (diffDays <= 0) return diffHours <= 1 ? "1h ago" : `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
      }
    } catch {
      return language === "ar" ? "مؤخراً" : "Recently";
    }
  };

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
      {/* Section Header with unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/80 dark:border-stone-800 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-pizza-700 dark:text-pizza-400">
            <Sparkles className="w-4 h-4" />
            <span>{t.badge}</span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className="font-outfit text-amber-500 font-extrabold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{avgMeal} / 5.0</span>
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-stone-500 dark:text-stone-400">{t.basedOn}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white font-cairo">
            {t.title}
          </h2>

          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Filter Buttons & Score Summary */}
        <div className="flex items-center gap-2">
          <div className="bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl flex items-center gap-1 border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setFilterRating("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRating === "all"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-black"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              {t.filterAll}
            </button>
            <button
              type="button"
              onClick={() => setFilterRating("5star")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRating === "5star"
                  ? "bg-white dark:bg-stone-900 text-pizza-600 dark:text-pizza-400 shadow-xs font-black"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
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
                className="bg-white dark:bg-stone-850 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-pizza-500/30 dark:hover:border-pizza-500/30 transition-all flex flex-col justify-between gap-5 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {/* Background watermark quote icon */}
                <Quote className="absolute top-4 end-4 w-12 h-12 text-stone-100 dark:text-stone-800/40 pointer-events-none -scale-x-100 transition-transform group-hover:scale-110" />

                <div className="space-y-3.5 relative z-10">
                  {/* Customer Info & Rating */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white font-cairo">
                          {item.customerName || (language === "ar" ? "عميل بيتزا هاوس" : "Pizza House Patron")}
                        </h4>
                        <span title={t.verifiedPatron} className="inline-flex">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </span>
                      </div>
                      {/* Quiet unboxed metadata: time & district */}
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <span>{formatRelativeTime(item.createdAt)}</span>
                        <span>·</span>
                        <span>{language === "ar" ? "فوه المساكن" : "Fuwa District"}</span>
                      </div>
                    </div>

                    {/* Star Rating display */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, sIdx) => (
                        <Star
                          key={sIdx}
                          className={`w-4 h-4 ${
                            sIdx < item.mealRating
                              ? "text-amber-400 fill-amber-400"
                              : "text-stone-300 dark:text-stone-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Customer Review Comment */}
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-cairo">
                    &ldquo;{item.comment || (language === "ar" ? "تجربة ممتازة وبيتزا طازجة ولذيذة جداً!" : "Great pizza and fast service!")}&rdquo;
                  </p>
                </div>

                {/* Bottom Meta: Ordered Dish & Tags */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2 relative z-10">
                  {orderedItem && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-medium">
                      <Pizza className="w-3.5 h-3.5 text-pizza-600 dark:text-pizza-400 shrink-0" />
                      <span className="truncate">
                        {language === "ar" ? orderedItem.productNameAr : orderedItem.productNameEn}
                      </span>
                    </div>
                  )}

                  {/* Clean unboxed tags with subtle separators */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                      {parsedTags.map((tag, tIdx) => (
                        <React.Fragment key={tIdx}>
                          <span className="hover:text-pizza-600 dark:hover:text-pizza-400 transition-colors">
                            {tag}
                          </span>
                          {tIdx < parsedTags.length - 1 && (
                            <span className="text-stone-300 dark:text-stone-700">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-stone-50 dark:bg-stone-850 p-10 rounded-3xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-sm text-stone-500">{t.emptyState}</p>
        </div>
      )}

      {/* Leave Feedback / Reorder Spotlight Callout Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white font-cairo">
              {t.leaveFeedbackPrompt}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
              {language === "ar"
                ? "رأيك يهمنا في تطوير جودة الخبز وسرعة الخدمة! يمكنك الدخول إلى سجل طلباتك ومشاركتنا تقييمك لطلبك السابق بنقرة واحدة."
                : "Your feedback helps us continuously perfect our stone-baked recipes! Check your order history to rate past meals."}
            </p>
          </div>
        </div>

        <Link
          href="/history"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pizza-700 to-pizza-600 hover:from-pizza-800 hover:to-pizza-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs shadow-lg shadow-pizza-900/40 active:scale-95 transition-all whitespace-nowrap w-full md:w-auto"
        >
          <span>{t.leaveFeedbackBtn}</span>
          {language === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Link>
      </div>
    </section>
  );
}
