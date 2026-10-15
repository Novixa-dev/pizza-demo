"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { createOrderAction } from "@/app/actions/orderActions";
import {
  validateCouponAction,
  ValidateCouponResult,
  getCustomerLoyaltyAction,
} from "@/app/actions/couponActions";
import {
  Clock,
  CalendarCheck,
  CreditCard,
  Building2,
  Upload,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Phone,
  User,
  FileText,
  X,
  Tag,
  Gift,
  Sparkles,
  Award,
} from "lucide-react";
import { TimeSlotOption } from "@/types";
import { recordCompletedOrderForReminders } from "@/lib/notifications/orderReminderService";

interface CheckoutClientViewProps {
  restaurant: any;
  availableSlots: TimeSlotOption[];
  restaurantStatus?: any;
}

export default function CheckoutClientView({
  restaurant,
  availableSlots = [],
  restaurantStatus,
}: CheckoutClientViewProps) {
  const { cart, cartTotal, clearCart, language, dict } = useApp();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loyaltyInfo, setLoyaltyInfo] = useState<any>(null);
  const [pickupMode, setPickupMode] = useState<"ASAP" | "SCHEDULED">(() => {
    if (
      restaurantStatus &&
      !restaurantStatus.canOrderImmediate &&
      restaurantStatus.canOrderScheduled
    ) {
      return "SCHEDULED";
    }
    return "ASAP";
  });
  const [selectedSlot, setSelectedSlot] = useState<string>(
    availableSlots?.find((s) => s.isAvailable)?.timeString || ""
  );

  // Pre-fill customer details from localStorage if available
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("ph_customer_phone");
      const savedName = localStorage.getItem("ph_customer_name");
      if (savedPhone) setCustomerPhone(savedPhone);
      if (savedName) setCustomerName(savedName);
    }
  }, []);

  // Sync selectedSlot when availableSlots updates or if current selection is invalid
  React.useEffect(() => {
    if (!selectedSlot || !availableSlots.some((s) => s.timeString === selectedSlot && s.isAvailable)) {
      const firstAvail = availableSlots.find((s) => s.isAvailable)?.timeString;
      if (firstAvail) {
        setSelectedSlot(firstAvail);
      }
    }
  }, [availableSlots, selectedSlot]);

  // Active automatic gift calculation based on cartTotal
  const activeGift = useMemo(() => {
    if (cartTotal >= 20000) {
      return {
        tier: "TIER2",
        name:
          language === "ar"
            ? "فطيرة شوكولاتة نوتيلا وموز مجانية"
            : language === "id"
            ? "Fatayer Nutella Pisang Cokelat Gratis"
            : "Free Nutella Banana Fatayer",
      };
    }
    if (cartTotal >= 12000) {
      return {
        tier: "TIER1",
        name:
          language === "ar"
            ? "بطاطس مقلية ذهبية مقرمشة مجانية"
            : language === "id"
            ? "Kentang Goreng Krispi Gratis"
            : "Free Crispy Golden Fries",
      };
    }
    return null;
  }, [cartTotal, language]);

  // Read URL search param ?coupon=...
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("coupon");
      if (codeParam) {
        const cleanCode = codeParam.trim().toUpperCase();
        setCouponInput(cleanCode);
        if (cartTotal > 0) {
          validateCouponAction({
            code: cleanCode,
            subtotal: cartTotal,
            customerPhone: customerPhone.trim() || undefined,
          }).then((res) => {
            if (res.success) setAppliedCoupon(res);
          });
        }
      }
    }
  }, [cartTotal, customerPhone]);

  // Check customer loyalty rewards status when phone changes
  useEffect(() => {
    const clean = customerPhone.replace(/\s+/g, "");
    if (clean.length >= 7) {
      getCustomerLoyaltyAction(clean).then((res) => {
        if (res.success && res.loyalty) {
          setLoyaltyInfo(res.loyalty);
        } else {
          setLoyaltyInfo(null);
        }
      });
    } else {
      setLoyaltyInfo(null);
    }
  }, [customerPhone]);

  const handleApplyCoupon = async () => {
    setCouponError(null);
    if (!couponInput.trim()) {
      setCouponError(dict.checkout.couponPlaceholder);
      return;
    }
    setCouponLoading(true);
    try {
      const res = await validateCouponAction({
        code: couponInput.trim(),
        subtotal: cartTotal,
        customerPhone: customerPhone.trim() || undefined,
      });
      if (res.success) {
        setAppliedCoupon(res);
        setCouponError(null);
      } else {
        setCouponError(res.message || dict.checkout.couponInvalid);
      }
    } catch (err) {
      setCouponError(dict.checkout.couponInvalid);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const finalPayableTotal = Math.max(0, cartTotal - couponDiscount);

  const [paymentMethod, setPaymentMethod] = useState<
    "PAY_AT_PICKUP" | "TRANSFER_KURAIMI" | "TRANSFER_AMQI" | "TRANSFER_BUSAIRI"
  >("PAY_AT_PICKUP");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptBase64, setReceiptBase64] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle local file selection and convert to Base64 data URI
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        language === "ar"
          ? "حجم الصورة يجب ألا يتجاوز 5 ميجابايت."
          : language === "id"
          ? "Ukuran gambar tidak boleh melebihi 5 MB."
          : "Image size must not exceed 5 MB."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage(dict.cart.emptyTitle);
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage(
        language === "ar"
          ? "يرجى إدخال اسم العميل."
          : language === "id"
          ? "Silakan masukkan nama pelanggan."
          : "Please enter your name."
      );
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage(
        language === "ar"
          ? "يرجى إدخال رقم الهاتف للتواصل."
          : language === "id"
          ? "Silakan masukkan nomor telepon untuk konfirmasi."
          : "Please enter your contact phone number."
      );
      return;
    }

    if (pickupMode === "SCHEDULED" && !selectedSlot) {
      setErrorMessage(
        language === "ar"
          ? "يرجى اختيار وقت الاستلام المفضل."
          : language === "id"
          ? "Silakan pilih waktu pengambilan yang diinginkan."
          : "Please select your preferred pickup time."
      );
      return;
    }

    if (paymentMethod !== "PAY_AT_PICKUP" && !receiptBase64) {
      setErrorMessage(
        language === "ar"
          ? "يرجى إرفاق صورة إشعار التحويل لتوثيق الحجز."
          : language === "id"
          ? "Silakan lampirkan bukti transfer untuk verifikasi pesanan."
          : "Please attach the transfer receipt to verify your order."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        pickupMode,
        requestedTime: pickupMode === "SCHEDULED" ? selectedSlot : undefined,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        receiptUrl: receiptBase64 || undefined,
        notes: notes.trim() || undefined,
        couponCode: appliedCoupon?.code || undefined,
        giftItemName: activeGift?.name || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedOptionIds: item.selectedOptions.map((o) => o.optionId),
          notes: item.notes,
        })),
      };

      const result = await createOrderAction(payload);

      if (!result.success) {
        setErrorMessage(
          result.error ||
            (language === "ar"
              ? "تعذر إتمام الطلب."
              : language === "id"
              ? "Gagal menyelesaikan pesanan."
              : "Failed to place order.")
        );
        setIsSubmitting(false);
        return;
      }

      // Success! Clear cart and redirect to order tracking screen
      if (typeof window !== "undefined") {
        localStorage.setItem("ph_customer_phone", customerPhone.trim());
        localStorage.setItem("ph_customer_name", customerName.trim());
        recordCompletedOrderForReminders({
          productName: cart[0]?.nameAr || cart[0]?.nameEn,
          productId: cart[0]?.productId,
          customerName: customerName.trim(),
        });
      }
      clearCart();
      window.location.href = `/track/${result.orderId}?token=${result.trackingToken}`;
    } catch (err) {
      console.error("Order submission error:", err);
      setErrorMessage(
        language === "ar"
          ? "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى."
          : language === "id"
          ? "Terjadi kesalahan saat menghubungi server. Silakan coba lagi."
          : "An error occurred connecting to server. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-cairo">
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white font-cairo">
            {dict.cart.emptyTitle}
          </h2>
          <p className="text-sm text-stone-400">{dict.cart.emptyDesc}</p>
          <a
            href="/menu"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] px-6 py-3 rounded-2xl font-bold text-sm shadow-md"
          >
            <span>{dict.cart.continueShopping}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-cairo text-white">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white font-cairo">
          {dict.checkout.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#EFCC80] font-bold">
          {language === "ar"
            ? "فرع وسط المدينة | استلام سريع ومجدول"
            : language === "id"
            ? "Cabang City Center - City Center | Pesanan Cepat & Terjadwal"
            : "City Center Branch - City Center | Instant & Scheduled Pickup"}
        </p>
      </div>

      {restaurant?.isOnlineOrderingPaused && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{restaurant.pauseMessageAr || dict.checkout.orderingPausedAlert}</span>
        </div>
      )}

      {restaurantStatus && !restaurantStatus.canOrderImmediate && restaurantStatus.canOrderScheduled && (
        <div className="mb-6 p-4 rounded-2xl bg-[#14181f] border border-[#C69843]/40 text-[#EFCC80] text-xs sm:text-sm flex items-center gap-3">
          <Clock className="w-5 h-5 flex-shrink-0 text-[#EFCC80]" />
          <span>
            {language === "ar"
              ? restaurantStatus.descriptionAr
              : restaurantStatus.descriptionEn}
            {language === "ar"
              ? " (تم توجيه الطلب تلقائياً إلى خيار \"الاستلام المجدول\")."
              : language === "id"
              ? " (Pesanan diarahkan secara otomatis ke opsi \"Pengambilan Terjadwal\")."
              : " (Order redirected automatically to \"Scheduled Pickup\")."}
          </span>
        </div>
      )}

      {restaurantStatus && !restaurantStatus.canOrderImmediate && !restaurantStatus.canOrderScheduled && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/50 border border-amber-600/40 text-amber-200 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>
            {language === "ar" ? restaurantStatus.descriptionAr : restaurantStatus.descriptionEn}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4-Step Checkout Progress Bar */}
      <div className="mb-8 bg-[#14181f]/90 backdrop-blur-md p-4 rounded-2xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black flex items-center justify-center text-xs font-outfit shadow-sm">1</span>
            <span className="font-bold text-[#EFCC80] text-[11px] truncate">
              {language === "ar" ? "بيانات العميل" : language === "id" ? "Data Pelanggan" : "Customer"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black flex items-center justify-center text-xs font-outfit shadow-sm">2</span>
            <span className="font-bold text-[#EFCC80] text-[11px] truncate">
              {language === "ar" ? "موعد الاستلام" : language === "id" ? "Waktu Ambil" : "Pickup Slot"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black flex items-center justify-center text-xs font-outfit shadow-sm">3</span>
            <span className="font-bold text-[#EFCC80] text-[11px] truncate">
              {language === "ar" ? "طريقة الدفع" : language === "id" ? "Pembayaran" : "Payment"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#0c0e12] border border-[#222934] text-stone-400 font-bold flex items-center justify-center text-xs font-outfit">4</span>
            <span className="font-bold text-stone-400 text-[11px] truncate">
              {language === "ar" ? "التأكيد والاستلام" : language === "id" ? "Konfirmasi" : "Confirm"}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Customer Information */}
          <div className="bg-[#14181f]/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#EFCC80]" />
              <span>{dict.checkout.customerInfo}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">
                  {dict.checkout.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={dict.checkout.fullNamePlaceholder}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#EFCC80] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">
                  {dict.checkout.phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={dict.checkout.phonePlaceholder}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#EFCC80] transition-colors font-outfit"
                />
                <p className="text-[10px] text-stone-400">
                  {language === "ar"
                    ? "أرقام يمن موبايل (77) / يو (73) / سبأفون (71) أو الهاتف الثابت"
                    : language === "id"
                    ? "Nomor telepon Yaman (77 / 73 / 71) atau WhatsApp aktif"
                    : "Yemeni carriers (77 / 73 / 71) or active WhatsApp"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Pickup Timing Strategy (The Key Innovation) */}
          <div className="bg-[#14181f]/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#EFCC80]" />
              <span>{dict.checkout.timingTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ASAP Option */}
              <button
                type="button"
                disabled={restaurantStatus && !restaurantStatus.canOrderImmediate}
                onClick={() => setPickupMode("ASAP")}
                className={`p-4 rounded-2xl border text-start transition-all ${
                  restaurantStatus && !restaurantStatus.canOrderImmediate
                    ? "opacity-50 cursor-not-allowed bg-[#0c0e12] border-[#222934] text-stone-500"
                    : pickupMode === "ASAP"
                    ? "border-[#EFCC80] bg-[#0c0e12] text-white shadow-[0_0_20px_rgba(239,204,128,0.15)]"
                    : "border-[#222934] hover:border-[#EFCC80]/40 bg-[#0c0e12]/60 text-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold">
                    {dict.checkout.asapLabel}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      pickupMode === "ASAP"
                        ? "border-[#EFCC80] bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04]"
                        : "border-stone-600"
                    }`}
                  >
                    {pickupMode === "ASAP" && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  {restaurantStatus && !restaurantStatus.canOrderImmediate
                    ? language === "ar"
                      ? "غير متاح حالياً (خارج ساعات العمل الفوري)"
                      : language === "id"
                      ? "Tidak tersedia saat ini (di luar jam buka langsung)"
                      : "Unavailable now (outside immediate hours)"
                    : dict.checkout.asapBadge}
                </p>
              </button>

              {/* Scheduled Option */}
              <button
                type="button"
                onClick={() => setPickupMode("SCHEDULED")}
                className={`p-4 rounded-2xl border text-start transition-all ${
                  pickupMode === "SCHEDULED"
                    ? "border-[#EFCC80] bg-[#0c0e12] text-white shadow-[0_0_20px_rgba(239,204,128,0.15)]"
                    : "border-[#222934] hover:border-[#EFCC80]/40 bg-[#0c0e12]/60 text-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold">
                    {dict.checkout.scheduledLabel}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      pickupMode === "SCHEDULED"
                        ? "border-[#EFCC80] bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04]"
                        : "border-stone-600"
                    }`}
                  >
                    {pickupMode === "SCHEDULED" && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  {language === "ar"
                    ? "حدد وقت وصولك لنجهزها طازجة فوراً"
                    : language === "id"
                    ? "Tentukan waktu kedatangan agar siap panas & segar"
                    : "Pick your pickup time so it's baked fresh upon arrival"}
                </p>
              </button>
            </div>

            {/* Slots Grid if Scheduled */}
            {pickupMode === "SCHEDULED" && (
              <div className="pt-3 space-y-2 border-t border-[#222934]">
                <label className="text-xs font-bold text-stone-300 block">
                  {dict.checkout.selectSlot}
                </label>

                {availableSlots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#0c0e12] text-center text-xs text-stone-400 border border-[#222934]">
                    {language === "ar"
                      ? "لا توجد فترات حجز متبقية لليوم. يمكنك التواصل مع خدمة العملاء عبر الواتساب للتنسيق."
                      : language === "id"
                      ? "Tidak ada slot tersisa untuk hari ini. Silakan hubungi layanan pelanggan via WhatsApp untuk koordinasi."
                      : "No slots remaining today. Contact customer service on WhatsApp for coordination."}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot.timeString}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot.timeString)}
                        className={`p-2.5 rounded-xl border text-xs font-bold font-outfit text-center transition-all ${
                          !slot.isAvailable
                            ? "opacity-35 cursor-not-allowed bg-[#0c0e12] border-[#222934] text-stone-500"
                            : selectedSlot === slot.timeString
                            ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black border-transparent shadow-md"
                            : "bg-[#0c0e12] text-stone-200 border border-[#222934] hover:border-[#EFCC80]/40"
                        }`}
                      >
                        <div>
                          {language === "ar"
                            ? slot.displayLabelAr
                            : (language === "id" && (slot as any).displayLabelId)
                            ? (slot as any).displayLabelId
                            : slot.displayLabelEn}
                        </div>
                        {!slot.isAvailable && (
                          <span className="text-[9px] block text-red-400 font-cairo mt-0.5">
                            {slot.reason || dict.checkout.slotFull}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-[#14181f]/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#EFCC80]" />
              <span>{dict.checkout.paymentTitle}</span>
            </h3>

            <div className="space-y-3">
              {/* Pay at Pickup */}
              <label className="p-3.5 rounded-2xl border border-[#222934] bg-[#0c0e12]/80 hover:border-[#EFCC80]/40 flex items-start gap-3 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "PAY_AT_PICKUP"}
                  onChange={() => setPaymentMethod("PAY_AT_PICKUP")}
                  className="mt-1 accent-[#EFCC80]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block">
                    {dict.checkout.payAtPickup}
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    {dict.checkout.payAtPickupDesc}
                  </span>
                </div>
              </label>

              {/* Kuraimi Transfer */}
              <label className="p-3.5 rounded-2xl border border-[#222934] bg-[#0c0e12]/80 hover:border-[#EFCC80]/40 flex items-start gap-3 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "TRANSFER_KURAIMI"}
                  onChange={() => setPaymentMethod("TRANSFER_KURAIMI")}
                  className="mt-1 accent-[#EFCC80]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block">
                    {language === "ar"
                      ? "تحويل عبر بنك الكريمي (حاسب / إم فلوس)"
                      : language === "id"
                      ? "Transfer via Bank Kuraimi (Haseb / M-Flous)"
                      : "Transfer via Kuraimi Bank (Haseb / M-Flous)"}
                  </span>
                  <span className="text-[11px] text-[#EFCC80]/80 block mt-0.5">
                    {dict.checkout.kuraimiAcc}
                  </span>
                </div>
              </label>

              {/* Al-Amqi Transfer */}
              <label className="p-3.5 rounded-2xl border border-[#222934] bg-[#0c0e12]/80 hover:border-[#EFCC80]/40 flex items-start gap-3 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "TRANSFER_AMQI"}
                  onChange={() => setPaymentMethod("TRANSFER_AMQI")}
                  className="mt-1 accent-[#EFCC80]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block">
                    {language === "ar"
                      ? "تحويل عبر شركة العمقي للصرافة"
                      : language === "id"
                      ? "Transfer via Al-Amqi Exchange"
                      : "Transfer via Al-Amqi Exchange"}
                  </span>
                  <span className="text-[11px] text-[#EFCC80]/80 block mt-0.5">
                    {dict.checkout.amqiAcc}
                  </span>
                </div>
              </label>

              {/* Al-Busairi Transfer */}
              <label className="p-3.5 rounded-2xl border border-[#222934] bg-[#0c0e12]/80 hover:border-[#EFCC80]/40 flex items-start gap-3 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "TRANSFER_BUSAIRI"}
                  onChange={() => setPaymentMethod("TRANSFER_BUSAIRI")}
                  className="mt-1 accent-[#EFCC80]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block">
                    {language === "ar"
                      ? "تحويل عبر شركة البسيري للصرافة"
                      : language === "id"
                      ? "Transfer via Al-Busairi Exchange"
                      : "Transfer via Al-Busairi Exchange"}
                  </span>
                  <span className="text-[11px] text-[#EFCC80]/80 block mt-0.5">
                    {dict.checkout.busairiAcc}
                  </span>
                </div>
              </label>
            </div>

            {/* Receipt Upload Box if Transfer is selected */}
            {paymentMethod !== "PAY_AT_PICKUP" && (
              <div className="pt-4 border-t border-[#222934] space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-300 block">
                    {dict.checkout.uploadReceipt} *
                  </label>
                  <div className="border-2 border-dashed border-[#222934] hover:border-[#EFCC80]/50 rounded-2xl p-4 text-center transition-colors bg-[#0c0e12]">
                    <input
                      type="file"
                      id="receiptFile"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="receiptFile"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-6 h-6 text-[#EFCC80]" />
                      <span className="text-xs font-bold text-stone-200">
                        {receiptBase64
                          ? language === "ar"
                            ? "تم اختيار صورة الإشعار (انقر للتغيير)"
                            : language === "id"
                            ? "Bukti transfer dipilih (klik untuk ganti)"
                            : "Receipt selected (click to change)"
                          : dict.checkout.chooseFile}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {language === "ar"
                          ? "الحد الأقصى 5 ميجابايت (JPG, PNG)"
                          : language === "id"
                          ? "Maksimum 5 MB (JPG, PNG)"
                          : "Max 5 MB (JPG, PNG)"}
                      </span>
                    </label>

                    {receiptBase64 && (
                      <div className="mt-3 inline-block relative rounded-xl overflow-hidden border border-[#222934] max-h-36">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={receiptBase64}
                          alt="Receipt Preview"
                          className="h-32 object-contain bg-black"
                        />
                        <button
                          type="button"
                          onClick={() => setReceiptBase64("")}
                          className="absolute top-1.5 end-1.5 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors"
                          title={
                            language === "ar"
                              ? "حذف صورة الإشعار"
                              : language === "id"
                              ? "Hapus bukti transfer"
                              : "Delete receipt image"
                          }
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">
                    {dict.checkout.referenceNumber}
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder={dict.checkout.referencePlaceholder}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#EFCC80] font-outfit transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Optional Order Notes */}
          <div className="bg-[#14181f]/90 backdrop-blur-md p-5 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-2">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#EFCC80]" />
              <span>{dict.checkout.notes}</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={dict.checkout.notesPlaceholder}
              className="w-full text-xs p-3 rounded-xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#EFCC80] transition-colors"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#14181f]/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-white border-b border-[#222934] pb-3">
              {language === "ar"
                ? "ملخص طلبك"
                : language === "id"
                ? "Ringkasan Pesanan"
                : "Order Summary"}{" "}
              ({cart.length}{" "}
              {language === "ar" ? "أصناف" : language === "id" ? "item" : "items"})
            </h3>

            {/* Items scroll */}
            <div className="space-y-3 max-h-64 overflow-y-auto pe-1">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex justify-between items-start text-xs border-b border-[#222934]/60 pb-2"
                >
                  <div>
                    <span className="font-bold text-white">
                      {item.quantity}x{" "}
                      {language === "ar"
                        ? item.nameAr
                        : (language === "id" && item.nameId)
                        ? item.nameId
                        : item.nameEn}
                    </span>
                    {item.selectedOptions?.length > 0 && (
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {item.selectedOptions
                          .map((o) =>
                            language === "ar"
                              ? o.optionNameAr
                              : (language === "id" && o.optionNameId)
                              ? o.optionNameId
                              : o.optionNameEn
                          )
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                  <span className="font-outfit font-black text-[#EFCC80]">
                    {item.subtotal.toLocaleString()} {dict.menu.currency}
                  </span>
                </div>
              ))}

              {/* Automatic Gift Item Row */}
              {activeGift && (
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
                    <span className="font-bold">{activeGift.name}</span>
                  </div>
                  <span className="font-outfit font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px]">
                    0 {dict.menu.currency} ({dict.cart.freeGiftBadge})
                  </span>
                </div>
              )}
            </div>

            {/* Loyalty Reward Indicator */}
            {loyaltyInfo?.isRewardAvailable && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-700/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-bold text-[11px]">
                  {dict.checkout.loyaltyReward}:{" "}
                  {language === "ar"
                    ? "مؤهل لصنف مجاني من برنامج الولاء!"
                    : language === "id"
                    ? "Berhak atas item gratis dari program loyalitas!"
                    : "Eligible for a free item from rewards program!"}
                </span>
              </div>
            )}

            {/* Coupon Section */}
            <div className="pt-2 border-t border-[#222934] space-y-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#EFCC80]" />
                <span>{dict.checkout.couponTitle}</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-black text-[#EFCC80] uppercase tracking-wider font-outfit">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[10px] text-emerald-300">
                        {dict.checkout.couponApplied} (
                        {appliedCoupon.discountType === "PERCENTAGE" && `${appliedCoupon.discountValue}%`}
                        {appliedCoupon.discountType === "FIXED" &&
                          `${appliedCoupon.discountValue} ${dict.menu.currency}`}
                        {appliedCoupon.discountType === "FREE_ITEM" &&
                          (language === "ar"
                            ? "صنف مجاني"
                            : language === "id"
                            ? "Item Gratis"
                            : "Free Item")}
                        )
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-lg text-stone-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title={
                      language === "ar"
                        ? "إزالة الكوبون"
                        : language === "id"
                        ? "Hapus kupon"
                        : "Remove coupon"
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder={dict.checkout.couponPlaceholder}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#EFCC80] font-outfit uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-3 py-2 rounded-xl bg-[#1c222b] hover:bg-[#252e3b] text-[#EFCC80] border border-[#2e3745] font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {couponLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-[#EFCC80] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>{dict.checkout.applyCoupon}</span>
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-400 font-bold">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="pt-2 space-y-2 border-t border-[#222934] text-xs">
              <div className="flex justify-between text-stone-400">
                <span>
                  {language === "ar"
                    ? "المجموع الفرعي:"
                    : language === "id"
                    ? "Subtotal:"
                    : "Subtotal:"}
                </span>
                <span className="font-outfit font-bold text-white">
                  {cartTotal.toLocaleString()} {dict.menu.currency}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>{dict.checkout.discount}:</span>
                  <span className="font-outfit">
                    -{couponDiscount.toLocaleString()} {dict.menu.currency}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#222934]">
                <span>
                  {language === "ar"
                    ? "الإجمالي للدفع:"
                    : language === "id"
                    ? "Total Bayar:"
                    : "Total Payable:"}
                </span>
                <span className="text-xl text-[#EFCC80] font-outfit font-black">
                  {finalPayableTotal.toLocaleString()} {dict.menu.currency}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                restaurant?.isOnlineOrderingPaused ||
                (restaurantStatus &&
                  !restaurantStatus.canOrderImmediate &&
                  !restaurantStatus.canOrderScheduled)
              }
              className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
                isSubmitting ||
                restaurant?.isOnlineOrderingPaused ||
                (restaurantStatus &&
                  !restaurantStatus.canOrderImmediate &&
                  !restaurantStatus.canOrderScheduled)
                  ? "bg-[#14181f] text-stone-500 cursor-not-allowed shadow-none border border-[#222934]"
                  : "bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 text-[#2C1A04] font-black shadow-xl shadow-[#EFCC80]/20 font-cairo cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#2C1A04] border-t-transparent animate-spin" />
                  <span>
                    {language === "ar"
                      ? "جاري تأكيد وتسجيل الطلب..."
                      : language === "id"
                      ? "Memproses dan mendaftarkan pesanan..."
                      : "Confirming & recording order..."}
                  </span>
                </span>
              ) : (
                <>
                  <span>{dict.checkout.placeOrder}</span>
                  {language === "ar" ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
