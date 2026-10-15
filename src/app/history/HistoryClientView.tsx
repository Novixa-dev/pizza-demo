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
        setError(
          language === "ar"
            ? "يرجى كتابة رقم الهاتف"
            : language === "id"
            ? "Silakan masukkan nomor telepon"
            : "Please enter a phone number"
        );
        return;
      }

      setError(null);
      startTransition(async () => {
        const res = await getCustomerOrderHistoryAction(trimmed);
        setSearched(true);
        if (!res.success) {
          setError(
            res.error ||
              (language === "ar"
                ? "تعذر العثور على طلبات"
                : language === "id"
                ? "Tidak ada pesanan ditemukan"
                : "No orders found")
          );
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

    const itemName = language === "ar" ? item.productNameAr : (language === "id" && (item as any).nameId ? (item as any).nameId : item.productNameEn);
    setToastMessage(
      language === "ar"
        ? `تمت إضافة (${item.quantity}x ${itemName}) إلى سلتك!`
        : language === "id"
        ? `Ditambahkan (${item.quantity}x ${itemName}) ke keranjang Anda!`
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
          label:
            language === "ar"
              ? "قيد المراجعة"
              : language === "id"
              ? "Sedang Ditinjau"
              : "Pending",
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500",
          progressIndex: 1,
        };
      case "PAYMENT_PENDING":
        return {
          label:
            language === "ar"
              ? "مراجعة إشعار التحويل"
              : language === "id"
              ? "Verifikasi Bukti Transfer"
              : "Payment Verification",
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          dot: "bg-amber-500 animate-pulse",
          progressIndex: 1,
        };
      case "CONFIRMED":
        return {
          label:
            language === "ar"
              ? "مؤكد ومجدول"
              : language === "id"
              ? "Dikonfirmasi & Terjadwal"
              : "Confirmed",
          bg: "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800",
          dot: "bg-blue-500",
          progressIndex: 2,
        };
      case "QUEUED":
        return {
          label:
            language === "ar"
              ? "مجدول بانتظار الخبز"
              : language === "id"
              ? "Terjadwal Antrean Oven"
              : "Scheduled",
          bg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
          dot: "bg-indigo-500",
          progressIndex: 2,
        };
      case "PREPARING":
        return {
          label:
            language === "ar"
              ? "في الفرن الآن 🔥"
              : language === "id"
              ? "Di Oven Batu Sekarang 🔥"
              : "Baking in Oven 🔥",
          bg: "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300 dark:border-orange-800",
          dot: "bg-orange-500 animate-ping",
          progressIndex: 3,
        };
      case "READY":
        return {
          label:
            language === "ar"
              ? "جاهز للاستلام 🍕"
              : language === "id"
              ? "Siap Diambil 🍕"
              : "Ready for Pickup 🍕",
          bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
          dot: "bg-emerald-500 animate-pulse",
          progressIndex: 4,
        };
      case "COMPLETED":
        return {
          label:
            language === "ar"
              ? "تم التسليم بنجاح"
              : language === "id"
              ? "Selesai & Diserahkan"
              : "Completed",
          bg: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700",
          dot: "bg-emerald-600",
          progressIndex: 5,
        };
      case "CANCELLED":
      case "REJECTED":
        return {
          label:
            language === "ar"
              ? "ملغي / مرفوض"
              : language === "id"
              ? "Dibatalkan / Ditolak"
              : "Cancelled",
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
        return language === "ar"
          ? "دفع عند الاستلام (كاش / شبكة)"
          : language === "id"
          ? "Bayar saat Pengambilan (Tunai / POS)"
          : "Pay at Pickup (Cash / POS)";
      case "TRANSFER_KURAIMI":
        return language === "ar"
          ? "تحويل بنك الكريمي (حاسب)"
          : language === "id"
          ? "Transfer Bank Kuraimi (Haseeb)"
          : "Kuraimi Transfer (Haseeb)";
      case "TRANSFER_AMQI":
        return language === "ar"
          ? "تحويل شركة العمقي"
          : language === "id"
          ? "Transfer Al-Amqi"
          : "Al-Amqi Transfer";
      case "TRANSFER_BUSAIRI":
        return language === "ar"
          ? "تحويل شركة البسيري"
          : language === "id"
          ? "Transfer Al-Busairi"
          : "Al-Busairi Transfer";
      default:
        return method || "—";
    }
  };

  const getCustomerTier = (totalOrders: number) => {
    if (totalOrders >= 10)
      return {
        label:
          language === "ar"
            ? "عميل بلاتيني ⭐⭐⭐"
            : language === "id"
            ? "Pelanggan Platinum ⭐⭐⭐"
            : "Platinum Member ⭐⭐⭐",
        color: "from-amber-400 to-amber-600",
      };
    if (totalOrders >= 5)
      return {
        label:
          language === "ar"
            ? "عميل ذهبي ⭐⭐"
            : language === "id"
            ? "Pelanggan Emas ⭐⭐"
            : "Gold Member ⭐⭐",
        color: "from-amber-500 to-amber-700",
      };
    if (totalOrders >= 2)
      return {
        label:
          language === "ar"
            ? "عميل فضي ⭐"
            : language === "id"
            ? "Pelanggan Perak ⭐"
            : "Silver Member ⭐",
        color: "from-stone-400 to-stone-600",
      };
    return {
      label:
        language === "ar"
          ? "عميل جديد"
          : language === "id"
          ? "Pelanggan Baru"
          : "New Customer",
      color: "from-pizza-500 to-pizza-700",
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-cairo">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-pizza-500/40 flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#14181f] via-[#0f1218] to-[#0a0c10] border border-[#C69843]/30 rounded-3xl p-6 sm:p-10 text-white shadow-[0_15px_40px_rgba(0,0,0,0.85)] relative overflow-hidden">
        <div className="absolute top-0 end-0 -mt-10 -me-10 w-52 h-52 bg-[#EFCC80]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#0c0e12]/80 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-[#EFCC80] border border-[#C69843]/30 shadow-xs">
              <Pizza className="w-3.5 h-3.5 text-[#EFCC80]" />
              <span>
                {dict.brand.name} · {language === "ar" ? "المكلا - وسط المدينة" : language === "id" ? "Mukalla - City Center" : "Mukalla - City Center"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-cairo tracking-tight text-white">
              {dict.history.title}
            </h1>
            <p className="text-sm text-stone-300 max-w-xl leading-relaxed">
              {dict.history.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition-transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 fill-current" />
              <span>{dict.hero.primaryCta}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Order Spotlight Banner */}
      {currentActiveOrder && (
        <div className="bg-[#14181f]/90 border-2 border-[#C69843]/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_25px_rgba(239,204,128,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shrink-0 shadow-md shadow-amber-950/40 animate-pulse">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#EFCC80] font-cairo">
                  {dict.history.activeOrderBannerTitle}
                </span>
                <span className="font-outfit font-black text-sm text-white">
                  {currentActiveOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {currentActiveOrder.status === "PREPARING"
                  ? (language === "ar"
                      ? "البيتزا في الفرن الآن ويتم خبزها على الحجر بعناية."
                      : language === "id"
                      ? "Pizza sedang dipanggang di oven batu dengan teliti."
                      : "Your pizza is actively baking in the stone oven.")
                  : currentActiveOrder.status === "READY"
                  ? (language === "ar"
                      ? "طلبك جاهز وساخن للاستلام من الفرع الرئيسي!"
                      : language === "id"
                      ? "Pesanan Anda siap dan hangat untuk diambil di cabang City Center!"
                      : "Your order is hot and ready for pickup at City Center branch!")
                  : (language === "ar"
                      ? "طلبك مجدول وجاري تجهيز المكونات."
                      : language === "id"
                      ? "Pesanan Anda terjadwal dan bahan-bahannya sedang disiapkan."
                      : "Your scheduled order is being prepared.")}
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
              className="inline-flex items-center gap-1.5 bg-[#0c0e12] hover:bg-[#1a202a] text-stone-200 border border-[#222934] font-bold px-3.5 py-3 rounded-2xl text-xs shadow-xs transition-colors"
              title={
                language === "ar"
                  ? "تجربة صوت وتنبيه التحديث"
                  : language === "id"
                  ? "Uji suara & pemberitahuan pembaruan"
                  : "Test alert sound & notification"
              }
            >
              <Bell className="w-3.5 h-3.5 text-[#EFCC80]" />
              <span>
                {language === "ar"
                  ? "تجربة التنبيه 🔔"
                  : language === "id"
                  ? "Uji Peringatan 🔔"
                  : "Test Alert 🔔"}
              </span>
            </button>

            <Link
              href={`/track/${currentActiveOrder.orderNumber}?token=${currentActiveOrder.trackingToken}`}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black px-5 py-3 rounded-2xl text-xs shadow-md shadow-amber-950/40 transition-all active:scale-95 shrink-0"
            >
              <Clock className="w-4 h-4" />
              <span>{dict.history.activeOrderBannerAction}</span>
              {language === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </div>
      )}

      {/* Phone Lookup Form */}
      <div className="bg-[#14181f]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
              {dict.history.phoneLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[#C69843]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="771234567 أو 05000000"
                  className="w-full text-start ps-10 pe-4 py-3.5 rounded-2xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 font-outfit text-sm focus:outline-none focus:border-[#C69843] focus:ring-2 focus:ring-[#C69843]/30 transition-all shadow-inner"
                />
                {phoneInput && (
                  <button
                    type="button"
                    onClick={handleClearPhone}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-stone-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-black disabled:opacity-50 px-7 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-950/40 active:scale-95 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>
                  {isPending
                    ? (language === "ar" ? "جاري البحث..." : language === "id" ? "Mencari..." : "Searching...")
                    : dict.history.searchBtn}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-stone-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberPhone}
                onChange={(e) => setRememberPhone(e.target.checked)}
                className="rounded border-[#222934] bg-[#0c0e12] text-[#C69843] focus:ring-[#C69843] w-4 h-4"
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
                  className="px-2.5 py-1 rounded-xl bg-[#0c0e12] border border-[#222934] hover:border-[#EFCC80]/40 text-[#EFCC80] hover:text-white font-outfit text-xs font-bold transition-colors cursor-pointer"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Customer Profile & Activity Stats Summary */}
      {stats && stats.totalOrders > 0 && (
        <div className="bg-[#14181f]/90 rounded-3xl p-6 border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center font-bold text-lg font-outfit shadow-md shadow-amber-950/40">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white font-cairo">
                    {stats.latestCustomerName ||
                      (language === "ar"
                        ? "عميل بيتزا نوڤا"
                        : language === "id"
                        ? "Pelanggan Pizza Nova"
                        : "Pizza Nova Customer")}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EFCC80]/15 text-[#EFCC80] px-2.5 py-0.5 rounded-full border border-[#C69843]/30">
                    <Award className="w-3.5 h-3.5 text-[#EFCC80]" />
                    <span>{getCustomerTier(stats.totalOrders).label}</span>
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-outfit" dir="ltr">
                  {stats.searchedPhone}
                </p>
              </div>
            </div>

            <button
              onClick={handleClearPhone}
              className="text-xs text-[#EFCC80] hover:text-white flex items-center gap-1 self-start sm:self-center font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{dict.history.changePhone}</span>
            </button>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-[#0c0e12] border border-[#222934] shadow-xs space-y-1">
              <span className="text-[11px] text-stone-400 font-medium block">
                {dict.history.totalOrders}
              </span>
              <p className="text-xl font-black text-white font-outfit">
                {stats.totalOrders}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0c0e12] border border-[#222934] shadow-xs space-y-1">
              <span className="text-[11px] text-stone-400 font-medium block">
                {dict.history.totalSpent}
              </span>
              <p className="text-xl font-black text-[#EFCC80] font-outfit">
                {stats.totalSpent.toLocaleString()}{" "}
                <span className="text-xs font-bold">{dict.menu.currency}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0c0e12] border border-[#222934] shadow-xs space-y-1">
              <span className="text-[11px] text-stone-400 font-medium block">
                {dict.history.activeOrders}
              </span>
              <p
                className={`text-xl font-black font-outfit ${
                  stats.activeOrdersCount > 0 ? "text-[#EFCC80] animate-pulse" : "text-stone-300"
                }`}
              >
                {stats.activeOrdersCount}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0c0e12] border border-[#222934] shadow-xs space-y-1">
              <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span>{dict.history.favoriteItem}</span>
              </span>
              <p className="text-xs font-bold text-white truncate">
                {stats.favoriteItem
                  ? (language === "ar" ? stats.favoriteItem.nameAr : stats.favoriteItem.nameEn)
                  : "—"}
              </p>
            </div>
          </div>

          {/* Recurring Order Reminders Quick Setup Card */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shrink-0 shadow-sm">
                <Bell className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-cairo">
                  {language === "ar"
                    ? "تنبيهات الوجبة المفضلة (كل أسبوعين)"
                    : language === "id"
                    ? "Pengingat Hidangan Favorit (Setiap 2 Minggu)"
                    : "Favorite Meal Reminders (Every 2 Weeks)"}
                </span>
                <p className="text-[11px] text-stone-400">
                  {language === "ar"
                    ? "إشعار متصفح يذكرك بطلب وجبتك المفضلة إذا مر أسبوعان دون طلب."
                    : language === "id"
                    ? "Pemberitahuan browser yang mengingatkan Anda untuk memesan hidangan favorit jika lewat 2 minggu."
                    : "Browser push notification reminding you to order your favorite meal after 2 weeks of inactivity."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReminderModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 font-black text-xs shadow-md shadow-amber-950/40 transition-colors shrink-0 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>
                {language === "ar"
                  ? "ضبط التنبيهات 🔔"
                  : language === "id"
                  ? "Atur Pengingat 🔔"
                  : "Setup Reminders 🔔"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Status Filter Tabs & Controls */}
      {searched && orders.length > 0 && (
        <div className="space-y-4">
          {/* Main Filter Tabs */}
          <div className="bg-[#14181f]/90 p-2 sm:p-2.5 rounded-2xl border border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-3">
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
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 font-black"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{dict.history.filterAll}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-outfit ${
                    statusFilter === "ALL"
                      ? "bg-[#2C1A04] text-[#EFCC80]"
                      : "bg-[#0c0e12] text-stone-300 border border-white/10"
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
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 font-black"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${counts.inProgress > 0 ? "text-amber-800 animate-pulse" : ""}`} />
                <span>{dict.history.filterActive}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-outfit ${
                    statusFilter === "IN_PROGRESS"
                      ? "bg-[#2C1A04] text-[#EFCC80]"
                      : "bg-[#0c0e12] text-stone-300 border border-white/10"
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
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 font-black"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{dict.history.filterCompleted}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-outfit ${
                    statusFilter === "COMPLETED"
                      ? "bg-[#2C1A04] text-[#EFCC80]"
                      : "bg-[#0c0e12] text-stone-300 border border-white/10"
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
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 font-black"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>{dict.history.filterCancelled}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-outfit ${
                    statusFilter === "CANCELLED"
                      ? "bg-[#2C1A04] text-[#EFCC80]"
                      : "bg-[#0c0e12] text-stone-300 border border-white/10"
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
            <div className="flex items-center gap-2 p-2 bg-[#0c0e12] rounded-2xl border border-[#222934] text-xs">
              <span className="text-[#EFCC80] font-bold ps-2">
                {language === "ar" ? "تصفية المرحلة:" : language === "id" ? "Filter Tahap:" : "Filter Stage:"}
              </span>
              <button
                type="button"
                onClick={() => setActiveSubFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  activeSubFilter === "ALL"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black"
                    : "bg-[#14181f] text-stone-300 border border-[#222934] hover:text-white"
                }`}
              >
                {language === "ar" ? "الكل النشط" : language === "id" ? "Semua Aktif" : "All Active"}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubFilter("IN_OVEN")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                  activeSubFilter === "IN_OVEN"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black"
                    : "bg-[#14181f] text-stone-300 border border-[#222934] hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{dict.history.filterInOven}</span>
                <span className="font-outfit text-[11px] opacity-80">({counts.inOven})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubFilter("READY")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                  activeSubFilter === "READY"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] font-black"
                    : "bg-[#14181f] text-stone-300 border border-[#222934] hover:text-white"
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
              className="w-full text-xs p-3.5 ps-10 pe-10 rounded-2xl border border-[#222934] bg-[#0c0e12] text-white placeholder:text-stone-500 focus:outline-none focus:border-[#EFCC80] shadow-md transition-colors"
            />
            <Search className="w-4 h-4 text-[#EFCC80] absolute start-3.5 top-1/2 -translate-y-1/2" />
            {queryFilter && (
              <button
                type="button"
                onClick={() => setQueryFilter("")}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Status Feedback Bar */}
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>
              {language === "ar"
                ? `عرض ${filteredAndSortedOrders.length} من إجمالي ${orders.length} طلب`
                : language === "id"
                ? `Menampilkan ${filteredAndSortedOrders.length} dari ${orders.length} pesanan`
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
                className="text-[#EFCC80] hover:text-[#f7dda0] hover:underline font-bold transition-colors"
              >
                {dict.history.clearFilters}
              </button>
            )}
          </div>

          {/* Orders List */}
          {filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-16 bg-[#14181f]/90 backdrop-blur-md rounded-3xl border border-[#222934] p-8 space-y-3 shadow-xl">
              <Pizza className="w-12 h-12 text-[#EFCC80] mx-auto" />
              <h4 className="text-base font-bold text-white">
                {language === "ar"
                  ? "لا توجد طلبات مطابقة لهذا الفلتر"
                  : language === "id"
                  ? "Tidak ada pesanan yang sesuai dengan filter ini"
                  : "No orders matching this filter"}
              </h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                {language === "ar"
                  ? "جرب اختيار تبويب فلاتر آخر، أو قم بمسح عبارة البحث للعثور على جميع طلباتك السابقة."
                  : language === "id"
                  ? "Coba pilih tab filter lain, atau hapus kata kunci pencarian untuk melihat semua pesanan Anda sebelumnya."
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
                const orderLocale = language === "ar" ? "ar-YE" : language === "id" ? "id-ID" : "en-US";
                const orderDate = new Date(order.createdAt).toLocaleDateString(
                  orderLocale,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "Asia/Aden",
                  }
                );
                const pickupTime = new Date(order.requestedPickupTime).toLocaleTimeString(
                  orderLocale,
                  { hour: "numeric", minute: "2-digit", timeZone: "Asia/Aden" }
                );

                return (
                  <div
                    key={order.id}
                    className="bg-[#14181f]/90 rounded-3xl border border-white/10 hover:border-[#EFCC80]/40 shadow-[0_12px_32px_rgba(0,0,0,0.85)] overflow-hidden transition-all text-white"
                  >
                    {/* Order summary header */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-outfit font-black text-base sm:text-lg text-white tracking-tight">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-400 font-outfit">
                          <Calendar className="w-3.5 h-3.5 text-[#C69843]" />
                          <span>{orderDate}</span>
                        </div>
                      </div>

                      {/* Visual Step Progress Tracker (for Active & Completed orders) */}
                      {statusBadge.progressIndex > 0 && (
                        <div className="bg-[#0c0e12] p-3.5 rounded-2xl border border-white/10">
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
                                        ? "bg-gradient-to-r from-[#EFCC80] to-[#C69843] animate-pulse"
                                        : isPast
                                        ? "bg-gradient-to-r from-[#EFCC80] to-[#C69843]"
                                        : "bg-white/10"
                                    }`}
                                  />
                                  <span
                                    className={`block text-[10px] truncate ${
                                      isCurrent
                                        ? "font-extrabold text-[#EFCC80]"
                                        : isPast
                                        ? "font-bold text-stone-300"
                                        : "text-stone-500"
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#0c0e12] p-3.5 rounded-2xl border border-[#222934]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#C69843] shrink-0" />
                          <div>
                            <span className="text-stone-400 block text-[11px]">
                              {dict.history.pickupModeLabel}:
                            </span>
                            <span className="font-bold text-white">
                              {order.pickupMode === "ASAP"
                                ? dict.history.asapPickup
                                : `${dict.history.scheduledPickup} (${pickupTime})`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-stone-400 block text-[11px]">
                              {dict.history.paymentMethod}:
                            </span>
                            <span className="font-bold text-white">
                              {getPaymentMethodLabel(order.payment?.method)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <div>
                            <span className="text-stone-400 block text-[11px] sm:text-end">
                              {dict.history.orderTotal}:
                            </span>
                            <span className="text-base font-black text-[#EFCC80] font-outfit">
                              {order.total.toLocaleString()} {dict.menu.currency}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items preview / breakdown */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-300">
                            {order.items.length} {dict.history.itemsCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="text-xs font-bold text-[#EFCC80] flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>
                              {isExpanded
                                ? (language === "ar"
                                    ? "إخفاء التفاصيل"
                                    : language === "id"
                                    ? "Sembunyikan Detail"
                                    : "Hide Details")
                                : (language === "ar"
                                    ? "عرض تفاصيل الطلب"
                                    : language === "id"
                                    ? "Lihat Detail Pesanan"
                                    : "View Details")}
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
                                className="group inline-flex items-center gap-1.5 bg-[#0c0e12] hover:bg-[#171c26] text-stone-200 ps-2.5 pe-1 py-1 rounded-xl text-xs font-medium border border-[#222934] transition-colors"
                              >
                                <span className="font-bold text-[#EFCC80] font-outfit">{it.quantity}x</span>
                                <span>
                                  {language === "ar"
                                    ? it.productNameAr
                                    : (language === "id" && (it as any).nameId ? (it as any).nameId : it.productNameEn)}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleReorderItem(it, e)}
                                  className="inline-flex items-center gap-1 bg-[#14181f] hover:bg-gradient-to-b hover:from-[#EFCC80] hover:to-[#C69843] hover:text-[#2C1A04] text-[#EFCC80] px-2 py-0.5 rounded-lg text-[10px] font-bold border border-white/5 transition-all ms-1 active:scale-90 cursor-pointer"
                                  title={
                                    language === "ar"
                                      ? `إعادة طلب ${it.productNameAr}`
                                      : language === "id"
                                      ? `Pesan ulang ${it.productNameEn}`
                                      : `Re-order ${it.productNameEn}`
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{dict.history.reorderItem}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Full Items list when expanded */}
                        {isExpanded && (
                          <div className="divide-y divide-white/5 pt-2 border-t border-white/10">
                            {order.items.map((it) => (
                              <div key={it.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center font-black font-outfit text-xs">
                                      {it.quantity}
                                    </span>
                                    <span className="font-bold text-white">
                                      {language === "ar"
                                        ? it.productNameAr
                                        : (language === "id" && (it as any).nameId ? (it as any).nameId : it.productNameEn)}
                                    </span>
                                  </div>

                                  {/* Customized Options */}
                                  {it.options && it.options.length > 0 && (
                                    <div className="text-[11px] text-[#EFCC80] ps-7 space-y-0.5">
                                      {it.options.map((opt) => (
                                        <div key={opt.id} className="flex items-center gap-1">
                                          <span>
                                            •{" "}
                                            {language === "ar"
                                              ? opt.nameAr
                                              : (opt as any).nameId && language === "id"
                                              ? (opt as any).nameId
                                              : opt.nameEn}
                                          </span>
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
                                    <p className="text-[11px] text-amber-300 ps-7 italic">
                                      &quot;{it.itemNotes}&quot;
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 ps-7 sm:ps-0 pt-1 sm:pt-0">
                                  <span className="font-bold font-outfit text-white whitespace-nowrap">
                                    {it.subtotal.toLocaleString()} {dict.menu.currency}
                                  </span>

                                  {/* Individual Item Re-order Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleReorderItem(it, e)}
                                    className="inline-flex items-center gap-1.5 bg-[#0c0e12] hover:bg-gradient-to-b hover:from-[#EFCC80] hover:to-[#C69843] hover:text-[#2C1A04] text-[#EFCC80] px-3 py-1.5 rounded-xl text-xs font-bold border border-[#222934] transition-all active:scale-95 cursor-pointer"
                                    title={
                                      language === "ar"
                                        ? `إعادة طلب ${it.productNameAr} إلى السلة`
                                        : language === "id"
                                        ? `Pesan ulang ${it.productNameEn} ke keranjang`
                                        : `Re-order ${it.productNameEn}`
                                    }
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{dict.history.reorderItem}</span>
                                  </button>
                                </div>
                              </div>
                            ))}

                            {order.notes && (
                              <div className="py-2.5 text-xs text-stone-400 ps-1">
                                <span className="font-bold text-stone-300">
                                  {dict.history.notes}:
                                </span>{" "}
                                <span>{order.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons footer */}
                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Live Tracking Link */}
                          <Link
                            href={`/track/${order.orderNumber}?token=${order.trackingToken}`}
                            className="inline-flex items-center gap-1.5 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 px-3.5 py-2 rounded-xl text-xs font-black shadow-md shadow-amber-950/40 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{dict.history.trackLive}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </Link>

                          {/* Re-order items button */}
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="inline-flex items-center gap-1.5 bg-[#0c0e12] hover:bg-[#1a202a] text-stone-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-[#222934] hover:border-[#EFCC80]/40 transition-colors active:scale-95 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#C69843]" />
                            <span>{dict.history.reorder}</span>
                          </button>

                          {/* Print Receipt */}
                          <button
                            type="button"
                            onClick={() => setActiveReceiptOrder(order)}
                            className="inline-flex items-center gap-1.5 bg-[#0c0e12] hover:bg-[#1a202a] text-stone-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-[#222934] transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{dict.history.printReceipt}</span>
                          </button>
                        </div>

                        {/* WhatsApp support */}
                        <a
                          href={`https://novixa.dev/ar/contact?text=${encodeURIComponent(
                            language === "ar"
                              ? `مرحباً مطعم بيتزا نوڤا، بخصوص طلبي رقم ${order.orderNumber} باسم ${order.customerName}`
                              : language === "id"
                              ? `Halo Pizza Nova, mengenai pesanan saya nomor ${order.orderNumber} atas nama ${order.customerName}`
                              : `Hello Pizza Nova, regarding my order ${order.orderNumber} under name ${order.customerName}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-400 hover:underline text-xs font-bold ms-auto"
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
        <div className="bg-[#14181f]/90 backdrop-blur-md rounded-3xl p-10 sm:p-14 text-center border border-[#222934] space-y-4 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-[#0c0e12] border border-[#222934] text-[#EFCC80] mx-auto flex items-center justify-center shadow-lg">
            <Pizza className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-cairo">
              {dict.history.noOrdersFound}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
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
                {language === "ar"
                  ? "المكلا - وسط المدينة | هاتف: 05000000"
                  : language === "id"
                  ? "Mukalla - City Center | Telp: 05000000"
                  : "Mukalla - City Center | Phone: 05000000"}
              </p>
              <p className="text-xs font-black font-outfit text-pizza-800 pt-1">
                {activeReceiptOrder.orderNumber}
              </p>
            </div>

            {/* Receipt Meta */}
            <div className="text-xs space-y-1.5 text-stone-600 border-b border-dashed border-stone-300 pb-4 font-outfit">
              <div className="flex justify-between">
                <span>{language === "ar" ? "العميل:" : language === "id" ? "Pelanggan:" : "Customer:"}</span>
                <span className="font-bold text-stone-900">{activeReceiptOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "ar" ? "الهاتف:" : language === "id" ? "Telepon:" : "Phone:"}</span>
                <span className="font-bold text-stone-900" dir="ltr">{activeReceiptOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "ar" ? "التاريخ:" : language === "id" ? "Tanggal:" : "Date:"}</span>
                <span>
                  {new Date(activeReceiptOrder.createdAt).toLocaleString(
                    language === "ar" ? "ar-YE" : language === "id" ? "id-ID" : "en-US"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{language === "ar" ? "طريقة الدفع:" : language === "id" ? "Metode Pembayaran:" : "Payment Method:"}</span>
                <span>{getPaymentMethodLabel(activeReceiptOrder.payment?.method)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "ar" ? "طريقة الاستلام:" : language === "id" ? "Metode Pengambilan:" : "Pickup Mode:"}</span>
                <span>
                  {activeReceiptOrder.pickupMode === "ASAP"
                    ? (language === "ar"
                        ? "استلام فوري (فور الجاهزية)"
                        : language === "id"
                        ? "Segera (saat siap)"
                        : "Immediate (when ready)")
                    : `${language === "ar" ? "مجدول" : language === "id" ? "Terjadwal" : "Scheduled"} (${new Date(
                        activeReceiptOrder.requestedPickupTime
                      ).toLocaleTimeString(language === "ar" ? "ar-YE" : language === "id" ? "id-ID" : "en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })})`}
                </span>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-2 border-b border-dashed border-stone-300 pb-4 text-xs">
              {activeReceiptOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between items-start">
                  <div>
                    <span className="font-bold">
                      {it.quantity}x{" "}
                      {language === "ar"
                        ? it.productNameAr
                        : (language === "id" && (it as any).nameId ? (it as any).nameId : it.productNameEn)}
                    </span>
                    {it.options && it.options.length > 0 && (
                      <p className="text-[10px] text-stone-500">
                        {it.options
                          .map((o) =>
                            language === "ar"
                              ? o.nameAr
                              : (o as any).nameId && language === "id"
                              ? (o as any).nameId
                              : o.nameEn
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-bold font-outfit">
                    {it.subtotal.toLocaleString()} {dict.menu.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="text-xs space-y-1.5 border-b border-dashed border-stone-300 pb-4 font-outfit">
              <div className="flex justify-between text-stone-500">
                <span>{language === "ar" ? "المجموع الفرعي:" : language === "id" ? "Subtotal:" : "Subtotal:"}</span>
                <span>
                  {activeReceiptOrder.subtotal.toLocaleString()} {dict.menu.currency}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-1">
                <span>{language === "ar" ? "الإجمالي النهائي:" : language === "id" ? "Total Akhir:" : "Final Total:"}</span>
                <span className="text-pizza-700">
                  {activeReceiptOrder.total.toLocaleString()} {dict.menu.currency}
                </span>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>
                  {language === "ar"
                    ? "طباعة الفاتورة"
                    : language === "id"
                    ? "Cetak Struk"
                    : "Print Receipt"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveReceiptOrder(null)}
                className="px-5 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-xs cursor-pointer hover:bg-stone-50"
              >
                {language === "ar" ? "إغلاق" : language === "id" ? "Tutup" : "Close"}
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
