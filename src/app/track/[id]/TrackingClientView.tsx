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
  Bell,
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
        setCancelError(
          res.error ||
            (language === "ar"
              ? "تعذر إلغاء الطلب."
              : language === "id"
              ? "Gagal membatalkan pesanan."
              : "Failed to cancel order.")
        );
      }
    } catch {
      setCancelError(
        language === "ar"
          ? "حدث خطأ أثناء الاتصال بالخادم."
          : language === "id"
          ? "Terjadi kesalahan saat menghubungi server."
          : "An error occurred connecting to the server."
      );
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
      label:
        language === "ar"
          ? "تم الاستلام والحجز"
          : language === "id"
          ? "Pesanan Diterima & Masuk Antrean"
          : "Order Confirmed & Queued",
      desc:
        language === "ar"
          ? "تم تسجيل الطلب في النظام"
          : language === "id"
          ? "Pesanan tercatat rapi dalam sistem"
          : "Order registered in system",
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
      label:
        language === "ar"
          ? "في الفرن (جاري التحضير)"
          : language === "id"
          ? "Sedang Dipanggang di Oven Batu"
          : "Baking in Stone Oven",
      desc:
        language === "ar"
          ? "يتم فرد العجينة وخبز البيتزا حالياً"
          : language === "id"
          ? "Adonan dibentangkan & dipanggang di oven batu"
          : "Dough hand-stretched & baking",
      isComplete: ["PREPARING", "READY", "COMPLETED"].includes(order.status),
      isActive: order.status === "PREPARING",
    },
    {
      key: "READY",
      label:
        language === "ar"
          ? "جاهز للاستلام!"
          : language === "id"
          ? "Siap Diambil!"
          : "Ready for Pickup!",
      desc:
        language === "ar"
          ? "الطلب ساخن وجاهز في فرع فوه"
          : language === "id"
          ? "Pesanan panas siap di cabang Fuwah"
          : "Hot & ready at Fuwah branch",
      isComplete: ["READY", "COMPLETED"].includes(order.status),
      isActive: order.status === "READY",
    },
    {
      key: "COMPLETED",
      label:
        language === "ar"
          ? "تم التسليم بنجاح"
          : language === "id"
          ? "Pesanan Telah Selesai"
          : "Completed Successfully",
      desc:
        language === "ar"
          ? "بالهناء والشفاء!"
          : language === "id"
          ? "Selamat menikmati hidangan lezat!"
          : "Enjoy your meal!",
      isComplete: order.status === "COMPLETED",
    },
  ];

  const formattedPickupTime = React.useMemo(() => {
    if (!order.requestedPickupTime) return "";
    try {
      const pickupDate = new Date(order.requestedPickupTime);
      return pickupDate.toLocaleTimeString(
        language === "ar" ? "ar-YE" : language === "id" ? "id-ID" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Aden",
        }
      );
    } catch {
      return "";
    }
  }, [order.requestedPickupTime, language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-cairo">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Card: Order Reference & Refresh */}
      <div className="bg-[#14181f]/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <span className="text-xs text-[#EFCC80] font-bold font-cairo">
              {language === "ar" ? "بيتزا هاوس المكلا" : "Pizza House Mukalla"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit">
              {order.orderNumber}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-1.5 text-xs text-stone-300 bg-[#0c0e12] border border-[#222934] hover:border-[#C69843]/40 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-[#C69843] ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>
                {language === "ar"
                  ? "تحديث الحالة"
                  : language === "id"
                  ? "Perbarui Status"
                  : "Refresh Status"}
              </span>
            </button>

            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                order.status === "READY"
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 animate-pulse"
                  : order.status === "PREPARING"
                  ? "bg-amber-950/80 text-[#EFCC80] border border-amber-500/40"
                  : order.status === "REJECTED"
                  ? "bg-red-950/80 text-red-300 border border-red-500/40"
                  : "bg-[#0c0e12] text-stone-300 border border-white/10"
              }`}
            >
              {order.status === "READY"
                ? language === "ar"
                  ? "جاهز للاستلام الآن!"
                  : language === "id"
                  ? "Siap diambil sekarang!"
                  : "Ready for pickup now!"
                : order.status === "PREPARING"
                ? language === "ar"
                  ? "في الفرن (جاري التحضير)"
                  : language === "id"
                  ? "Sedang dipanggang di oven batu"
                  : "Baking in stone oven"
                : order.status === "QUEUED"
                ? language === "ar"
                  ? "مجدول بانتظار وقت الخبز"
                  : language === "id"
                  ? "Terjadwal menunggu antrean"
                  : "Scheduled in queue"
                : order.status === "PAYMENT_PENDING"
                ? language === "ar"
                  ? "بانتظار التحقق من الإشعار"
                  : language === "id"
                  ? "Menunggu verifikasi bukti transfer"
                  : "Pending transfer verification"
                : order.status === "REJECTED"
                ? language === "ar"
                  ? "تم رفض الإشعار"
                  : language === "id"
                  ? "Bukti transfer ditolak"
                  : "Transfer rejected"
                : order.status === "COMPLETED"
                ? language === "ar"
                  ? "تم الاستلام بنجاح"
                  : language === "id"
                  ? "Pesanan telah selesai"
                  : "Successfully completed"
                : language === "ar"
                ? "تم تأكيد الطلب"
                : language === "id"
                ? "Pesanan dikonfirmasi"
                : "Order confirmed"}
            </span>
          </div>
        </div>

        {/* Scheduled Delivery Banner */}
        <div className="bg-[#0c0e12] p-4 rounded-2xl border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shadow-md shadow-amber-950/40">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block font-cairo">
                {language === "ar"
                  ? "موعد الاستلام المحدد من الفرع:"
                  : language === "id"
                  ? "Waktu Pengambilan di Cabang:"
                  : "Scheduled Pickup Time:"}
              </span>
              <span suppressHydrationWarning className="text-base font-black text-[#EFCC80] font-outfit">
                {formattedPickupTime}{" "}
                (
                {order.pickupMode === "ASAP"
                  ? language === "ar"
                    ? "أسرع وقت"
                    : language === "id"
                    ? "Secepatnya"
                    : "ASAP"
                  : language === "ar"
                  ? "طلب مجدول"
                  : language === "id"
                  ? "Terjadwal"
                  : "Scheduled"}
                )
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#EFCC80] font-cairo hidden sm:inline">
            {language === "ar"
              ? "فرع فوه - حي المساكن"
              : language === "id"
              ? "Cabang Fuwah - Al-Masaken"
              : "Fuwah Branch - Al-Masaken"}
          </span>
        </div>

        {/* Rejection Alert if payment failed */}
        {order.status === "REJECTED" && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs sm:text-sm space-y-1">
            <p className="font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>
                {language === "ar"
                  ? "نعتذر، لم يتم تأكيد إشعار التحويل."
                  : language === "id"
                  ? "Mohon maaf, bukti transfer tidak dapat diverifikasi."
                  : "Sorry, the transfer receipt could not be verified."}
              </span>
            </p>
            <p className="text-stone-400 text-xs">
              {language === "ar"
                ? "سبب الرفض: "
                : language === "id"
                ? "Alasan penolakan: "
                : "Reject reason: "}
              {order.payment?.rejectReason ||
                (language === "ar"
                  ? "الإشعار غير مطابق."
                  : language === "id"
                  ? "Bukti transfer tidak sesuai."
                  : "Receipt mismatch.")}
            </p>
            <p className="pt-2 text-xs font-bold">
              {language === "ar"
                ? "يرجى التواصل معنا عبر واتساب لمعالجة الطلب أو الدفع عند الاستلام نقداً في الفرع."
                : language === "id"
                ? "Silakan hubungi kami via WhatsApp untuk memproses pesanan atau bayar tunai langsung di cabang."
                : "Please contact us via WhatsApp to resolve your order or pay cash upon pickup at the branch."}
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
      <div className="bg-[#14181f]/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-6">
        <h3 className="text-base font-bold text-white font-cairo flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#C69843]" />
          <span>
            {language === "ar"
              ? "مراحل تجهيز طلبك في الفرن الحجري"
              : language === "id"
              ? "Tahapan Pesanan di Oven Batu"
              : "Stone Oven Order Stages"}
          </span>
        </h3>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={step.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-outfit text-xs font-bold transition-all ${
                    step.isComplete
                      ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40"
                      : "bg-[#0c0e12] text-stone-500 border border-white/10"
                  } ${step.isActive ? "ring-4 ring-[#EFCC80]/30 animate-pulse" : ""}`}
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
                        ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843]"
                        : "bg-white/10"
                    }`}
                  />
                )}
              </div>

              <div className="pt-1">
                <h4
                  className={`text-sm font-bold font-cairo ${
                    step.isComplete
                      ? "text-white"
                      : "text-stone-400"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
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
      <div className="bg-[#14181f]/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
        <h3 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
          <span>
            {language === "ar"
              ? "تفاصيل الأصناف المطلوبة"
              : language === "id"
              ? "Rincian Item Pesanan"
              : "Order Item Details"}
          </span>
          <span className="text-xs text-[#EFCC80] font-normal">
            {order.items?.length || 0}{" "}
            {language === "ar" ? "أصناف" : language === "id" ? "item" : "items"}
          </span>
        </h3>

        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between items-start text-xs border-b border-white/5 pb-3"
            >
              <div>
                <span className="font-bold text-white text-sm">
                  {item.quantity}x{" "}
                  {language === "ar"
                    ? item.productNameAr
                    : (language === "id" && item.productNameId)
                    ? item.productNameId
                    : item.productNameEn}
                </span>
                {item.options && item.options.length > 0 && (
                  <p className="text-[11px] text-[#EFCC80] mt-0.5">
                    {item.options
                      .map((o: any) =>
                        language === "ar"
                          ? o.nameAr
                          : (language === "id" && o.nameId)
                          ? o.nameId
                          : o.nameEn
                      )
                      .join(" • ")}
                  </p>
                )}
                {item.itemNotes && (
                  <p className="text-[11px] text-amber-300 mt-0.5 italic">
                    &quot;{item.itemNotes}&quot;
                  </p>
                )}
              </div>

              <span className="font-outfit font-black text-white text-sm">
                {item.subtotal.toLocaleString()} {dict.menu.currency}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-base font-black text-white pt-2 border-t border-white/10">
          <span>
            {language === "ar"
              ? "إجمالي المبلغ:"
              : language === "id"
              ? "Total Pembayaran:"
              : "Total Amount:"}
          </span>
          <span className="text-xl sm:text-2xl text-[#EFCC80] font-outfit">
            {order.total.toLocaleString()} {dict.menu.currency}
          </span>
        </div>
      </div>

      {/* Direct Actions: WhatsApp, Order History, Reorder */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href={`https://wa.me/967772207788?text=${encodeURIComponent(
            language === "ar"
              ? `مرحباً بيتزا هاوس، بخصوص طلبي رقم ${order.orderNumber}`
              : language === "id"
              ? `Halo Pizza House, mengenai pesanan saya nomor ${order.orderNumber}`
              : `Hello Pizza House, regarding my order #${order.orderNumber}`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer font-cairo"
        >
          <Phone className="w-4 h-4" />
          <span>{dict.tracking.helpWhatsApp}</span>
        </a>

        <Link
          href={`/history?phone=${encodeURIComponent(order.customerPhone.replace(/\D/g, ""))}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#14181f] hover:bg-[#1c212d] text-stone-200 hover:text-white px-6 py-3.5 rounded-2xl text-xs font-bold transition-all border border-[#222934] hover:border-[#EFCC80]/40 font-cairo"
        >
          <Clock className="w-4 h-4 text-[#C69843]" />
          <span>
            {language === "ar"
              ? "سجل طلباتي السابقة"
              : language === "id"
              ? "Riwayat Pesanan Saya"
              : "My Order History"}
          </span>
        </Link>

        <Link
          href="/menu"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-black px-6 py-3.5 rounded-2xl text-xs shadow-md shadow-amber-950/40 transition-all active:scale-95 font-cairo"
        >
          <Pizza className="w-4 h-4 fill-current" />
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 font-bold transition-colors text-[11px] font-cairo"
        >
          <Bell className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {language === "ar"
              ? "تجربة صوت وتنبيه التحديث الفوري 🔔"
              : language === "id"
              ? "Tes Notifikasi & Suara 🔔"
              : "Test Live Toast & Chime Alert 🔔"}
          </span>
        </button>

        {order.status !== "COMPLETED" && (
          <button
            type="button"
            onClick={() => setPreviewFeedback(!previewFeedback)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-bold transition-colors text-[11px] font-cairo"
          >
            <span>⭐</span>
            <span>
              {previewFeedback
                ? language === "ar"
                  ? "إخفاء نموذج التقييم"
                  : language === "id"
                  ? "Sembunyikan Formulir Ulasan"
                  : "Hide Feedback Form"
                : language === "ar"
                ? "معاينة نموذج تقييم الخدمة ⭐"
                : language === "id"
                ? "Beri Ulasan Layanan ⭐"
                : "Preview Feedback Form ⭐"}
            </span>
          </button>
        )}
      </div>

      <div className="text-center font-cairo">
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
              {isCancelling
                ? language === "ar"
                  ? "جاري الإلغاء..."
                  : language === "id"
                  ? "Membatalkan..."
                  : "Cancelling..."
                : language === "ar"
                ? "إلغاء هذا الطلب"
                : language === "id"
                ? "Batalkan pesanan ini"
                : "Cancel this order"}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#14181f] rounded-3xl max-w-sm w-full p-6 border border-[#C69843]/40 shadow-2xl space-y-4 text-center font-cairo">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-cairo">
                {language === "ar"
                  ? "تأكيد إلغاء الطلب"
                  : language === "id"
                  ? "Konfirmasi Pembatalan Pesanan"
                  : "Cancel Order Confirmation"}
              </h3>
              <p className="text-xs text-stone-400">
                {language === "ar"
                  ? "هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع بعد الإلغاء."
                  : language === "id"
                  ? "Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan."
                  : "Are you sure you want to cancel this order? This cannot be undone."}
              </p>
            </div>

            {cancelError && (
              <p className="text-xs text-red-300 bg-red-950/60 border border-red-500/40 p-2.5 rounded-xl">
                {cancelError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#222934] bg-[#0c0e12] text-xs font-bold text-stone-300 hover:text-white transition-colors"
              >
                {language === "ar" ? "تراجع" : language === "id" ? "Kembali" : "Keep Order"}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isCancelling
                  ? language === "ar"
                    ? "جاري الإلغاء..."
                    : language === "id"
                    ? "Membatalkan..."
                    : "Cancelling..."
                  : language === "ar"
                  ? "نعم، إلغاء الطلب"
                  : language === "id"
                  ? "Ya, Batalkan Pesanan"
                  : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
