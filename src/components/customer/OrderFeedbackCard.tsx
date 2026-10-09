"use client";

import React, { useState, useTransition } from "react";
import { useApp } from "@/context/AppContext";
import { Star, CheckCircle2, MessageSquare, Sparkles, Send, Edit3, Heart } from "lucide-react";
import { submitOrderFeedbackAction } from "@/app/actions/orderActions";

interface OrderFeedbackCardProps {
  orderId: string;
  orderNumber: string;
  trackingToken?: string | null;
  existingFeedback?: {
    id: string;
    mealRating: number;
    serviceRating: number;
    tags?: string[];
    comment?: string | null;
    createdAt?: string | Date;
  } | null;
}

const QUICK_TAGS = [
  { id: "HOT_CRISPY", labelAr: "ساخنة ومقرمشة 🔥", labelEn: "Hot & Crispy 🔥" },
  { id: "ON_TIME", labelAr: "في الموعد تماماً ⏱️", labelEn: "Right on Time ⏱️" },
  { id: "GREAT_DOUGH", labelAr: "عجينة إيطالية هشة 🍕", labelEn: "Great Italian Dough 🍕" },
  { id: "GENEROUS_CHEESE", labelAr: "جبنة ومكونات وفيرة 🧀", labelEn: "Generous Toppings 🧀" },
  { id: "EXCELLENT_PACKAGING", labelAr: "تغليف نظيف وممتاز 📦", labelEn: "Clean Packaging 📦" },
  { id: "FRIENDLY_STAFF", labelAr: "تعامل لطيف وسريع 😊", labelEn: "Friendly Staff 😊" },
];

