"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { createOrderAction } from "@/app/actions/orderActions";
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
  Copy,
  Check,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Flame,
  Info,
  Banknote,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { TimeSlotOption } from "@/types";
import { recordCompletedOrderForReminders } from "@/lib/notifications/orderReminderService";
import { YEMENI_PHONE_REGEX } from "@/lib/validation";

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
  const { cart, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart, language, dict } = useApp();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Determine initial pickup mode safely
  const [pickupMode, setPickupMode] = useState<"ASAP" | "SCHEDULED">(() => {
    if (restaurantStatus && !restaurantStatus.canOrderImmediate) {
      return "SCHEDULED";
    }
    return "ASAP";
  });

  // Pick first available slot or fallback
  const firstAvailableSlot =
    availableSlots.find((s) => s.isAvailable)?.timeString ||
    availableSlots[0]?.timeString ||
    "08:00";

  const [selectedSlot, setSelectedSlot] = useState<string>(firstAvailableSlot);

  const [paymentMethod, setPaymentMethod] = useState<
    "PAY_AT_PICKUP" | "TRANSFER_KURAIMI" | "TRANSFER_AMQI" | "TRANSFER_BUSAIRI"
  >("PAY_AT_PICKUP");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptBase64, setReceiptBase64] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; phone?: boolean; receipt?: boolean }>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill customer details from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("ph_customer_phone");
      const savedName = localStorage.getItem("ph_customer_name");
      if (savedPhone) setCustomerPhone(savedPhone);
      if (savedName) setCustomerName(savedName);
    }
  }, []);

  // Ensure a valid slot is always selected if availableSlots exists
  useEffect(() => {
    if (!selectedSlot || !availableSlots.some((s) => s.timeString === selectedSlot)) {
      const first = availableSlots.find((s) => s.isAvailable)?.timeString || availableSlots[0]?.timeString;
      if (first) {
        setSelectedSlot(first);
      }
    }
  }, [availableSlots, selectedSlot]);

  // Validation helpers
  const cleanPhone = customerPhone.replace(/\s+/g, "");
  const isPhoneValid = YEMENI_PHONE_REGEX.test(cleanPhone);
  const isNameValid = customerName.trim().length >= 2;
  const isReceiptValid = paymentMethod === "PAY_AT_PICKUP" || Boolean(receiptBase64);

  // Step-by-step console logging audit for live state evaluation
  useEffect(() => {
    const missingFields: string[] = [];
    if (!isNameValid) missingFields.push("Customer Name (must be >= 2 characters)");
    if (!isPhoneValid) missingFields.push("Customer Phone (must be a valid 9-digit Yemeni number)");
    if (!isReceiptValid) missingFields.push("Receipt image (required for bank transfers)");
    if (pickupMode === "SCHEDULED" && !selectedSlot) missingFields.push("Pickup time slot");
    if (cart.length === 0) missingFields.push("Cart is empty");

    console.log("%c[Checkout Audit: Live Evaluation]", "color: #ea580c; font-weight: bold;", {
      customerName: { value: customerName, valid: isNameValid },
      customerPhone: { value: customerPhone, clean: cleanPhone, valid: isPhoneValid },
      pickupTiming: { mode: pickupMode, selectedSlot, hasAvailableSlots: availableSlots.length > 0 },
      payment: { method: paymentMethod, receiptAttached: Boolean(receiptBase64) },
      cart: { itemsCount: cart.length, total: cartTotal },
      submitButtonState: { isSubmitting, disabled: isSubmitting },
      isFormReadyToSubmit: missingFields.length === 0,
      missingFields,
    });
  }, [
    customerName,
    customerPhone,
    cleanPhone,
    paymentMethod,
    receiptBase64,
    pickupMode,
    selectedSlot,
    cart.length,
    cartTotal,
    isSubmitting,
    isNameValid,
    isPhoneValid,
    isReceiptValid,
    availableSlots.length,
  ]);

  // Copy to clipboard helper
  const handleCopyAccount = (accountNumber: string, id: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Quick-fill test data helper
  const handleQuickFill = () => {
    console.log("[Checkout Audit] Quick Fill triggered - Populating valid sample data");
    setCustomerName("أحمد بازهير");
    setCustomerPhone("771234567");
    setPaymentMethod("PAY_AT_PICKUP");
    setErrorMessage(null);
    setFieldErrors({});
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(language === "ar" ? "حجم الصورة يجب ألا يتجاوز 5 ميجابايت." : "Image size must not exceed 5MB.");
      return;
    }

    setReceiptFileName(file.name);
    setFieldErrors((prev) => ({ ...prev, receipt: false }));
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
      console.log("[Checkout Audit] Receipt image loaded successfully:", file.name, `(${file.size} bytes)`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const errors: { name?: boolean; phone?: boolean; receipt?: boolean } = {};

    console.log("%c[Checkout Audit: Submission Initiated]", "color: #2563eb; font-weight: bold;", {
      customerName,
      customerPhone,
      cleanPhone,
      pickupMode,
      selectedSlot,
      paymentMethod,
      hasReceipt: Boolean(receiptBase64),
      cartCount: cart.length,
      cartTotal,
    });

    // Step 1: Cart Items Check
    console.log("[Checkout Audit: Step 1/5] Cart Check -> items count:", cart.length);
    if (cart.length === 0) {
      console.warn("[Checkout Audit: BLOCKED at Step 1] Cart is empty.");
      setErrorMessage(dict.cart.emptyTitle);
      return;
    }

    // Step 2: Customer Name Check
    console.log("[Checkout Audit: Step 2/5] Customer Name Check ->", { customerName, valid: isNameValid });
    if (!isNameValid) {
      console.warn("[Checkout Audit: BLOCKED at Step 2] Customer Name is invalid (< 2 chars).");
      errors.name = true;
      setFieldErrors(errors);
      setErrorMessage(language === "ar" ? "يرجى كتابة اسم العميل للتسجيل." : "Please enter customer name.");
      nameInputRef.current?.focus();
      return;
    }

    // Step 3: Yemeni Mobile Phone Check
    console.log("[Checkout Audit: Step 3/5] Customer Phone Check ->", { customerPhone, clean: cleanPhone, valid: isPhoneValid });
    if (!isPhoneValid) {
      console.warn("[Checkout Audit: BLOCKED at Step 3] Customer Phone is invalid. Must match Yemeni mobile (77, 73, 71, 78, 70).");
      errors.phone = true;
      setFieldErrors(errors);
      setErrorMessage(
        language === "ar"
          ? "يرجى إدخال رقم هاتف يمني صالح (يبدأ بـ 77 أو 73 أو 71 أو 78 أو 70 ويتكون من 9 أرقام)."
          : "Please enter a valid 9-digit Yemeni phone number (starts with 77, 73, 71, 78, 70)."
      );
      phoneInputRef.current?.focus();
      return;
    }

    // Step 4: Pickup Timing Check
    const activeSlot = selectedSlot || firstAvailableSlot || "08:00";
    console.log("[Checkout Audit: Step 4/5] Pickup Timing Check ->", { pickupMode, activeSlot });

    // Step 5: Payment Method & Receipt Check
    console.log("[Checkout Audit: Step 5/5] Payment & Receipt Check ->", { paymentMethod, hasReceipt: Boolean(receiptBase64) });
    if (paymentMethod !== "PAY_AT_PICKUP" && !receiptBase64) {
      console.warn("[Checkout Audit: BLOCKED at Step 5] Bank transfer selected without receipt image.");
      errors.receipt = true;
      setFieldErrors(errors);
      setErrorMessage(
        language === "ar"
          ? "يرجى إرفاق صورة إشعار التحويل لتوثيق الحجز، أو اختر 'الدفع عند الاستلام' لطلب بدون إشعار."
          : "Please attach receipt or select Pay at Pickup."
      );
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    console.log("%c[Checkout Audit: ALL 5 STEPS PASSED] Calling createOrderAction...", "color: #16a34a; font-weight: bold;");

    try {
      const activeSlot = selectedSlot || firstAvailableSlot || "08:00";
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        pickupMode,
        requestedTime: pickupMode === "SCHEDULED" ? activeSlot : undefined,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        receiptUrl: receiptBase64 || undefined,
        notes: notes.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedOptionIds: item.selectedOptions.map((o) => o.optionId),
          notes: item.notes,
        })),
      };

      const result = await createOrderAction(payload);

      if (!result.success) {
        setErrorMessage(result.error || (language === "ar" ? "تعذر إتمام الطلب." : "Could not complete order."));
        setIsSubmitting(false);
        return;
      }

      // Success! Save customer preferences and redirect to tracking
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
          : "Error connecting to server. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // If cart is empty
  const handleAddSampleItem = () => {
    console.log("[Checkout Audit] Adding sample valid Pepperoni pizza to cart for testing");
    addToCart({
      productId: "cmux4ii5q0014u2oqfp9n86oa",
      nameAr: "بيتزا ببروني كلاسيك",
      nameEn: "Classic Pepperoni Pizza",
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80",
      basePrice: 4500,
      unitPrice: 4500,
      quantity: 1,
      selectedOptions: [
        {
          groupId: "cmux4ii5q0015u2oqyfqe9y82",
          groupNameAr: "الحجم",
          groupNameEn: "Size",
          optionId: "cmux4ii5q0016u2oqcsaohsyh",
          optionNameAr: "كبير (14 بوصة)",
          optionNameEn: "Large (14 inch)",
          priceDelta: 0,
        },
        {
          groupId: "cmux4ii5q0019u2oq53y6nsv8",
          groupNameAr: "نوع العجينة",
          groupNameEn: "Crust Type",
          optionId: "cmux4ii5q001au2oqqn2tssqk",
          optionNameAr: "عجينة إيطالية كلاسيكية هشة",
          optionNameEn: "Classic Italian Thin Crust",
          priceDelta: 0,
        },
      ],
      notes: "طلب تجريبي",
    });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-3xl bg-pizza-50 dark:bg-stone-850 border border-pizza-200 dark:border-stone-800 flex items-center justify-center mx-auto text-pizza-600 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-pizza-600 dark:text-pizza-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-cairo">
            {dict.cart.emptyTitle}
          </h2>
          <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
            {language === "ar"
              ? "سلتك فارغة حالياً. تصفح قائمتنا اللذيذة أو أضف صنفاً تجريبياً لتجربة الدفع فوراً."
              : dict.cart.emptyDesc}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pizza-700 via-pizza-600 to-pizza-700 hover:from-pizza-800 hover:to-pizza-800 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-pizza-700/25 active:scale-95 transition-all"
          >
            <span>{dict.cart.continueShopping}</span>
            {language === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
          <button
            type="button"
            onClick={handleAddSampleItem}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "ar" ? "إضافة بيتزا ببروني وتجربة الدفع فوراً" : "Add Pepperoni Pizza & Test"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Group slots into available vs tomorrow/all
  const availableSlotsList = availableSlots.filter((s) => s.isAvailable);
  const slotsToDisplay = availableSlotsList.length > 0 ? availableSlotsList : availableSlots;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pizza-50 dark:bg-pizza-950/60 border border-pizza-200 dark:border-pizza-900/50 text-pizza-700 dark:text-pizza-400 text-xs font-bold mb-1">
          <Flame className="w-3.5 h-3.5 text-pizza-600" />
          <span>{language === "ar" ? "فرع المكلا · فوه حي المساكن" : "Mukalla Branch · Fuwah Al-Masaken"}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white font-cairo tracking-tight">
          {dict.checkout.title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          {language === "ar"
            ? "نخبزها ساخنة على حجر الفرن البركاني فور وصولك بدون انتظار"
            : "Fresh Italian stone-baked pizza ready upon your arrival with zero wait"}
        </p>
      </div>

      {/* Operational Notices */}
      {restaurant?.isOnlineOrderingPaused && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <span>{restaurant.pauseMessageAr || dict.checkout.orderingPausedAlert}</span>
        </div>
      )}

      {restaurantStatus && !restaurantStatus.canOrderImmediate && (
        <div className="mb-6 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 text-sky-600" />
            <span>
              {language === "ar"
                ? "الفرن خارج أوقات الاستلام الفوري المباشر حالياً — يمكنك حجز وجدولة موعد استلامك مسبقاً بكل سهولة!"
                : "Immediate baking is off-peak. Pre-schedule your pickup slot below!"}
            </span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 shrink-0">
            {language === "ar" ? "حجز مسبق متاح ✓" : "Pre-order Open"}
          </span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* 4-Step Dynamic Progress Indicator */}
      <div className="mb-8 bg-white dark:bg-stone-850 p-4 sm:p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {/* Step 1: Customer */}
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold flex items-center justify-center text-xs font-outfit transition-all ${
                isNameValid && isPhoneValid
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-pizza-700 text-white"
              }`}
            >
              {isNameValid && isPhoneValid ? <Check className="w-4 h-4" /> : "1"}
            </span>
            <span className="font-bold text-stone-900 dark:text-white text-[11px] sm:text-xs truncate">
              {language === "ar" ? "بيانات العميل" : "Customer"}
            </span>
          </div>

          {/* Step 2: Slot */}
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold flex items-center justify-center text-xs font-outfit transition-all ${
                Boolean(selectedSlot) || pickupMode === "ASAP"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-stone-200 dark:bg-stone-700 text-stone-500"
              }`}
            >
              <Check className="w-4 h-4" />
            </span>
            <span className="font-bold text-stone-900 dark:text-white text-[11px] sm:text-xs truncate">
              {language === "ar" ? "موعد الاستلام" : "Pickup Slot"}
            </span>
          </div>

          {/* Step 3: Payment */}
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold flex items-center justify-center text-xs font-outfit transition-all ${
                isReceiptValid
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-stone-200 dark:bg-stone-700 text-stone-500"
              }`}
            >
              {isReceiptValid ? <Check className="w-4 h-4" /> : "3"}
            </span>
            <span className="font-bold text-stone-900 dark:text-white text-[11px] sm:text-xs truncate">
              {language === "ar" ? "طريقة الدفع" : "Payment"}
            </span>
          </div>

          {/* Step 4: Confirm */}
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold flex items-center justify-center text-xs font-outfit transition-all ${
                isNameValid && isPhoneValid && isReceiptValid
                  ? "bg-pizza-700 text-white animate-pulse"
                  : "bg-stone-200 dark:bg-stone-700 text-stone-500"
              }`}
            >
              4
            </span>
            <span className="font-bold text-stone-500 text-[11px] sm:text-xs truncate">
              {language === "ar" ? "التأكيد والاستلام" : "Confirmation"}
            </span>
          </div>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-7">
          {/* 1. Customer Information Card */}
          <div className="bg-white dark:bg-stone-850 p-5 sm:p-7 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-pizza-600" />
                <span>{dict.checkout.customerInfo}</span>
              </h3>

              {/* Fast QA Demo Fill Button */}
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] text-pizza-700 dark:text-pizza-400 hover:underline flex items-center gap-1 font-bold"
                title="تعبئة سريعة للتجربة"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === "ar" ? "تعبئة سريعة للاختبار" : "Quick Test Fill"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  {dict.checkout.fullName} *
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder={dict.checkout.fullNamePlaceholder}
                  className={`w-full text-xs sm:text-sm p-3.5 rounded-2xl border bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none transition-colors ${
                    fieldErrors.name
                      ? "border-red-500 ring-2 ring-red-500/20"
                      : "border-stone-200 dark:border-stone-700 focus:border-pizza-600"
                  }`}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {dict.checkout.phone} *
                  </label>
                  {customerPhone && (
                    <span
                      className={`text-[10px] font-bold ${
                        isPhoneValid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isPhoneValid
                        ? language === "ar" ? "رقم صالح ✓" : "Valid Phone ✓"
                        : language === "ar" ? "رقم غير مكتمل (9 أرقام)" : "Incomplete (9 digits)"}
                    </span>
                  )}
                </div>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: false }));
                  }}
                  placeholder={dict.checkout.phonePlaceholder}
                  className={`w-full text-xs sm:text-sm p-3.5 rounded-2xl border bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none transition-colors font-outfit ${
                    fieldErrors.phone
                      ? "border-red-500 ring-2 ring-red-500/20"
                      : customerPhone && isPhoneValid
                      ? "border-emerald-500 focus:border-emerald-600"
                      : "border-stone-200 dark:border-stone-700 focus:border-pizza-600"
                  }`}
                />
                <p className="text-[10px] text-stone-400">
                  {language === "ar"
                    ? "أرقام شبكات اليمن (77، 73، 71، 78، 70) للتواصل وتأكيد موعد الخبز"
                    : "Yemeni mobile numbers (77, 73, 71, 78, 70)"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Pickup Timing Card */}
          <div className="bg-white dark:bg-stone-850 p-5 sm:p-7 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-crust-500" />
              <span>{dict.checkout.timingTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* ASAP Option */}
              <button
                type="button"
                onClick={() => setPickupMode("ASAP")}
                className={`p-4 rounded-2xl border text-start transition-all ${
                  pickupMode === "ASAP"
                    ? "border-pizza-600 bg-pizza-50/70 dark:bg-pizza-950/40 text-pizza-950 dark:text-white shadow-sm ring-2 ring-pizza-600/30"
                    : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-pizza-600" />
                    <span>{dict.checkout.asapLabel}</span>
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      pickupMode === "ASAP"
                        ? "border-pizza-600 bg-pizza-600 text-white"
                        : "border-stone-300"
                    }`}
                  >
                    {pickupMode === "ASAP" && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                  {restaurantStatus && !restaurantStatus.canOrderImmediate
                    ? language === "ar"
                      ? "تجهيز طازج مع أول شفت عمل قادم"
                      : "Fresh bake at next shift opening"
                    : dict.checkout.asapBadge}
                </p>
              </button>

              {/* Scheduled Option */}
              <button
                type="button"
                onClick={() => setPickupMode("SCHEDULED")}
                className={`p-4 rounded-2xl border text-start transition-all ${
                  pickupMode === "SCHEDULED"
                    ? "border-pizza-600 bg-pizza-50/70 dark:bg-pizza-950/40 text-pizza-950 dark:text-white shadow-sm ring-2 ring-pizza-600/30"
                    : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-amber-500" />
                    <span>{dict.checkout.scheduledLabel}</span>
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      pickupMode === "SCHEDULED"
                        ? "border-pizza-600 bg-pizza-600 text-white"
                        : "border-stone-300"
                    }`}
                  >
                    {pickupMode === "SCHEDULED" && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                  {language === "ar"
                    ? "حدد وقت وصولك لنخبزها ساخنة على الحجر فور وصولك"
                    : "Select arrival time for hot stone baking"}
                </p>
              </button>
            </div>

            {/* Slots Grid when Scheduled */}
            {pickupMode === "SCHEDULED" && (
              <div className="pt-3 space-y-3 border-t border-stone-200 dark:border-stone-800 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {dict.checkout.selectSlot}
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {language === "ar" ? "فترات استلام بدقة 15 دقيقة" : "15-minute slot intervals"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto p-1">
                  {slotsToDisplay.map((slot) => {
                    const isSelected = selectedSlot === slot.timeString;
                    return (
                      <button
                        type="button"
                        key={slot.timeString}
                        onClick={() => setSelectedSlot(slot.timeString)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                          isSelected
                            ? "bg-pizza-700 text-white border-pizza-700 shadow-md ring-2 ring-pizza-600/30 font-black"
                            : "bg-stone-50 hover:bg-white dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700"
                        }`}
                      >
                        <div>{language === "ar" ? slot.displayLabelAr : slot.displayLabelEn}</div>
                        {isSelected && (
                          <span className="text-[9px] block text-amber-200 font-normal mt-0.5">
                            {language === "ar" ? "الموعد المختار ✓" : "Selected ✓"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment Method Card */}
          <div className="bg-white dark:bg-stone-850 p-5 sm:p-7 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>{dict.checkout.paymentTitle}</span>
            </h3>

            <div className="space-y-3">
              {/* Pay at Pickup (Default - Zero receipt required) */}
              <label
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                  paymentMethod === "PAY_AT_PICKUP"
                    ? "border-pizza-600 bg-pizza-50/60 dark:bg-pizza-950/30 ring-2 ring-pizza-600/20"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "PAY_AT_PICKUP"}
                  onChange={() => setPaymentMethod("PAY_AT_PICKUP")}
                  className="mt-1 text-pizza-600 focus:ring-pizza-500 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 dark:text-white block">
                      {dict.checkout.payAtPickup}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {language === "ar" ? "الأسرع والأسهل ✓" : "Fastest"}
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 block mt-1">
                    {dict.checkout.payAtPickupDesc}
                  </span>
                </div>
              </label>

              {/* Kuraimi Transfer */}
              <div
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  paymentMethod === "TRANSFER_KURAIMI"
                    ? "border-pizza-600 bg-pizza-50/60 dark:bg-pizza-950/30 ring-2 ring-pizza-600/20"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40"
                }`}
              >
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "TRANSFER_KURAIMI"}
                    onChange={() => setPaymentMethod("TRANSFER_KURAIMI")}
                    className="mt-1 text-pizza-600 focus:ring-pizza-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-stone-900 dark:text-white block">
                      تحويل عبر بنك الكريمي (حاسب / إم فلوس)
                    </span>
                    <span className="text-xs text-stone-500 block mt-0.5">
                      {dict.checkout.kuraimiAcc}
                    </span>
                  </div>
                </label>

                {paymentMethod === "TRANSFER_KURAIMI" && (
                  <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2 animate-in fade-in">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-cairo">رقم حساب الكريمي (حاسب):</span>
                      <span className="font-outfit font-black text-base text-stone-900 dark:text-white tracking-wider">
                        121456789
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount("121456789", "kuraimi")}
                      className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      {copiedId === "kuraimi" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 text-xs">تم النسخ ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الرقم</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Al-Amqi Transfer */}
              <div
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  paymentMethod === "TRANSFER_AMQI"
                    ? "border-pizza-600 bg-pizza-50/60 dark:bg-pizza-950/30 ring-2 ring-pizza-600/20"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40"
                }`}
              >
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "TRANSFER_AMQI"}
                    onChange={() => setPaymentMethod("TRANSFER_AMQI")}
                    className="mt-1 text-pizza-600 focus:ring-pizza-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-stone-900 dark:text-white block">
                      تحويل عبر شركة العمقي للصرافة
                    </span>
                    <span className="text-xs text-stone-500 block mt-0.5">
                      {dict.checkout.amqiAcc}
                    </span>
                  </div>
                </label>

                {paymentMethod === "TRANSFER_AMQI" && (
                  <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2 animate-in fade-in">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-cairo">رقم حساب العمقي:</span>
                      <span className="font-outfit font-black text-base text-stone-900 dark:text-white tracking-wider">
                        25489012
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount("25489012", "amqi")}
                      className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      {copiedId === "amqi" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 text-xs">تم النسخ ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الرقم</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Al-Busairi Transfer */}
              <div
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  paymentMethod === "TRANSFER_BUSAIRI"
                    ? "border-pizza-600 bg-pizza-50/60 dark:bg-pizza-950/30 ring-2 ring-pizza-600/20"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40"
                }`}
              >
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "TRANSFER_BUSAIRI"}
                    onChange={() => setPaymentMethod("TRANSFER_BUSAIRI")}
                    className="mt-1 text-pizza-600 focus:ring-pizza-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-stone-900 dark:text-white block">
                      تحويل عبر شركة البسيري للصرافة
                    </span>
                    <span className="text-xs text-stone-500 block mt-0.5">
                      {dict.checkout.busairiAcc}
                    </span>
                  </div>
                </label>

                {paymentMethod === "TRANSFER_BUSAIRI" && (
                  <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2 animate-in fade-in">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-cairo">رقم حساب البسيري:</span>
                      <span className="font-outfit font-black text-base text-stone-900 dark:text-white tracking-wider">
                        34120987
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount("34120987", "busairi")}
                      className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      {copiedId === "busairi" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 text-xs">تم النسخ ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الرقم</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt Upload Box if Transfer Selected */}
            {paymentMethod !== "PAY_AT_PICKUP" && (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4 animate-in fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    {dict.checkout.uploadReceipt} *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-3xl p-6 text-center hover:border-pizza-500 transition-colors bg-stone-50 dark:bg-stone-800/50 ${
                      fieldErrors.receipt
                        ? "border-red-500 bg-red-50/40 dark:bg-red-950/20"
                        : "border-stone-300 dark:border-stone-700"
                    }`}
                  >
                    <input
                      type="file"
                      id="receiptFile"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="receiptFile"
                      className="cursor-pointer flex flex-col items-center gap-2.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-pizza-50 dark:bg-pizza-950/60 border border-pizza-200 dark:border-pizza-800 flex items-center justify-center text-pizza-600 shadow-sm">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {receiptBase64
                          ? language === "ar"
                            ? `تم إرفاق: ${receiptFileName || "صورة الإشعار"} (انقر للتغيير)`
                            : "Receipt attached (click to change)"
                          : dict.checkout.chooseFile}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {language === "ar"
                          ? "الحد الأقصى 5 ميجابايت (JPG, PNG, WebP) — تصوير فوري أو من المعرض"
                          : "Max 5MB (JPG, PNG, WebP)"}
                      </span>
                    </label>

                    {receiptBase64 && (
                      <div className="mt-4 inline-block relative rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-700 max-h-44 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={receiptBase64}
                          alt="Receipt Preview"
                          className="h-36 object-contain bg-stone-100 dark:bg-stone-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptBase64("");
                            setReceiptFileName("");
                          }}
                          className="absolute top-2 end-2 p-1.5 bg-stone-900/80 hover:bg-red-600 text-white rounded-full transition-colors shadow-md"
                          title="حذف صورة الإشعار"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {dict.checkout.referenceNumber}
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder={dict.checkout.referencePlaceholder}
                    className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 font-outfit focus:outline-none focus:border-pizza-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Optional Order Notes */}
          <div className="bg-white dark:bg-stone-850 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-stone-400" />
              <span>{dict.checkout.notes}</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={dict.checkout.notesPlaceholder}
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-pizza-600"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-850 p-5 sm:p-7 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-base font-black text-stone-900 dark:text-white font-cairo">
                {language === "ar" ? `ملخص طلبك (${cart.length} أصناف)` : `Order Summary (${cart.length} items)`}
              </h3>
              <span className="text-[11px] text-pizza-700 dark:text-pizza-400 font-bold">
                {pickupMode === "ASAP"
                  ? language === "ar" ? "استلام فوري" : "Immediate ASAP"
                  : selectedSlot ? `${language === "ar" ? "موعد:" : "Slot:"} ${selectedSlot}` : ""}
              </span>
            </div>

            {/* Interactive Items List with +/- controls */}
            <div className="space-y-3 max-h-72 overflow-y-auto pe-1">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-start justify-between gap-3 text-xs border-b border-stone-100 dark:border-stone-800/60 pb-3"
                >
                  <div className="space-y-1 flex-1">
                    <span className="font-bold text-stone-900 dark:text-white block font-cairo">
                      {language === "ar" ? item.nameAr : item.nameEn}
                    </span>
                    {item.selectedOptions?.length > 0 && (
                      <p className="text-[10px] text-stone-400">
                        {item.selectedOptions
                          .map((o) => (language === "ar" ? o.optionNameAr : o.optionNameEn))
                          .join(" • ")}
                      </p>
                    )}
                    <span className="font-outfit font-black text-stone-800 dark:text-stone-200 block text-[11px]">
                      {item.subtotal.toLocaleString()} {dict.menu.currency}
                    </span>
                  </div>

                  {/* Quantity and Delete Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="w-6 h-6 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-200 flex items-center justify-center text-stone-700 dark:text-stone-200 transition-colors"
                      title="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold font-outfit text-xs">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="w-6 h-6 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-200 flex items-center justify-center text-stone-700 dark:text-stone-200 transition-colors"
                      title="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="w-6 h-6 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center ms-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="pt-2 space-y-2 border-t border-stone-200 dark:border-stone-800 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>{language === "ar" ? "المجموع الفرعي:" : "Subtotal:"}</span>
                <span className="font-outfit font-bold">
                  {cartTotal.toLocaleString()} {dict.menu.currency}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>{language === "ar" ? "رسوم الخدمة والتجهيز:" : "Prep & Packaging:"}</span>
                <span className="text-emerald-600 font-bold">{language === "ar" ? "مجاناً ✓" : "Free ✓"}</span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-stone-800">
                <span>{language === "ar" ? "الإجمالي للدفع:" : "Total Amount:"}</span>
                <span className="text-xl text-pizza-700 dark:text-pizza-400 font-outfit">
                  {cartTotal.toLocaleString()}{" "}
                  <span className="text-xs font-bold font-cairo">{dict.menu.currency}</span>
                </span>
              </div>
            </div>

            {/* Submit Order Button - ALWAYS ACTIVE & CLICKABLE */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-5 rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-pizza-700 via-pizza-600 to-pizza-700 hover:from-pizza-800 hover:to-pizza-800 text-white shadow-pizza-700/25 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{language === "ar" ? "جاري تسجيل وتأكيد الطلب..." : "Confirming Order..."}</span>
                </span>
              ) : (
                <>
                  <span className="text-base font-black">{dict.checkout.placeOrder}</span>
                  {language === "ar" ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>

            {/* Reassurance Guarantees */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{language === "ar" ? "ضمان الخبز الإيطالي الساخن فور موعد الاستلام" : "Hot Italian Stone-Bake Guarantee"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-pizza-600 shrink-0" />
                <span>{language === "ar" ? "استلام مباشر من الكاونتر بدون طوابير" : "Direct counter pickup with zero queue"}</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Mobile Sticky Checkout Bar to guarantee 100% visibility on all phones */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-3.5 z-40 shadow-2xl flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-stone-400 block font-cairo">الإجمالي النهائي:</span>
          <span className="text-lg font-black font-outfit text-pizza-700 dark:text-pizza-400">
            {cartTotal.toLocaleString()} <span className="text-xs font-cairo font-bold">{dict.menu.currency}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            console.log("[Checkout Audit] Mobile Sticky Submit Button tapped");
            handleSubmitOrder(e as any);
          }}
          disabled={isSubmitting}
          className="flex-1 py-3 px-5 rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-pizza-700 via-pizza-600 to-pizza-700 hover:from-pizza-800 text-white shadow-pizza-700/25 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>جاري التأكيد...</span>
            </span>
          ) : (
            <>
              <span className="text-sm font-black">{dict.checkout.placeOrder}</span>
              {language === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
