"use client";

import React, { useState, useTransition } from "react";
import { useApp } from "@/context/AppContext";
import { Star, CheckCircle2, MessageSquare, Send, Edit3, Heart } from "lucide-react";
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
  { id: "HOT_CRISPY", labelAr: "ساخنة ومقرمشة 🔥", labelEn: "Hot & Crispy 🔥", labelId: "Panas & Renyah 🔥" },
  { id: "ON_TIME", labelAr: "في الموعد تماماً ⏱️", labelEn: "Right on Time ⏱️", labelId: "Tepat Waktu ⏱️" },
  { id: "GREAT_DOUGH", labelAr: "عجينة إيطالية هشة 🍕", labelEn: "Great Italian Dough 🍕", labelId: "Adonan Khas Italia Lezat 🍕" },
  { id: "GENEROUS_CHEESE", labelAr: "جبنة ومكونات وفيرة 🧀", labelEn: "Generous Toppings 🧀", labelId: "Keju & Topping Melimpah 🧀" },
  { id: "EXCELLENT_PACKAGING", labelAr: "تغليف نظيف وممتاز 📦", labelEn: "Clean Packaging 📦", labelId: "Kemasan Bersih & Rapi 📦" },
  { id: "FRIENDLY_STAFF", labelAr: "تعامل لطيف وسريع 😊", labelEn: "Friendly Staff 😊", labelId: "Pelayanan Ramah & Cepat 😊" },
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
        return language === "ar"
          ? "ممتازة جداً ولذيذة! 🍕"
          : language === "id"
          ? "Luar Biasa & Sangat Lezat! 🍕"
          : "Outstanding & Delicious! 🍕";
      case 4:
        return language === "ar"
          ? "جيدة جداً وممتعة 👍"
          : language === "id"
          ? "Sangat Baik 👍"
          : "Very Good 👍";
      case 3:
        return language === "ar"
          ? "عادية ومقبولة 😐"
          : language === "id"
          ? "Biasa Saja 😐"
          : "Average 😐";
      case 2:
        return language === "ar"
          ? "أقل من المتوقع 🙁"
          : language === "id"
          ? "Di Bawah Harapan 🙁"
          : "Below Expectation 🙁";
      case 1:
        return language === "ar"
          ? "تحتاج لتحسين كبير ⚠️"
          : language === "id"
          ? "Perlu Ditingkatkan ⚠️"
          : "Needs Improvement ⚠️";
      default:
        return "";
    }
  };

  const getServiceLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return language === "ar"
          ? "سريعة وفي الموعد تماماً! ⚡"
          : language === "id"
          ? "Cepat & Tepat Waktu! ⚡"
          : "Fast & Right on Time! ⚡";
      case 4:
        return language === "ar"
          ? "تجهيز ممتاز وسلس ⏱️"
          : language === "id"
          ? "Pelayanan Lancar & Cepat ⏱️"
          : "Smooth & Prompt ⏱️";
      case 3:
        return language === "ar"
          ? "معقولة ومقبولة ⏳"
          : language === "id"
          ? "Cukup Baik ⏳"
          : "Fair Speed ⏳";
      case 2:
        return language === "ar"
          ? "تأخرت قليلاً ⌛"
          : language === "id"
          ? "Sedikit Terlambat ⌛"
          : "Slight Delay ⌛";
      case 1:
        return language === "ar"
          ? "تأخر غير مقبول ⚠️"
          : language === "id"
          ? "Keterlambatan Tidak Wajar ⚠️"
          : "Unacceptable Delay ⚠️";
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
        setErrorMsg(
          res.error ||
            (language === "ar"
              ? "تعذر إرسال التقييم."
              : language === "id"
              ? "Gagal mengirimkan ulasan."
              : "Failed to submit review.")
        );
      }
    });
  };

  // If already submitted and user is not editing, show elegant summary card
  if (isSubmitted && !isEditing) {
    return (
      <div className="bg-[#14181f]/95 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4 text-center sm:text-start font-cairo">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start">
                <h3 className="text-base sm:text-lg font-black text-white font-cairo">
                  {language === "ar"
                    ? "شكراً لتقييمك ومشاركتنا رأيك!"
                    : language === "id"
                    ? "Terima kasih atas ulasan & masukan Anda!"
                    : "Thank You for Your Feedback!"}
                </h3>
              </div>
              <p className="text-xs text-stone-300">
                {language === "ar"
                  ? "رأيك يساهم في الحفاظ على أعلى معايير الجودة لبيتزا نوڤا بالمكلا."
                  : language === "id"
                  ? "Ulasan Anda membantu menjaga standar mutu tertinggi dan layanan cepat Pizza Nova."
                  : "Your review helps Pizza Nova maintain top quality and fast service."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-300 hover:text-white bg-[#0c0e12] border border-[#222934] hover:border-[#EFCC80]/40 px-3.5 py-2 rounded-xl transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#EFCC80]" />
            <span>
              {language === "ar" ? "تعديل تقييمي" : language === "id" ? "Ubah Ulasan" : "Edit Review"}
            </span>
          </button>
        </div>

        {/* Rating Overview Pills */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#0c0e12] rounded-2xl border border-[#222934] space-y-1">
            <span className="text-[11px] text-stone-400 block">
              {language === "ar"
                ? "تقييم الوجبة والبيتزا:"
                : language === "id"
                ? "Kualitas Makanan & Pizza:"
                : "Meal Quality:"}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-[#EFCC80]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= mealRating ? "fill-[#EFCC80] text-[#EFCC80]" : "text-stone-600"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-white text-xs">
                ({mealRating}/5) {getMealLabel(mealRating)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#0c0e12] rounded-2xl border border-[#222934] space-y-1">
            <span className="text-[11px] text-stone-400 block">
              {language === "ar"
                ? "تقييم سرعة الخدمة والتجهيز:"
                : language === "id"
                ? "Kecepatan Layanan & Penyajian:"
                : "Service & Speed:"}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-[#EFCC80]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= serviceRating ? "fill-[#EFCC80] text-[#EFCC80]" : "text-stone-600"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-white text-xs">
                ({serviceRating}/5) {getServiceLabel(serviceRating)}
              </span>
            </div>
          </div>
        </div>

        {comment && (
          <div className="bg-[#0c0e12] p-3 rounded-2xl border border-[#222934] text-xs italic text-stone-300">
            &quot;{comment}&quot;
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#14181f]/95 rounded-3xl p-6 sm:p-8 border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-6 font-cairo">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shrink-0 shadow-md shadow-[#EFCC80]/20">
          <Star className="w-6 h-6 fill-[#2C1A04]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white font-cairo">
              {language === "ar"
                ? "كيف كانت تجربتك مع طلبك اليوم؟"
                : language === "id"
                ? "Bagaimana pengalaman pesanan Anda hari ini?"
                : "How was your meal and service today?"}
            </h3>
            <span className="text-xs bg-[#0c0e12] border border-[#222934] text-[#EFCC80] px-2.5 py-0.5 rounded-full font-bold font-outfit">
              {orderNumber}
            </span>
          </div>
          <p className="text-xs text-stone-400">
            {language === "ar"
              ? "يسعدنا معرفة رأيك في مذاق البيتزا وسرعة التجهيز لمساعدتنا على تقديم أفضل تجربة دائماً."
              : language === "id"
              ? "Kami sangat senang mengetahui pendapat Anda tentang rasa pizza dan kecepatan penyajian untuk terus menyempurnakan hidangan kami."
              : "Tell us about your pizza quality and service speed to help us continuously elevate our craft."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* Rating 1: Meal & Food Quality */}
        <div className="space-y-2 p-4 bg-[#0c0e12] rounded-2xl border border-[#222934]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>
                🍕{" "}
                {language === "ar"
                  ? "تقييم جودة البيتزا والوجبة"
                  : language === "id"
                  ? "Kualitas Makanan & Pizza"
                  : "Pizza & Food Quality"}
              </span>
              <span className="text-[#EFCC80]">*</span>
            </label>
            <span className="text-xs font-bold text-[#EFCC80]">
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
                        ? "fill-[#EFCC80] text-[#EFCC80] drop-shadow-sm"
                        : "text-stone-700"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating 2: Service & Preparation Speed */}
        <div className="space-y-2 p-4 bg-[#0c0e12] rounded-2xl border border-[#222934]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>
                ⚡{" "}
                {language === "ar"
                  ? "تقييم سرعة التجهيز والخدمة"
                  : language === "id"
                  ? "Kecepatan Layanan & Penyajian"
                  : "Service & Prep Speed"}
              </span>
              <span className="text-[#EFCC80]">*</span>
            </label>
            <span className="text-xs font-bold text-[#EFCC80]">
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
                        ? "fill-[#EFCC80] text-[#EFCC80] drop-shadow-sm"
                        : "text-stone-700"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            {language === "ar"
              ? "ما الذي أعجبك أكثر؟ (اختياري)"
              : language === "id"
              ? "Apa yang paling Anda sukai? (Opsional)"
              : "What did you like most? (Optional)"}
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    isSelected
                      ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] border-[#EFCC80] shadow-sm"
                      : "bg-[#0c0e12] hover:bg-[#1a202c] text-stone-300 border-[#222934]"
                  }`}
                >
                  {language === "ar"
                    ? tag.labelAr
                    : (language === "id" && tag.labelId)
                    ? tag.labelId
                    : tag.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#EFCC80]" />
            <span>
              {language === "ar"
                ? "ملاحظاتك واقتراحاتك لتطوير الخدمة (اختياري)"
                : language === "id"
                ? "Komentar atau saran perbaikan (Opsional)"
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
                : language === "id"
                ? "Tuliskan pendapat Anda tentang rasa, suhu pizza, atau pelayanan..."
                : "Share any thoughts on taste, temperature, or service..."
            }
            className="w-full px-4 py-3 rounded-2xl bg-[#0c0e12] border border-[#222934] focus:outline-none focus:border-[#EFCC80] text-xs sm:text-sm text-white transition-all placeholder:text-stone-600 font-bold"
          />
          <div className="flex justify-between items-center text-[11px] text-stone-500 px-1">
            <span>
              {language === "ar"
                ? "تصل الملاحظات مباشرة إلى إدارة بيتزا نوڤا"
                : language === "id"
                ? "Masukan langsung diterima oleh manajemen Pizza Nova"
                : "Feedback goes directly to management"}
            </span>
            <span className="font-outfit">{comment.length}/500</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 disabled:opacity-50 font-black py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md shadow-[#EFCC80]/20 active:scale-95 transition-all font-cairo"
          >
            <Send className="w-4 h-4" />
            <span>
              {isPending
                ? language === "ar"
                  ? "جاري إرسال التقييم..."
                  : language === "id"
                  ? "Mengirimkan Ulasan..."
                  : "Submitting Review..."
                : language === "ar"
                ? "إرسال التقييم"
                : language === "id"
                ? "Kirimkan Ulasan"
                : "Submit Feedback"}
            </span>
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-3.5 rounded-2xl border border-[#222934] bg-[#0c0e12] text-stone-300 hover:text-white text-xs font-bold hover:bg-[#1a202c] transition-colors"
            >
              {language === "ar" ? "إلغاء" : language === "id" ? "Batal" : "Cancel"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