export default function OrderFeedbackCard({
  orderId,
  orderNumber,
  trackingToken,
  existingFeedback,
}: OrderFeedbackCardProps) {
  const { language } = useApp();
  const [mealRating, setMealRating] = useState<number>(existingFeedback?.mealRating || 5);
  const [hoverMeal, setHoverMeal] = useState<number>(0);

  const [serviceRating, setServiceRating] = useState<number>(existingFeedback?.serviceRating || 5);
  const [hoverService, setHoverService] = useState<number>(0);

  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingFeedback?.tags || ["HOT_CRISPY", "ON_TIME"]
  );
  const [comment, setComment] = useState<string>(existingFeedback?.comment || "");

  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(existingFeedback));
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const getMealLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return language === "ar" ? "ممتازة جداً ولذيذة! 🍕" : "Outstanding & Delicious! 🍕";
      case 4:
        return language === "ar" ? "جيدة جداً وممتعة 👍" : "Very Good 👍";
      case 3:
        return language === "ar" ? "عادية ومقبولة 😐" : "Average 😐";
      case 2:
        return language === "ar" ? "أقل من المتوقع 🙁" : "Below Expectation 🙁";
      case 1:
        return language === "ar" ? "تحتاج لتحسين كبير ⚠️" : "Needs Improvement ⚠️";
      default:
        return "";
    }
  };

  const getServiceLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return language === "ar" ? "سريعة وفي الموعد تماماً! ⚡" : "Fast & Right on Time! ⚡";
      case 4:
        return language === "ar" ? "تجهيز ممتاز وسلس ⏱️" : "Smooth & Prompt ⏱️";
      case 3:
        return language === "ar" ? "معقولة ومقبولة ⏳" : "Fair Speed ⏳";
      case 2:
        return language === "ar" ? "تأخرت قليلاً ⌛" : "Slight Delay ⌛";
      case 1:
        return language === "ar" ? "تأخر غير مقبول ⚠️" : "Unacceptable Delay ⚠️";
      default:
        return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await submitOrderFeedbackAction({
        orderId,
        token: trackingToken || undefined,
        mealRating,
        serviceRating,
        tags: selectedTags,
        comment,
      });

      if (res.success) {
        setIsSubmitted(true);
        setIsEditing(false);
      } else {
        setErrorMsg(res.error || "تعذر إرسال التقييم.");
      }
    });
  };

  // If already submitted and user is not editing, show elegant summary card
  if (isSubmitted && !isEditing) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-stone-850 dark:to-emerald-950/40 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-center sm:text-start">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white font-cairo">
                  {language === "ar" ? "شكراً لتقييمك ومشاركتنا رأيك!" : "Thank You for Your Feedback!"}
                </h3>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {language === "ar"
                  ? "رأيك يساهم في الحفاظ على أعلى معايير الجودة لبيتزا هاوس بالمكلا."
                  : "Your review helps Pizza House Mukalla maintain top quality and fast service."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-pizza-700 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3.5 py-2 rounded-xl transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-pizza-600" />
            <span>{language === "ar" ? "تعديل تقييمي" : "Edit Review"}</span>
          </button>
        </div>

        {/* Rating Overview Pills */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700 space-y-1">
            <span className="text-[11px] text-stone-500 block">
              {language === "ar" ? "تقييم الوجبة والبيتزا:" : "Meal Quality:"}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= mealRating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-stone-800 dark:text-stone-200 text-xs">
                ({mealRating}/5) {getMealLabel(mealRating)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700 space-y-1">
            <span className="text-[11px] text-stone-500 block">
              {language === "ar" ? "تقييم سرعة الخدمة والتجهيز:" : "Service & Speed:"}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= serviceRating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-stone-800 dark:text-stone-200 text-xs">
                ({serviceRating}/5) {getServiceLabel(serviceRating)}
              </span>
            </div>
          </div>
        </div>

        {comment && (
          <div className="bg-white/70 dark:bg-stone-800/70 p-3 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 text-xs italic text-stone-700 dark:text-stone-300">
            &quot;{comment}&quot;
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-850 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white font-cairo">
              {language === "ar"
                ? "كيف كانت تجربتك مع طلبك اليوم؟"
                : "How was your meal and service today?"}
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              {orderNumber}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {language === "ar"
              ? "يسعدنا معرفة رأيك في مذاق البيتزا وسرعة التجهيز لمساعدتنا على تقديم أفضل تجربة دائماً."
              : "Tell us about your pizza quality and service speed to help us continuously elevate our craft."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* Rating 1: Meal & Food Quality */}
        <div className="space-y-2 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-750">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <span>🍕 {language === "ar" ? "تقييم جودة البيتزا والوجبة" : "Pizza & Food Quality"}</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {getMealLabel(hoverMeal || mealRating)}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1" role="radiogroup" aria-label="Meal rating">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoverMeal || mealRating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setMealRating(star)}
                  onMouseEnter={() => setHoverMeal(star)}
                  onMouseLeave={() => setHoverMeal(0)}
                  className="p-1 rounded-xl transition-transform hover:scale-115 active:scale-95 focus:outline-none"
                  aria-label={`${star} stars`}
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "text-stone-300 dark:text-stone-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating 2: Service & Preparation Speed */}
        <div className="space-y-2 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-750">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <span>⚡ {language === "ar" ? "تقييم سرعة التجهيز والخدمة" : "Service & Prep Speed"}</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {getServiceLabel(hoverService || serviceRating)}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1" role="radiogroup" aria-label="Service rating">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoverService || serviceRating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setServiceRating(star)}
                  onMouseEnter={() => setHoverService(star)}
                  onMouseLeave={() => setHoverService(0)}
                  className="p-1 rounded-xl transition-transform hover:scale-115 active:scale-95 focus:outline-none"
                  aria-label={`${star} stars`}
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "text-stone-300 dark:text-stone-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            {language === "ar" ? "ما الذي أعجبك أكثر؟ (اختياري)" : "What did you like most? (Optional)"}
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-pizza-600 text-white border-pizza-600 shadow-xs"
                      : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                  }`}
                >
                  {language === "ar" ? tag.labelAr : tag.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-pizza-600" />
            <span>
              {language === "ar"
                ? "ملاحظاتك واقتراحاتك لتطوير الخدمة (اختياري)"
                : "Comments or Suggestions (Optional)"}
            </span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={
              language === "ar"
                ? "شاركنا أي ملاحظة حول الطعم، حرارة البيتزا، أو مستوى الخدمة..."
                : "Share any thoughts on taste, temperature, or service..."
            }
            className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-pizza-500 text-xs sm:text-sm text-stone-900 dark:text-white transition-all placeholder:text-stone-400"
          />
          <div className="flex justify-between items-center text-[11px] text-stone-400 px-1">
            <span>
              {language === "ar"
                ? "تصل الملاحظات مباشرة إلى إدارة بيتزا هاوس"
                : "Feedback goes directly to management"}
            </span>
            <span className="font-outfit">{comment.length}/500</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 disabled:opacity-50 font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md shadow-amber-950/40 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>
              {isPending
                ? language === "ar"
                  ? "جاري إرسال التقييم..."
                  : "Submitting Review..."
                : language === "ar"
                ? "إرسال التقييم"
                : "Submit Feedback"}
            </span>
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
