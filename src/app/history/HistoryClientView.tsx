"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getCustomerOrderHistoryAction } from "@/app/actions/orderActions";
import RecurringReminderModal from "@/components/customer/RecurringReminderModal";
import {
  Phone,
  Search,
  Pizza,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  Printer,
  Calendar,
  CreditCard,
  User,
  Heart,
  ChevronDown,
  ChevronUp,
  X,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Flame,
  Award,
  Filter,
  Check,
  TrendingUp,
  Store,
  ChefHat,
  SlidersHorizontal,
  Bell,
  Plus,
} from "lucide-react";

interface HistoryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pickupMode: string;
  requestedPickupTime: string | Date;
  plannedPrepStartTime?: string | Date;
  actualPrepStartTime?: string | Date;
  readyTime?: string | Date;
  completedTime?: string | Date;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string | null;
  trackingToken: string;
  createdAt: string | Date;
  items: Array<{
    id: string;
    productId: string;
    productNameAr: string;
    productNameEn: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    itemNotes?: string | null;
    options: Array<{
      id: string;
      groupNameAr: string;
      groupNameEn: string;
      nameAr: string;
      nameEn: string;
      priceDelta: number;
    }>;
    product?: {
      id: string;
      imageUrl: string;
      isAvailable: boolean;
      basePrice: number;
    };
  }>;
  payment?: {
    id: string;
    method: string;
    status: string;
    amount: number;
    referenceNumber?: string | null;
    receipt?: {
      fileUrl: string;
    } | null;
  } | null;
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  activeOrdersCount: number;
  latestCustomerName: string;
  favoriteItem?: { nameAr: string; nameEn: string; count: number } | null;
  searchedPhone: string;
  lastOrderDate?: string | Date | null;
}

type MainFilter = "ALL" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type SortOption = "NEWEST" | "OLDEST" | "HIGHEST_TOTAL";

const IN_PROGRESS_STATUSES = [
  "PENDING",
  "PAYMENT_PENDING",
  "CONFIRMED",
  "QUEUED",
  "PREPARING",
  "READY",
];

