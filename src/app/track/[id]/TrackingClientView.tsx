"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Pizza,
  Phone,
  ArrowRight,
  ArrowLeft,
  Flame,
  PackageCheck,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cancelCustomerOrderAction } from "@/app/actions/orderActions";
import OrderFeedbackCard from "@/components/customer/OrderFeedbackCard";
import OrderShareCard from "@/components/customer/OrderShareCard";
import StoneOvenLiveView from "@/components/customer/StoneOvenLiveView";

interface TrackingClientViewProps {
  order: any;
  isOwner?: boolean;
}

export default function TrackingClientView({ order, isOwner = false }: TrackingClientViewProps) {
  const { language, dict } = useApp();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [previewFeedback, setPreviewFeedback] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await cancelCustomerOrderAction(order.id, order.trackingToken);
      if (res.success) {
        setShowCancelModal(false);
        router.refresh();
      } else {
        setCancelError(res.error || "تعذر إلغاء الطلب.");
      }
    } catch {
      setCancelError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Auto-refresh every 15 seconds to poll status changes
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const steps = [
    {
      key: "CONFIRMED",
      label: "تم الاستلام والحجز",
      desc: "تم تسجيل الطلب في النظام",
      isComplete: [
        "CONFIRMED",
        "QUEUED",
        "PREPARING",
        "READY",
        "COMPLETED",
      ].includes(order.status),
    },
    {
      key: "PREPARING",
      label: "في الفرن (جاري التحضير)",
      desc: "يتم فرد العجينة وخبز البيتزا حالياً",
      isComplete: ["PREPARING", "READY", "COMPLETED"].includes(order.status),
      isActive: order.status === "PREPARING",
    },
    {
      key: "READY",
      label: "جاهز للاستلام!",
      desc: "الطلب ساخن وجاهز في فرع فوه",
      isComplete: ["READY", "COMPLETED"].includes(order.status),
      isActive: order.status === "READY",
    },
    {
      key: "COMPLETED",
      label: "تم التسليم بنجاح",
      desc: "بالهناء والشفاء!",
      isComplete: order.status === "COMPLETED",
    },
  ];

  const formattedPickupTime = React.useMemo(() => {
    if (!order.requestedPickupTime) return "";
    try {
      const pickupDate = new Date(order.requestedPickupTime);
      return pickupDate.toLocaleTimeString(language === "ar" ? "ar-YE" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Aden",
      });
    } catch {
      return "";
    }
  }, [order.requestedPickupTime, language]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Card: Order Reference & Refresh */}
      <div className="bg-white dark:bg-stone-850 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider font-outfit">
              Pizza House Mukalla
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-outfit">
              {order.orderNumber}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-xl hover:bg-stone-200 transition-colors"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>تحديث الحالة</span>
            </button>

            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                order.status === "READY"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse"
                  : order.status === "PREPARING"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : order.status === "REJECTED"
                  ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  : "bg-pizza-50 text-pizza-800 dark:bg-pizza-950 dark:text-pizza-300"
              }`}
            >
              {order.status === "READY"
                ? "جاهز للاستلام الآن!"
                : order.status === "PREPARING"
                ? "في الفرن (جاري التحضير)"
                : order.status === "QUEUED"
                ? "مجدول بانتظار وقت الخبز"
                : order.status === "PAYMENT_PENDING"
                ? "بانتظار التحقق من الإشعار"
                : order.status === "REJECTED"
                ? "تم رفض الإشعار"
                : order.status === "COMPLETED"
                ? "تم الاستلام بنجاح"
                : "تم تأكيد الطلب"}
            </span>
          </div>
        </div>

        {/* Scheduled Delivery Banner */}
        <div className="bg-pizza-50 dark:bg-pizza-950/60 p-4 rounded-2xl border border-pizza-200/80 dark:border-pizza-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pizza-600 text-white flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-cairo">
                موعد الاستلام المحدد من الفرع:
              </span>
              <span suppressHydrationWarning className="text-base font-black text-stone-900 dark:text-white font-outfit">
                {formattedPickupTime} ({order.pickupMode === "ASAP" ? "أسرع وقت" : "طلب مجدول"})
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-pizza-700 dark:text-pizza-400 font-cairo hidden sm:inline">
            فرع فوه - حي المساكن
          </span>
        </div>

        {/* Rejection Alert if payment failed */}
        {order.status === "REJECTED" && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs sm:text-sm space-y-1">
            <p className="font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>نعتذر، لم يتم تأكيد إشعار التحويل.</span>
            </p>
            <p className="text-stone-600 dark:text-stone-400 text-xs">
              سبب الرفض: {order.payment?.rejectReason || "الإشعار غير مطابق."}
            </p>
            <p className="pt-2 text-xs font-bold">
              يرجى التواصل معنا عبر واتساب لمعالجة الطلب أو الدفع عند الاستلام نقداً في الفرع.
            </p>
          </div>
        )}
      </div>

      {/* Social Media Share Order Progress Card */}
      <OrderShareCard
        orderNumber={order.orderNumber}
        orderStatus={order.status}
        pickupTimeText={formattedPickupTime}
        trackingToken={order.trackingToken}
        itemsCount={order.items?.length || 0}
      />

      {/* Live Stone Oven Visualizer during Baking or Ready */}
      <StoneOvenLiveView
        orderStatus={order.status}
        orderNumber={order.orderNumber}
        pickupTimeText={formattedPickupTime}
      />

      {/* Steps Visual Progress Tracker */}
      <div className="bg-white dark:bg-stone-850 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white">
          مراحل تجهيز طلبك في المطبخ
        </h3>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={step.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-outfit text-xs font-bold transition-colors ${
                    step.isComplete
                      ? "bg-pizza-600 text-white shadow-md shadow-pizza-600/30"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                  } ${step.isActive ? "ring-4 ring-pizza-500/20 animate-pulse" : ""}`}
                >
                  {step.isComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-10 my-1 ${
                      step.isComplete
                        ? "bg-pizza-600"
                        : "bg-stone-200 dark:bg-stone-800"
                    }`}
                  />
                )}
              </div>

              <div className="pt-1">
                <h4
                  className={`text-sm font-bold font-cairo ${
                    step.isComplete
                      ? "text-stone-900 dark:text-white"
                      : "text-stone-400"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Feedback & Star Rating Form (Appears when order is Completed) */}
      {(order.status === "COMPLETED" || previewFeedback) && (
        <OrderFeedbackCard
          orderId={order.id}
          orderNumber={order.orderNumber}
          trackingToken={order.trackingToken}
          existingFeedback={order.feedback}
        />
      )}

      {/* Order Item Details Card */}
      <div className="bg-white dark:bg-stone-850 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-3">
          تفاصيل الأصناف المطلوبة
        </h3>

        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between items-start text-xs border-b border-stone-100 dark:border-stone-800/60 pb-3"
            >
              <div>
                <span className="font-bold text-stone-900 dark:text-white text-sm">
                  {item.quantity}x {language === "ar" ? item.productNameAr : item.productNameEn}
                </span>
                {item.options && item.options.length > 0 && (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {item.options
                      .map((o: any) => (language === "ar" ? o.nameAr : o.nameEn))
                      .join(" • ")}
                  </p>
                )}
                {item.itemNotes && (
                  <p className="text-[11px] text-pizza-600 mt-0.5 italic">
                    &quot;{item.itemNotes}&quot;
                  </p>
                )}
              </div>

              <span className="font-outfit font-black text-stone-900 dark:text-white text-sm">
                {item.subtotal.toLocaleString()} {dict.menu.currency}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-base font-black text-stone-900 dark:text-white pt-2">
          <span>إجمالي المبلغ:</span>
          <span className="text-xl text-pizza-700 dark:text-pizza-400 font-outfit">
            {order.total.toLocaleString()} {dict.menu.currency}
          </span>
        </div>
      </div>

      {/* Direct Actions: WhatsApp, Order History, Reorder */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href={`https://wa.me/967772207788?text=${encodeURIComponent(
            `مرحباً بيتزا هاوس، بخصوص طلبي رقم ${order.orderNumber}`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>{dict.tracking.helpWhatsApp}</span>
        </a>

        <Link
          href={`/history?phone=${encodeURIComponent(order.customerPhone.replace(/\D/g, ""))}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 px-6 py-3 rounded-2xl text-xs font-bold transition-all border border-stone-200 dark:border-stone-700"
        >
          <Clock className="w-4 h-4 text-pizza-600" />
          <span>{language === "ar" ? "سجل طلباتي السابقة" : "My Order History"}</span>
        </Link>

        <Link
          href="/menu"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-pizza-50 hover:bg-pizza-100 dark:bg-pizza-950/80 dark:hover:bg-pizza-900 text-pizza-700 dark:text-pizza-300 px-6 py-3 rounded-2xl text-xs font-bold transition-all border border-pizza-200 dark:border-pizza-900"
        >
          <Pizza className="w-4 h-4" />
          <span>{dict.tracking.backToMenu}</span>
        </Link>
      </div>

      {/* Real-time Toast Demonstration Button */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
        <button
          type="button"
          onClick={() => {
            const nextMock = order.status === "PREPARING" ? "READY" : "PREPARING";
            (window as any).__triggerTestOrderToast?.(nextMock);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 font-bold transition-colors text-[11px]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === "ar" ? "تجربة صوت وتنبيه التحديث الفوري 🔔" : "Test Live Toast & Chime Alert 🔔"}</span>
        </button>

        {order.status !== "COMPLETED" && (
          <button
            type="button"
            onClick={() => setPreviewFeedback(!previewFeedback)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-bold transition-colors text-[11px]"
          >
            <span>⭐</span>
            <span>
              {previewFeedback
                ? language === "ar"
                  ? "إخفاء نموذج التقييم"
                  : "Hide Feedback Form"
                : language === "ar"
                ? "معاينة نموذج تقييم الخدمة ⭐"
                : "Preview Feedback Form ⭐"}
            </span>
          </button>
        )}
      </div>

      <div className="text-center">
        {isOwner && order.trackingToken && ["PENDING", "PAYMENT_PENDING", "QUEUED"].includes(order.status) && (
          <div className="pt-2">
            {cancelError && (
              <p className="text-xs text-red-500 mb-2">{cancelError}</p>
            )}
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={isCancelling}
              className="text-xs text-red-600 dark:text-red-400 hover:underline font-bold disabled:opacity-50"
            >
              {isCancelling ? "جاري الإلغاء..." : "إلغاء هذا الطلب"}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-cairo">
                {language === "ar" ? "تأكيد إلغاء الطلب" : "Cancel Order Confirmation"}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === "ar"
                  ? "هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع بعد الإلغاء."
                  : "Are you sure you want to cancel this order? This cannot be undone."}
              </p>
            </div>

            {cancelError && (
              <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/60 p-2.5 rounded-xl">
                {cancelError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {language === "ar" ? "تراجع" : "Keep Order"}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isCancelling
                  ? language === "ar"
                    ? "جاري الإلغاء..."
                    : "Cancelling..."
                  : language === "ar"
                  ? "نعم، إلغاء الطلب"
                  : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