export default function HistoryClientView() {
  const searchParams = useSearchParams();
  const { language, dict, addToCart, setIsCartOpen } = useApp();

  const [phoneInput, setPhoneInput] = useState("");
  const [rememberPhone, setRememberPhone] = useState(true);
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Primary Status Filter & Sorting
  const [statusFilter, setStatusFilter] = useState<MainFilter>("ALL");
  const [activeSubFilter, setActiveSubFilter] = useState<"ALL" | "IN_OVEN" | "READY">("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("NEWEST");
  const [queryFilter, setQueryFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Reorder toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Receipt modal state
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<HistoryOrder | null>(null);

  // Search execution callback
  const executeSearch = React.useCallback(
    (phoneToSearch: string) => {
      const trimmed = phoneToSearch.trim();
      if (!trimmed) {
        setError(language === "ar" ? "يرجى كتابة رقم الهاتف" : "Please enter a phone number");
        return;
      }

      setError(null);
      startTransition(async () => {
        const res = await getCustomerOrderHistoryAction(trimmed);
        setSearched(true);
        if (!res.success) {
          setError(res.error || (language === "ar" ? "تعذر العثور على طلبات" : "No orders found"));
          setOrders([]);
          setStats(null);
        } else {
          setOrders(res.orders as unknown as HistoryOrder[]);
          setStats(res.stats as unknown as CustomerStats);
          if (rememberPhone) {
            localStorage.setItem("ph_customer_phone", trimmed);
            if (res.stats?.latestCustomerName) {
              localStorage.setItem("ph_customer_name", res.stats.latestCustomerName);
            }
          }
        }
      });
    },
    [language, rememberPhone]
  );

  // Load saved phone on mount or from URL param
  useEffect(() => {
    const paramPhone = searchParams.get("phone");
    const savedPhone = typeof window !== "undefined" ? localStorage.getItem("ph_customer_phone") : null;
    const initialPhone = paramPhone || savedPhone || "";

    if (initialPhone) {
      setPhoneInput(initialPhone);
      executeSearch(initialPhone);
    }
  }, [searchParams, executeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(phoneInput);
  };

  const handleClearPhone = () => {
    setPhoneInput("");
    setOrders([]);
    setStats(null);
    setSearched(false);
    setError(null);
    localStorage.removeItem("ph_customer_phone");
  };

  // Re-order handler: adds order items into current cart
  const handleReorder = (order: HistoryOrder) => {
    for (const item of order.items) {
      const selectedOptions = item.options.map((opt) => ({
        groupId: opt.id,
        groupNameAr: opt.groupNameAr,
        groupNameEn: opt.groupNameEn,
        optionId: opt.id,
        optionNameAr: opt.nameAr,
        optionNameEn: opt.nameEn,
        priceDelta: opt.priceDelta,
      }));

      addToCart({
        productId: item.productId,
        nameAr: item.productNameAr,
        nameEn: item.productNameEn,
        imageUrl: item.product?.imageUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
        basePrice: item.product?.basePrice || item.unitPrice,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        selectedOptions,
        notes: item.itemNotes || undefined,
      });
    }

    setToastMessage(dict.history.reorderSuccess);
    setTimeout(() => setToastMessage(null), 4000);
    setIsCartOpen(true);
  };

  // Re-order a single specific item from an order into the cart
  const handleReorderItem = (
    item: HistoryOrder["items"][0],
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();

    const selectedOptions = (item.options || []).map((opt) => ({
      groupId: opt.id,
      groupNameAr: opt.groupNameAr,
      groupNameEn: opt.groupNameEn,
      optionId: opt.id,
      optionNameAr: opt.nameAr,
      optionNameEn: opt.nameEn,
      priceDelta: opt.priceDelta,
    }));

    addToCart({
      productId: item.productId,
      nameAr: item.productNameAr,
      nameEn: item.productNameEn,
      imageUrl:
        item.product?.imageUrl ||
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
      basePrice: item.product?.basePrice || item.unitPrice,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      selectedOptions,
      notes: item.itemNotes || undefined,
    });

    const itemName = language === "ar" ? item.productNameAr : item.productNameEn;
    setToastMessage(
      language === "ar"
        ? `تمت إضافة (${item.quantity}x ${itemName}) إلى سلتك!`
        : `Added (${item.quantity}x ${itemName}) to your cart!`
    );
    setTimeout(() => setToastMessage(null), 4000);
    setIsCartOpen(true);
  };

  const counts = useMemo(() => {
    const all = orders.length;
    const inProgress = orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)).length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const cancelled = orders.filter((o) => ["CANCELLED", "REJECTED"].includes(o.status)).length;
    const inOven = orders.filter((o) => o.status === "PREPARING").length;
    const ready = orders.filter((o) => o.status === "READY").length;
    return { all, inProgress, completed, cancelled, inOven, ready };
  }, [orders]);

  // Filtered & Sorted orders list
  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Status filter
        if (statusFilter === "IN_PROGRESS") {
          if (!IN_PROGRESS_STATUSES.includes(o.status)) return false;
          if (activeSubFilter === "IN_OVEN" && o.status !== "PREPARING") return false;
          if (activeSubFilter === "READY" && o.status !== "READY") return false;
        } else if (statusFilter === "COMPLETED") {
          if (o.status !== "COMPLETED") return false;
        } else if (statusFilter === "CANCELLED") {
          if (!["CANCELLED", "REJECTED"].includes(o.status)) return false;
        }

        // Search Query filter
        if (queryFilter.trim()) {
          const q = queryFilter.trim().toLowerCase();
          const cleanQ = q.replace(/^#/, "");
          const matchNumber =
            o.orderNumber.toLowerCase().includes(q) ||
            o.orderNumber.toLowerCase().includes(cleanQ);
          const matchCustomer = o.customerName.toLowerCase().includes(q);
          const matchItem = o.items.some(
            (it) =>
              it.productNameAr.toLowerCase().includes(q) ||
              it.productNameEn.toLowerCase().includes(q)
          );
          if (!matchNumber && !matchCustomer && !matchItem) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "NEWEST") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortOption === "OLDEST") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortOption === "HIGHEST_TOTAL") {
          return b.total - a.total;
        }
        return 0;
      });
  }, [orders, statusFilter, activeSubFilter, queryFilter, sortOption]);

  // Urgent active order alert detection (preparing or ready)
  const currentActiveOrder = useMemo(() => {
    return orders.find((o) => ["PREPARING", "READY", "QUEUED", "CONFIRMED"].includes(o.status));
  }, [orders]);

  // Status mapping helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: language === "ar" ? "قيد المراجعة" : "Pending",
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500",
          progressIndex: 1,
        };
      case "PAYMENT_PENDING":
        return {
          label: language === "ar" ? "مراجعة إشعار التحويل" : "Payment Verification",
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500 animate-pulse",
          progressIndex: 1,
        };
      case "CONFIRMED":
        return {
          label: language === "ar" ? "مؤكد ومجدول" : "Confirmed",
          bg: "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800",
          dot: "bg-blue-500",
          progressIndex: 2,
        };
      case "QUEUED":
        return {
          label: language === "ar" ? "مجدول بانتظار الخبز" : "Scheduled",
          bg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
          dot: "bg-indigo-500",
          progressIndex: 2,
        };
      case "PREPARING":
        return {
          label: language === "ar" ? "في الفرن الآن 🔥" : "Baking in Oven 🔥",
          bg: "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300 dark:border-orange-800",
          dot: "bg-orange-500 animate-ping",
          progressIndex: 3,
        };
      case "READY":
        return {
          label: language === "ar" ? "جاهز للاستلام 🍕" : "Ready for Pickup 🍕",
          bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
          dot: "bg-emerald-500 animate-pulse",
          progressIndex: 4,
        };
      case "COMPLETED":
        return {
          label: language === "ar" ? "تم التسليم بنجاح" : "Completed",
          bg: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700",
          dot: "bg-emerald-600",
          progressIndex: 5,
        };
      case "CANCELLED":
      case "REJECTED":
        return {
          label: language === "ar" ? "ملغي / مرفوض" : "Cancelled",
          bg: "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-300 dark:border-red-800",
          dot: "bg-red-500",
          progressIndex: 0,
        };
      default:
        return {
          label: status,
          bg: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-200",
          dot: "bg-stone-400",
          progressIndex: 1,
        };
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case "PAY_AT_PICKUP":
        return language === "ar" ? "دفع عند الاستلام (كاش / شبكة)" : "Pay at Pickup";
      case "TRANSFER_KURAIMI":
        return language === "ar" ? "تحويل بنك الكريمي (حاسب)" : "Kuraimi Transfer";
      case "TRANSFER_AMQI":
        return language === "ar" ? "تحويل شركة العمقي" : "Al-Amqi Transfer";
      case "TRANSFER_BUSAIRI":
        return language === "ar" ? "تحويل شركة البسيري" : "Al-Busairi Transfer";
      default:
        return method || "—";
    }
  };

  const getCustomerTier = (totalOrders: number) => {
    if (totalOrders >= 10) return { label: language === "ar" ? "عميل بلاتيني ⭐⭐⭐" : "Platinum Member ⭐⭐⭐", color: "from-amber-400 to-amber-600" };
    if (totalOrders >= 5) return { label: language === "ar" ? "عميل ذهبي ⭐⭐" : "Gold Member ⭐⭐", color: "from-amber-500 to-amber-700" };
    if (totalOrders >= 2) return { label: language === "ar" ? "عميل فضي ⭐" : "Silver Member ⭐", color: "from-stone-400 to-stone-600" };
    return { label: language === "ar" ? "عميل جديد" : "New Customer", color: "from-pizza-500 to-pizza-700" };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-pizza-500/40 flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-pizza-700 via-pizza-800 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 end-0 -mt-10 -me-10 w-52 h-52 bg-pizza-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 border border-white/10">
              <Pizza className="w-3.5 h-3.5" />
              <span>{dict.brand.name} · المكلا - فوه - حي المساكن</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-cairo tracking-tight">
              {dict.history.title}
            </h1>
            <p className="text-sm text-stone-200 max-w-xl leading-relaxed">
              {dict.history.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition-transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{dict.hero.primaryCta}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Order Spotlight Banner */}
      {currentActiveOrder && (
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-pizza-500/10 dark:from-orange-950/40 dark:via-amber-950/40 dark:to-pizza-950/40 border-2 border-orange-500/30 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30 animate-pulse">
              <Flame className="w-6 h-6 text-amber-200" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  {dict.history.activeOrderBannerTitle}
                </span>
                <span className="font-outfit font-black text-sm text-stone-900 dark:text-white">
                  {currentActiveOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {currentActiveOrder.status === "PREPARING"
                  ? (language === "ar" ? "البيتزا في الفرن الآن ويتم خبزها على الحجر بعناية." : "Your pizza is actively baking in the stone oven.")
                  : currentActiveOrder.status === "READY"
                  ? (language === "ar" ? "طلبك جاهز وساخن للاستلام من فرع فوه!" : "Your order is hot and ready for pickup at Fuwa branch!")
                  : (language === "ar" ? "طلبك مجدول وجاري تجهيز المكونات." : "Your scheduled order is being prepared.")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextMock = currentActiveOrder.status === "PREPARING" ? "READY" : "PREPARING";
                (window as any).__triggerTestOrderToast?.(nextMock);
              }}
              className="inline-flex items-center gap-1.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-bold px-3.5 py-3 rounded-2xl text-xs shadow-xs transition-colors"
              title="تجربة صوت وتنبيه التحديث"
            >
              <Bell className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === "ar" ? "تجربة التنبيه 🔔" : "Test Alert 🔔"}</span>
            </button>

            <Link
              href={`/track/${currentActiveOrder.orderNumber}?token=${currentActiveOrder.trackingToken}`}
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition-all active:scale-95 shrink-0"
            >
              <Clock className="w-4 h-4" />
              <span>{dict.history.activeOrderBannerAction}</span>
              {language === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </div>
      )}

      {/* Phone Lookup Form */}
      <div className="bg-white dark:bg-stone-850 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
              {dict.history.phoneLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4 text-pizza-600" />
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="771234567 أو 05375561"
                  className="w-full text-start ps-10 pe-4 py-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-white placeholder:text-stone-400 font-outfit text-sm focus:outline-none focus:ring-2 focus:ring-pizza-500/20 focus:border-pizza-600"
                />
                {phoneInput && (
                  <button
                    type="button"
                    onClick={handleClearPhone}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-bold disabled:opacity-50 px-7 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-950/40 active:scale-95 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>
                  {isPending ? (language === "ar" ? "جاري البحث..." : "Searching...") : dict.history.searchBtn}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-stone-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberPhone}
                onChange={(e) => setRememberPhone(e.target.checked)}
                className="rounded border-stone-300 text-pizza-600 focus:ring-pizza-500 w-4 h-4"
              />
              <span>{dict.history.rememberPhone}</span>
            </label>

            {/* Quick Demo phone numbers for ease of testing */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-stone-400">{dict.history.quickDemo}</span>
              {["771234567", "733445566", "777889900"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setPhoneInput(num);
                    executeSearch(num);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-pizza-50 dark:hover:bg-pizza-950 text-pizza-700 dark:text-pizza-300 font-outfit text-xs font-bold transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Customer Profile & Activity Stats Summary */}
      {stats && stats.totalOrders > 0 && (
        <div className="bg-gradient-to-br from-stone-50 to-white dark:from-stone-850 dark:to-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/60 dark:border-stone-800 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-pizza-100 dark:bg-pizza-950/80 text-pizza-700 dark:text-pizza-300 flex items-center justify-center font-bold text-lg font-outfit shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-stone-900 dark:text-white font-cairo">
                    {stats.latestCustomerName || (language === "ar" ? "عميل بيتزا هاوس" : "Pizza House Customer")}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/40">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>{getCustomerTier(stats.totalOrders).label}</span>
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-outfit" dir="ltr">
                  {stats.searchedPhone}
                </p>
              </div>
            </div>

            <button
              onClick={handleClearPhone}
              className="text-xs text-pizza-700 dark:text-pizza-400 hover:underline flex items-center gap-1 self-start sm:self-center font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{dict.history.changePhone}</span>
            </button>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 shadow-xs space-y-1">
              <span className="text-[11px] text-stone-500 font-medium block">
                {dict.history.totalOrders}
              </span>
              <p className="text-xl font-black text-stone-900 dark:text-white font-outfit">
                {stats.totalOrders}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 shadow-xs space-y-1">
              <span className="text-[11px] text-stone-500 font-medium block">
                {dict.history.totalSpent}
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-outfit">
                {stats.totalSpent.toLocaleString()}{" "}
                <span className="text-xs font-bold">{dict.menu.currency}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 shadow-xs space-y-1">
              <span className="text-[11px] text-stone-500 font-medium block">
                {dict.history.activeOrders}
              </span>
              <p
                className={`text-xl font-black font-outfit ${
                  stats.activeOrdersCount > 0 ? "text-pizza-600 animate-pulse" : "text-stone-700 dark:text-stone-300"
                }`}
              >
                {stats.activeOrdersCount}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 shadow-xs space-y-1">
              <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span>{dict.history.favoriteItem}</span>
              </span>
              <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                {stats.favoriteItem
                  ? (language === "ar" ? stats.favoriteItem.nameAr : stats.favoriteItem.nameEn)
                  : "—"}
              </p>
            </div>
          </div>

          {/* Recurring Order Reminders Quick Setup Card */}
          <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-white block font-cairo">
                  {language === "ar"
                    ? "تنبيهات الوجبة المفضلة (كل أسبوعين)"
                    : "Favorite Meal Reminders (Every 2 Weeks)"}
                </span>
                <p className="text-[11px] text-stone-500">
                  {language === "ar"
                    ? "إشعار متصفح يذكرك بطلب وجبتك المفضلة إذا مر أسبوعان دون طلب."
                    : "Browser push notification reminding you to order your favorite meal after 2 weeks of inactivity."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReminderModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "ضبط التنبيهات 🔔" : "Setup Reminders 🔔"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Filter Tabs & Controls */}
      {searched && orders.length > 0 && (
        <div className="space-y-4">
          {/* Main Filter Tabs */}
          <div className="bg-white dark:bg-stone-850 p-2 sm:p-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {/* Tab 1: All */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setActiveSubFilter("ALL");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === "ALL"
                    ? "bg-pizza-700 text-white shadow-md shadow-pizza-700/20"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <span>{dict.history.filterAll}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-outfit ${
                    statusFilter === "ALL"
                      ? "bg-white/20 text-white"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              {/* Tab 2: In-Progress / Active */}
              <button
                type="button"
                onClick={() => setStatusFilter("IN_PROGRESS")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === "IN_PROGRESS"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${counts.inProgress > 0 ? "text-amber-300 animate-pulse" : ""}`} />
                <span>{dict.history.filterActive}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-outfit ${
                    statusFilter === "IN_PROGRESS"
                      ? "bg-white/20 text-white"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {counts.inProgress}
                </span>
              </button>

              {/* Tab 3: Completed */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("COMPLETED");
                  setActiveSubFilter("ALL");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === "COMPLETED"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{dict.history.filterCompleted}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-outfit ${
                    statusFilter === "COMPLETED"
                      ? "bg-white/20 text-white"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {counts.completed}
                </span>
              </button>

              {/* Tab 4: Cancelled */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("CANCELLED");
                  setActiveSubFilter("ALL");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === "CANCELLED"
                    ? "bg-red-700 text-white shadow-md shadow-red-700/20"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>{dict.history.filterCancelled}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-outfit ${
                    statusFilter === "CANCELLED"
                      ? "bg-white/20 text-white"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {counts.cancelled}
                </span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
              <span className="text-[11px] text-stone-400 font-bold whitespace-nowrap">
                {dict.history.sortBy}
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-bold focus:outline-none focus:border-pizza-600"
              >
                <option value="NEWEST">{dict.history.sortNewest}</option>
                <option value="OLDEST">{dict.history.sortOldest}</option>
                <option value="HIGHEST_TOTAL">{dict.history.sortHighestTotal}</option>
              </select>
            </div>
          </div>

          {/* Sub-filters row if In-Progress is chosen */}
          {statusFilter === "IN_PROGRESS" && counts.inProgress > 0 && (
            <div className="flex items-center gap-2 p-2 bg-orange-50/60 dark:bg-orange-950/20 rounded-2xl border border-orange-200/50 dark:border-orange-900/30 text-xs">
              <span className="text-orange-900 dark:text-orange-300 font-bold ps-2">
                {language === "ar" ? "تصفية المرحلة:" : "Filter Stage:"}
              </span>
              <button
                type="button"
                onClick={() => setActiveSubFilter("ALL")}
                className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                  activeSubFilter === "ALL"
                    ? "bg-orange-600 text-white"
                    : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                }`}
              >
                {language === "ar" ? "الكل النشط" : "All Active"}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubFilter("IN_OVEN")}
                className={`px-3 py-1 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                  activeSubFilter === "IN_OVEN"
                    ? "bg-orange-600 text-white"
                    : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{dict.history.filterInOven}</span>
                <span className="font-outfit text-[11px] opacity-80">({counts.inOven})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubFilter("READY")}
                className={`px-3 py-1 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                  activeSubFilter === "READY"
                    ? "bg-orange-600 text-white"
                    : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{dict.history.filterReady}</span>
                <span className="font-outfit text-[11px] opacity-80">({counts.ready})</span>
              </button>
            </div>
          )}

          {/* Quick search input inside orders */}
          <div className="relative">
            <input
              type="text"
              value={queryFilter}
              onChange={(e) => setQueryFilter(e.target.value)}
              placeholder={dict.history.searchOrdersPlaceholder}
              className="w-full text-xs p-3.5 ps-10 pe-10 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-pizza-500 shadow-xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            {queryFilter && (
              <button
                type="button"
                onClick={() => setQueryFilter("")}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Status Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              {language === "ar"
                ? `عرض ${filteredAndSortedOrders.length} من إجمالي ${orders.length} طلب`
                : `Showing ${filteredAndSortedOrders.length} of ${orders.length} orders`}
            </span>
            {(statusFilter !== "ALL" || activeSubFilter !== "ALL" || queryFilter.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setActiveSubFilter("ALL");
                  setQueryFilter("");
                }}
                className="text-pizza-700 dark:text-pizza-400 hover:underline font-bold"
              >
                {dict.history.clearFilters}
              </button>
            )}
          </div>

          {/* Orders List */}
          {filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-850 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
              <Pizza className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
              <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
                {language === "ar" ? "لا توجد طلبات مطابقة لهذا الفلتر" : "No orders matching this filter"}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {language === "ar"
                  ? "جرب اختيار تبويب فلاتر آخر، أو قم بمسح عبارة البحث للعثور على جميع طلباتك السابقة."
                  : "Try selecting another status tab or clear your search query to see all past orders."}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setActiveSubFilter("ALL");
                    setQueryFilter("");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pizza-700 text-white font-bold text-xs shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{dict.history.clearFilters}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const isExpanded = expandedOrderId === order.id;
                const orderDate = new Date(order.createdAt).toLocaleDateString(
                  language === "ar" ? "ar-YE" : "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }
                );
                const pickupTime = new Date(order.requestedPickupTime).toLocaleTimeString(
                  language === "ar" ? "ar-YE" : "en-US",
                  { hour: "numeric", minute: "2-digit" }
                );

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-stone-850 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
                  >
                    {/* Order summary header */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-outfit font-black text-base sm:text-lg text-stone-900 dark:text-white tracking-tight">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-500 font-outfit">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{orderDate}</span>
                        </div>
                      </div>

                      {/* Visual Step Progress Tracker (for Active & Completed orders) */}
                      {statusBadge.progressIndex > 0 && (
                        <div className="bg-stone-50 dark:bg-stone-900/60 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
                          <div className="grid grid-cols-5 gap-1 text-center">
                            {[
                              { label: dict.history.progressPlaced, step: 1 },
                              { label: dict.history.progressConfirmed, step: 2 },
                              { label: dict.history.progressBaking, step: 3 },
                              { label: dict.history.progressReady, step: 4 },
                              { label: dict.history.progressPickedUp, step: 5 },
                            ].map((s) => {
                              const isPast = statusBadge.progressIndex >= s.step;
                              const isCurrent = statusBadge.progressIndex === s.step;
                              return (
                                <div key={s.step} className="space-y-1">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      isCurrent
                                        ? "bg-orange-500 animate-pulse"
                                        : isPast
                                        ? "bg-emerald-500"
                                        : "bg-stone-200 dark:bg-stone-700"
                                    }`}
                                  />
                                  <span
                                    className={`block text-[10px] truncate ${
                                      isCurrent
                                        ? "font-extrabold text-orange-600 dark:text-orange-400"
                                        : isPast
                                        ? "font-bold text-stone-700 dark:text-stone-300"
                                        : "text-stone-400"
                                    }`}
                                  >
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Info Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 dark:bg-stone-900/40 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-pizza-600 shrink-0" />
                          <div>
                            <span className="text-stone-400 block text-[11px]">
                              {dict.history.pickupModeLabel}:
                            </span>
                            <span className="font-bold text-stone-800 dark:text-stone-200">
                              {order.pickupMode === "ASAP"
                                ? dict.history.asapPickup
                                : `${dict.history.scheduledPickup} (${pickupTime})`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-stone-400 block text-[11px]">
                              {dict.history.paymentMethod}:
                            </span>
                            <span className="font-bold text-stone-800 dark:text-stone-200">
                              {getPaymentMethodLabel(order.payment?.method)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <div>
                            <span className="text-stone-400 block text-[11px] sm:text-end">
                              {dict.history.orderTotal}:
                            </span>
                            <span className="text-base font-black text-pizza-700 dark:text-pizza-400 font-outfit">
                              {order.total.toLocaleString()} {dict.menu.currency}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items preview / breakdown */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                            {order.items.length} {dict.history.itemsCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="text-xs font-bold text-pizza-700 dark:text-pizza-400 flex items-center gap-1 hover:underline"
                          >
                            <span>
                              {isExpanded
                                ? (language === "ar" ? "إخفاء التفاصيل" : "Hide Details")
                                : (language === "ar" ? "عرض تفاصيل الطلب" : "View Details")}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Collapsed items brief pills with 1-click reorder */}
                        {!isExpanded && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {order.items.map((it) => (
                              <div
                                key={it.id}
                                className="group inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 ps-2.5 pe-1 py-1 rounded-xl text-xs font-medium border border-stone-200/60 dark:border-stone-700/60 transition-colors"
                              >
                                <span className="font-bold text-pizza-600 font-outfit">{it.quantity}x</span>
                                <span>{language === "ar" ? it.productNameAr : it.productNameEn}</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleReorderItem(it, e)}
                                  className="inline-flex items-center gap-1 bg-white hover:bg-pizza-700 dark:bg-stone-700 dark:hover:bg-pizza-600 text-stone-700 hover:text-white dark:text-stone-200 dark:hover:text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs transition-all ms-1 active:scale-90"
                                  title={language === "ar" ? `إعادة طلب ${it.productNameAr}` : `Re-order ${it.productNameEn}`}
                                >
                                  <Plus className="w-3 h-3 text-pizza-600 group-hover:text-white" />
                                  <span>{dict.history.reorderItem}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Full Items list when expanded */}
                        {isExpanded && (
                          <div className="divide-y divide-stone-100 dark:divide-stone-800 pt-2 border-t border-stone-100 dark:border-stone-800">
                            {order.items.map((it) => (
                              <div key={it.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-pizza-100 dark:bg-pizza-950 text-pizza-700 dark:text-pizza-300 flex items-center justify-center font-black font-outfit text-xs">
                                      {it.quantity}
                                    </span>
                                    <span className="font-bold text-stone-900 dark:text-white">
                                      {language === "ar" ? it.productNameAr : it.productNameEn}
                                    </span>
                                  </div>

                                  {/* Customized Options */}
                                  {it.options && it.options.length > 0 && (
                                    <div className="text-[11px] text-stone-500 ps-7 space-y-0.5">
                                      {it.options.map((opt) => (
                                        <div key={opt.id} className="flex items-center gap-1">
                                          <span>• {language === "ar" ? opt.nameAr : opt.nameEn}</span>
                                          {opt.priceDelta > 0 && (
                                            <span className="text-stone-400 font-outfit">
                                              (+{opt.priceDelta.toLocaleString()} {dict.menu.currency})
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {it.itemNotes && (
                                    <p className="text-[11px] text-amber-600 dark:text-amber-400 ps-7 italic">
                                      &quot;{it.itemNotes}&quot;
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 ps-7 sm:ps-0 pt-1 sm:pt-0">
                                  <span className="font-bold font-outfit text-stone-800 dark:text-stone-200 whitespace-nowrap">
                                    {it.subtotal.toLocaleString()} {dict.menu.currency}
                                  </span>

                                  {/* Individual Item Re-order Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleReorderItem(it, e)}
                                    className="inline-flex items-center gap-1.5 bg-pizza-50 hover:bg-pizza-100 dark:bg-pizza-950/80 dark:hover:bg-pizza-900 text-pizza-700 dark:text-pizza-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-pizza-200 dark:border-pizza-900 shadow-2xs transition-all active:scale-95"
                                    title={language === "ar" ? `إعادة طلب ${it.productNameAr} إلى السلة` : `Re-order ${it.productNameEn}`}
                                  >
                                    <Plus className="w-3.5 h-3.5 text-pizza-600" />
                                    <span>{dict.history.reorderItem}</span>
                                  </button>
                                </div>
                              </div>
                            ))}

                            {order.notes && (
                              <div className="py-2.5 text-xs text-stone-500 ps-1">
                                <span className="font-bold text-stone-700 dark:text-stone-300">
                                  {dict.history.notes}:
                                </span>{" "}
                                <span>{order.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons footer */}
                      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Live Tracking Link */}
                          <Link
                            href={`/track/${order.orderNumber}?token=${order.trackingToken}`}
                            className="inline-flex items-center gap-1.5 bg-pizza-50 hover:bg-pizza-100 dark:bg-pizza-950/80 dark:hover:bg-pizza-900 text-pizza-700 dark:text-pizza-300 px-3.5 py-2 rounded-xl text-xs font-bold border border-pizza-200 dark:border-pizza-900/60 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{dict.history.trackLive}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </Link>

                          {/* Re-order items button */}
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors active:scale-95"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-pizza-600" />
                            <span>{dict.history.reorder}</span>
                          </button>

                          {/* Print Receipt */}
                          <button
                            type="button"
                            onClick={() => setActiveReceiptOrder(order)}
                            className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{dict.history.printReceipt}</span>
                          </button>
                        </div>

                        {/* WhatsApp support */}
                        <a
                          href={`https://wa.me/967772207788?text=${encodeURIComponent(
                            `مرحباً مطعم بيتزا هاوس، بخصوص طلبي رقم ${order.orderNumber} باسم ${order.customerName}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-bold ms-auto"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{dict.history.whatsappInquiry}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State: Phone searched but 0 orders found */}
      {searched && orders.length === 0 && !isPending && !error && (
        <div className="bg-white dark:bg-stone-850 rounded-3xl p-10 sm:p-14 text-center border border-stone-200 dark:border-stone-800 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
            <Pizza className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white font-cairo">
              {dict.history.noOrdersFound}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {dict.history.noOrdersDesc}
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-bold px-6 py-3 rounded-2xl text-xs shadow-md shadow-amber-950/40 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{dict.history.orderNow}</span>
          </Link>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveReceiptOrder(null)}
              className="absolute top-4 end-4 p-2 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Receipt Header */}
            <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-4">
              <div className="w-10 h-10 rounded-xl bg-pizza-700 text-white flex items-center justify-center mx-auto mb-2">
                <Pizza className="w-5 h-5 text-amber-300" />
              </div>
              <h2 className="text-xl font-black font-cairo text-stone-900">
                {dict.brand.name}
              </h2>
              <p className="text-xs text-stone-500">
                المكلا - فوه - حي المساكن | هاتف: 05375561
              </p>
              <p className="text-xs font-black font-outfit text-pizza-800 pt-1">
                {activeReceiptOrder.orderNumber}
              </p>
            </div>

            {/* Receipt Meta */}
            <div className="text-xs space-y-1.5 text-stone-600 border-b border-dashed border-stone-300 pb-4 font-outfit">
              <div className="flex justify-between">
                <span>العميل:</span>
                <span className="font-bold text-stone-900">{activeReceiptOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>الهاتف:</span>
                <span className="font-bold text-stone-900" dir="ltr">{activeReceiptOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span>{new Date(activeReceiptOrder.createdAt).toLocaleString("ar-YE")}</span>
              </div>
              <div className="flex justify-between">
                <span>طريقة الدفع:</span>
                <span>{getPaymentMethodLabel(activeReceiptOrder.payment?.method)}</span>
              </div>
              <div className="flex justify-between">
                <span>طريقة الاستلام:</span>
                <span>
                  {activeReceiptOrder.pickupMode === "ASAP"
                    ? "استلام فوري (فور الجاهزية)"
                    : `مجدول (${new Date(activeReceiptOrder.requestedPickupTime).toLocaleTimeString("ar-YE", { hour: "numeric", minute: "2-digit" })})`}
                </span>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-2 border-b border-dashed border-stone-300 pb-4 text-xs">
              {activeReceiptOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between items-start">
                  <div>
                    <span className="font-bold">{it.quantity}x {it.productNameAr}</span>
                    {it.options && it.options.length > 0 && (
                      <p className="text-[10px] text-stone-500">
                        {it.options.map((o) => o.nameAr).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-bold font-outfit">{it.subtotal.toLocaleString()} ر.ي</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="text-xs space-y-1.5 border-b border-dashed border-stone-300 pb-4 font-outfit">
              <div className="flex justify-between text-stone-500">
                <span>المجموع الفرعي:</span>
                <span>{activeReceiptOrder.subtotal.toLocaleString()} ر.ي</span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-1">
                <span>الإجمالي النهائي:</span>
                <span className="text-pizza-700">{activeReceiptOrder.total.toLocaleString()} ر.ي</span>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveReceiptOrder(null)}
                className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Order Reminders Configuration Modal */}
      <RecurringReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />
    </div>
  );
}
