"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import {
  verifyPaymentAction,
  updateOrderStatusAction,
  togglePauseOrderingAction,
  toggleProductAvailabilityAction,
  updateStoreSettingsAction,
} from "@/app/actions/orderActions";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  ChefHat,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldAlert,
  LogOut,
  Star,
  MessageSquare,
} from "lucide-react";
import { logoutStaffAction } from "@/app/actions/orderActions";

interface AdminClientViewProps {
  restaurant: any;
  orders: any[];
  products: any[];
}

export default function AdminClientView({
  restaurant,
  orders,
  products,
}: AdminClientViewProps) {
  const { language, dict } = useApp();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "payments" | "feedback" | "menu" | "settings"
  >("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [isPaused, setIsPaused] = useState(
    restaurant?.isOnlineOrderingPaused || false
  );
  const [pauseMessage, setPauseMessage] = useState(
    restaurant?.pauseMessageAr || ""
  );

  const [prepDuration, setPrepDuration] = useState(
    restaurant?.defaultPrepDuration || 15
  );
  const [slotCapacity, setSlotCapacity] = useState(
    restaurant?.slotCapacityLimit || 6
  );
  const [phone, setPhone] = useState(restaurant?.phone || "05375561");
  const [whatsapp, setWhatsapp] = useState(restaurant?.whatsapp || "772207788");
  const [addressAr, setAddressAr] = useState(
    restaurant?.addressAr || "المكلا - فوه - حي المساكن"
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Metrics calculation
  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REJECTED")
    .reduce((acc, o) => acc + o.total, 0);

  const pendingPayments = orders.filter(
    (o) => o.payment?.status === "PENDING_VERIFICATION"
  );

  const activeKitchenCount = orders.filter((o) =>
    ["QUEUED", "PREPARING", "READY"].includes(o.status)
  ).length;

  // Customer Feedback metrics
  const ordersWithFeedback = orders.filter((o) => o.feedback);
  const avgMealRating = ordersWithFeedback.length
    ? (
        ordersWithFeedback.reduce(
          (acc, o) => acc + (o.feedback?.mealRating || 5),
          0
        ) / ordersWithFeedback.length
      ).toFixed(1)
    : "5.0";
  const avgServiceRating = ordersWithFeedback.length
    ? (
        ordersWithFeedback.reduce(
          (acc, o) => acc + (o.feedback?.serviceRating || 5),
          0
        ) / ordersWithFeedback.length
      ).toFixed(1)
    : "5.0";

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  });

  const handleVerifyPayment = async (
    orderId: string,
    isApproved: boolean,
    reason?: string
  ) => {
    setIsProcessing(true);
    await verifyPaymentAction(orderId, isApproved, reason);
    setSelectedReceiptOrder(null);
    setRejectReason("");
    router.refresh();
    setIsProcessing(false);
  };

  const handleTogglePause = async () => {
    setIsProcessing(true);
    const nextState = !isPaused;
    setIsPaused(nextState);
    await togglePauseOrderingAction(nextState, pauseMessage);
    router.refresh();
    setIsProcessing(false);
  };

  const handleToggleAvailability = async (
    productId: string,
    current: boolean
  ) => {
    await toggleProductAvailabilityAction(productId, !current);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white py-8 sm:py-12 relative overflow-hidden font-cairo">
      {/* Ambient Glows */}
      <div className="absolute top-0 end-1/4 w-96 h-96 bg-[#EFCC80]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 start-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#14181f]/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-[#C69843]/30 shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
          <div>
            <span className="text-xs font-bold text-[#EFCC80] font-cairo">
              {language === "ar" ? "عمليات وإدارة بيتزا هاوس" : "Pizza House Operations"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-cairo">
              {dict.admin.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 bg-[#0c0e12] hover:bg-[#1a202c] border border-[#222934] hover:border-[#EFCC80]/40 text-stone-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors w-fit"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#EFCC80]" />
              <span>تحديث البيانات</span>
            </button>

            <button
              onClick={async () => {
                await logoutStaffAction();
                window.location.reload();
              }}
              className="inline-flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#222934] overflow-x-auto pb-3 scrollbar-none">
          {[
            { id: "overview", label: dict.admin.overview, icon: TrendingUp },
            { id: "orders", label: dict.admin.orders, icon: ShoppingBag, count: orders.length },
            {
              id: "payments",
              label: dict.admin.payments,
              icon: CreditCard,
              count: pendingPayments.length,
              highlight: pendingPayments.length > 0,
            },
            {
              id: "feedback",
              label: language === "ar" ? "تقييمات العملاء" : "Customer Reviews",
              icon: Star,
              count: ordersWithFeedback.length,
              highlight: ordersWithFeedback.length > 0,
            },
            { id: "menu", label: dict.admin.menuMgmt, icon: ChefHat },
            { id: "settings", label: dict.admin.settings, icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-[#EFCC80]/20 font-black"
                    : "bg-[#14181f]/80 text-stone-400 hover:text-white hover:bg-[#1c222c] border border-[#222934]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-outfit ${
                      tab.highlight
                        ? "bg-amber-400 text-stone-950 font-black animate-pulse"
                        : isActive
                        ? "bg-[#2C1A04]/20 text-[#2C1A04] font-black"
                        : "bg-[#0c0e12] border border-[#222934] text-[#EFCC80]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview Dashboard */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="bg-[#14181f]/90 backdrop-blur-md p-5 rounded-3xl border border-[#222934] hover:border-[#EFCC80]/40 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-2 transition-all">
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-xs font-bold font-cairo">{dict.admin.todayOrders}</span>
                  <ShoppingBag className="w-5 h-5 text-[#EFCC80]" />
                </div>
                <div className="text-2xl font-black font-outfit text-white">
                  {orders.length}
                </div>
                <p className="text-[11px] text-stone-400">إجمالي الطلبات اليوم</p>
              </div>

              <div className="bg-[#14181f]/90 backdrop-blur-md p-5 rounded-3xl border border-[#222934] hover:border-[#EFCC80]/40 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-2 transition-all">
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-xs font-bold font-cairo">{dict.admin.todayRevenue}</span>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-outfit text-[#EFCC80]">
                  {totalRevenue.toLocaleString()}{" "}
                  <span className="text-xs font-normal font-cairo text-stone-400">
                    {dict.menu.currency}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">صافي المبيعات</p>
              </div>

              <div className="bg-[#14181f]/90 backdrop-blur-md p-5 rounded-3xl border border-[#222934] hover:border-[#EFCC80]/40 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-2 transition-all">
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-xs font-bold font-cairo">
                    {dict.admin.pendingVerification}
                  </span>
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-outfit text-amber-400">
                  {pendingPayments.length}
                </div>
                <p className="text-[11px] text-stone-400">تحويلات مالية للمراجعة</p>
              </div>

              <div className="bg-[#14181f]/90 backdrop-blur-md p-5 rounded-3xl border border-[#222934] hover:border-[#EFCC80]/40 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-2 transition-all">
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-xs font-bold font-cairo">
                    {dict.admin.activeInKitchen}
                  </span>
                  <ChefHat className="w-5 h-5 text-[#EFCC80]" />
                </div>
                <div className="text-2xl font-black font-outfit text-[#EFCC80]">
                  {activeKitchenCount}
                </div>
                <p className="text-[11px] text-stone-400">طلبات في المطبخ</p>
              </div>

              <div
                onClick={() => setActiveTab("feedback")}
                className="bg-[#14181f]/90 backdrop-blur-md p-5 rounded-3xl border border-[#222934] hover:border-[#EFCC80]/60 shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-2 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-center text-stone-400">
                  <span className="text-xs font-bold font-cairo">
                    {language === "ar" ? "رضا العملاء والتقييم" : "Customer Rating"}
                  </span>
                  <Star className="w-5 h-5 text-[#EFCC80] fill-[#EFCC80]" />
                </div>
                <div className="text-2xl font-black font-outfit text-[#EFCC80] flex items-center gap-1.5">
                  <span>{avgMealRating}</span>
                  <span className="text-xs font-normal text-stone-400">/ 5.0</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  {ordersWithFeedback.length}{" "}
                  {language === "ar" ? "تقييم مسجل" : "reviews received"}
                </p>
              </div>
            </div>

            {/* Quick Recent Orders Table */}
            <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white font-cairo">
                  أحدث الطلبات الواردة
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-[#EFCC80] hover:text-[#f7dda0] transition-colors"
                >
                  عرض كل الطلبات ({orders.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="border-b border-[#222934] text-[#EFCC80]/80 uppercase font-outfit">
                    <tr>
                      <th className="py-2.5 px-3 text-start">رقم الطلب</th>
                      <th className="py-2.5 px-3 text-start">العميل</th>
                      <th className="py-2.5 px-3 text-start">وقت الاستلام</th>
                      <th className="py-2.5 px-3 text-start">الإجمالي</th>
                      <th className="py-2.5 px-3 text-start">طريقة الدفع</th>
                      <th className="py-2.5 px-3 text-start">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222934]">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-[#1a202c]/50 transition-colors">
                        <td className="py-3 px-3 font-bold font-outfit text-white">
                          {o.orderNumber}
                        </td>
                        <td className="py-3 px-3 text-stone-200">
                          <div>{o.customerName}</div>
                          <div className="text-[10px] text-stone-400 font-outfit">
                            {o.customerPhone}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-outfit text-stone-300">
                          {new Date(o.requestedPickupTime).toLocaleTimeString(
                            language === "ar" ? "ar-YE" : "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold font-outfit text-[#EFCC80]">
                          {o.total.toLocaleString()} {dict.menu.currency}
                        </td>
                        <td className="py-3 px-3 text-stone-300">
                          {o.payment?.method === "PAY_AT_PICKUP"
                            ? "الدفع عند الاستلام"
                            : "تحويل إلكتروني"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              o.status === "READY"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : o.status === "PREPARING"
                                ? "bg-[#EFCC80]/20 text-[#EFCC80] border border-[#EFCC80]/30"
                                : o.status === "PAYMENT_PENDING"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-[#0c0e12] text-stone-300 border border-[#222934]"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* Tab 2: Orders Manager */}
      {activeTab === "orders" && (
        <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#EFCC80] absolute top-3 start-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.admin.searchOrders}
                className="w-full text-xs ps-9 pe-3 py-2.5 rounded-xl border border-[#222934] bg-[#0c0e12] text-white placeholder-stone-500 focus:outline-none focus:border-[#EFCC80] transition-colors"
              />
            </div>
            <span className="text-xs text-stone-400">
              إجمالي النتائج: {filteredOrders.length}
            </span>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-2xl border border-[#222934] bg-[#0c0e12]/80 hover:border-[#EFCC80]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black font-outfit text-white">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-stone-500 font-bold">•</span>
                    <span className="text-xs font-bold text-stone-300">
                      {order.customerName} ({order.customerPhone})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === "READY"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : order.status === "PREPARING"
                          ? "bg-[#EFCC80]/20 text-[#EFCC80] border border-[#EFCC80]/30"
                          : order.status === "COMPLETED"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-[#14181f] text-stone-300 border border-[#222934]"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs text-stone-400 flex flex-wrap gap-3">
                    <span>
                      موعد الاستلام:{" "}
                      <b className="font-outfit text-stone-200">
                        {new Date(order.requestedPickupTime).toLocaleTimeString(
                          language === "ar" ? "ar-YE" : "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </b>
                    </span>
                    <span>
                      الإجمالي:{" "}
                      <b className="font-outfit text-[#EFCC80]">
                        {order.total.toLocaleString()} {dict.menu.currency}
                      </b>
                    </span>
                    <span>
                      الأصناف:{" "}
                      {order.items
                        .map((i: any) => `${i.quantity}x ${i.productNameAr}`)
                        .join("، ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/track/${order.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-[#1a202c] transition-colors"
                    title="معاينة صفحة التتبع"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {order.status === "READY" && (
                    <button
                      onClick={() =>
                        updateOrderStatusAction(order.id, "COMPLETED", "الكاشير")
                      }
                      className="px-4 py-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 active:scale-95 text-[#2C1A04] rounded-xl text-xs font-black shadow-md shadow-[#EFCC80]/20 transition-all"
                    >
                      تم تسليم العميل
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Transfer Payments Verification */}
      {activeTab === "payments" && (
        <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-6">
          <div className="flex justify-between items-center border-b border-[#222934] pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-cairo">
                {dict.admin.payments}
              </h3>
              <p className="text-xs text-stone-400">
                مراجعة إشعارات الحوالات البنكية (كريمي، العمقي، البسيري) واعتمادها
              </p>
            </div>
            <span className="text-xs font-bold bg-[#EFCC80]/20 text-[#EFCC80] border border-[#EFCC80]/30 px-3 py-1 rounded-full font-outfit">
              {pendingPayments.length} إشعارات معلقة
            </span>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#EFCC80] mx-auto" />
              <h4 className="text-base font-bold text-stone-200">
                لا توجد تحويلات معلقة للمراجعة
              </h4>
              <p className="text-xs text-stone-400">
                جميع طلبات التحويل البنكي تم تدقيقها واعتمادها بنجاح.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-[#C69843]/30 bg-[#0c0e12]/90 hover:border-[#EFCC80]/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black font-outfit text-white">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-stone-300">
                        {order.customerName} ({order.customerPhone})
                      </span>
                      <span className="text-xs font-bold font-outfit text-[#EFCC80]">
                        {order.total.toLocaleString()} {dict.menu.currency}
                      </span>
                    </div>

                    <div className="text-xs text-stone-400 flex flex-wrap gap-4">
                      <span>
                        البنك / الصرافة: <b className="text-stone-200">{order.payment?.method}</b>
                      </span>
                      {order.payment?.referenceNumber && (
                        <span>
                          الرقم المرجعي:{" "}
                          <b className="font-outfit text-white">
                            {order.payment.referenceNumber}
                          </b>
                        </span>
                      )}
                      <span>
                        الموعد المفضل:{" "}
                        <b className="font-outfit text-stone-200">
                          {new Date(order.requestedPickupTime).toLocaleTimeString(
                            language === "ar" ? "ar-YE" : "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </b>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.payment?.receipt?.fileUrl ? (
                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#14181f] hover:bg-[#1c222c] border border-[#222934] hover:border-[#EFCC80]/40 text-stone-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#EFCC80]" />
                        <span>معاينة الإشعار</span>
                      </button>
                    ) : (
                      <span className="text-xs text-red-400 font-bold">
                        لم يُرفق صورة
                      </span>
                    )}

                    <button
                      onClick={() => handleVerifyPayment(order.id, true)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 active:scale-95 text-[#2C1A04] text-xs font-black rounded-xl shadow-md shadow-[#EFCC80]/20 transition-all"
                    >
                      {dict.admin.approve}
                    </button>

                    <button
                      onClick={() => {
                        const reason = prompt(
                          dict.admin.rejectReasonPrompt,
                          "المبلغ غير مطابق للإجمالي"
                        );
                        if (reason) {
                          handleVerifyPayment(order.id, false, reason);
                        }
                      }}
                      disabled={isProcessing}
                      className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      {dict.admin.reject}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Menu & Pricing Quick Stock Toggle */}
      {activeTab === "menu" && (
        <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-6">
          <div className="flex justify-between items-center border-b border-[#222934] pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-cairo">
                {dict.admin.menuMgmt}
              </h3>
              <p className="text-xs text-stone-400">
                التحكم بتوفر الأصناف فوراً (متوفر / نفدت الكمية)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl border border-[#222934] bg-[#0c0e12]/80 hover:border-[#EFCC80]/40 flex items-center justify-between gap-3 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#14181f] border border-[#222934]">
                    <Image
                      src={prod.imageUrl}
                      alt={prod.nameAr}
                      fill
                      sizes="48px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {prod.nameAr}
                    </h4>
                    <span className="text-[11px] font-outfit text-[#EFCC80] font-bold">
                      {prod.basePrice.toLocaleString()} {dict.menu.currency}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleAvailability(prod.id, prod.isAvailable)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    prod.isAvailable
                      ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 active:scale-95 text-[#2C1A04] font-black shadow-sm"
                      : "bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300"
                  }`}
                >
                  {prod.isAvailable ? dict.admin.markAvailable : dict.admin.markSoldOut}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Customer Feedback & Reviews */}
      {activeTab === "feedback" && (
        <div className="space-y-6">
          {/* Top Score Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-1">
              <span className="text-xs font-bold text-stone-400">
                {language === "ar" ? "متوسط تقييم جودة الوجبات" : "Average Food Rating"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black font-outfit text-[#EFCC80]">
                  {avgMealRating}
                </span>
                <div className="flex items-center text-[#EFCC80]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(Number(avgMealRating))
                          ? "fill-[#EFCC80] text-[#EFCC80]"
                          : "text-stone-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-1">
              <span className="text-xs font-bold text-stone-400">
                {language === "ar" ? "متوسط تقييم سرعة الخدمة" : "Average Service Speed"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black font-outfit text-emerald-400">
                  {avgServiceRating}
                </span>
                <div className="flex items-center text-[#EFCC80]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(Number(avgServiceRating))
                          ? "fill-[#EFCC80] text-[#EFCC80]"
                          : "text-stone-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-1">
              <span className="text-xs font-bold text-stone-400">
                {language === "ar" ? "إجمالي التقييمات المستلمة" : "Total Reviews"}
              </span>
              <div className="text-3xl font-black font-outfit text-white">
                {ordersWithFeedback.length}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-[#14181f]/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
            <h3 className="text-base font-bold text-white font-cairo">
              {language === "ar" ? "آراء وتقييمات زبائن بيتزا هاوس" : "Customer Reviews & Feedback"}
            </h3>

            {ordersWithFeedback.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500 space-y-2">
                <Star className="w-8 h-8 text-stone-600 mx-auto" />
                <p>{language === "ar" ? "لا توجد تقييمات مسجلة حتى الآن." : "No reviews registered yet."}</p>
              </div>
            ) : (
              <div className="divide-y divide-[#222934] space-y-4">
                {ordersWithFeedback.map((ord) => {
                  const fb = ord.feedback;
                  const tags = fb.tags ? (typeof fb.tags === "string" ? fb.tags.split(",") : fb.tags) : [];

                  return (
                    <div key={ord.id} className="pt-4 first:pt-0 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-cairo text-sm">
                            {ord.customerName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EFCC80]/15 text-[#EFCC80] border border-[#EFCC80]/30 font-outfit font-black text-[11px]">
                            {ord.orderNumber}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-outfit">
                          {new Date(fb.createdAt).toLocaleDateString("ar-YE")}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="text-stone-400">جودة الوجبة:</span>
                          <div className="flex text-[#EFCC80]">
                            {[1, 2, 3, 4, 5].map((s: number) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= fb.mealRating ? "fill-[#EFCC80] text-[#EFCC80]" : "text-stone-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-stone-400">سرعة الخدمة:</span>
                          <div className="flex text-[#EFCC80]">
                            {[1, 2, 3, 4, 5].map((s: number) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= fb.serviceRating ? "fill-[#EFCC80] text-[#EFCC80]" : "text-stone-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tags.map((tg: string) => (
                            <span
                              key={tg}
                              className="px-2.5 py-0.5 rounded-lg bg-[#0c0e12] border border-[#222934] text-[#EFCC80] text-[10px] font-bold"
                            >
                              {tg}
                            </span>
                          ))}
                        </div>
                      )}

                      {fb.comment && (
                        <p className="p-3 rounded-xl bg-[#0c0e12] border border-[#222934] text-stone-200 italic">
                          &quot;{fb.comment}&quot;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Operational Settings & Emergency Pause */}
      {activeTab === "settings" && (
        <div className="space-y-6 max-w-3xl">
          {/* Pause Ordering Card */}
          <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-cairo">
                {dict.admin.pauseOrdering}
              </h3>
              <p className="text-xs text-stone-400">{dict.admin.pauseOrderingDesc}</p>
            </div>

            <div className="p-4 rounded-2xl border border-[#222934] bg-[#0c0e12] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  حالة استقبال الطلبات الرقمية:
                </span>
                <button
                  onClick={handleTogglePause}
                  disabled={isProcessing}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isPaused
                      ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 text-[#2C1A04] font-black shadow-md shadow-[#EFCC80]/20"
                      : "bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300"
                  }`}
                >
                  {isPaused ? (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>إعادة استئناف الطلبات</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      <span>إيقاف مؤقت للطلبات</span>
                    </>
                  )}
                </button>
              </div>

              {isPaused && (
                <div className="space-y-1.5 pt-3 border-t border-[#222934]">
                  <label className="text-xs font-bold text-stone-300">
                    رسالة التنبيه المعروضة للزبائن:
                  </label>
                  <input
                    type="text"
                    value={pauseMessage}
                    onChange={(e) => setPauseMessage(e.target.value)}
                    placeholder="نعتذر، تم إيقاف استقبال الطلبات مؤقتاً..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#222934] bg-[#14181f] text-white focus:outline-none focus:border-[#EFCC80] transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ovens, Slots & Branch Logistics Configuration */}
          <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-cairo">
                إعدادات الأفران، سعة الفترات، وبيانات الفرع
              </h3>
              <p className="text-xs text-stone-400">
                تحديد وقت التجهيز الافتراضي للفرن، الحد الأقصى للطلبات في الشريحة الزمنية، ومعلومات التواصل.
              </p>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">
                  مدة تجهيز وخبز البيتزا (بالدقائق):
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={prepDuration}
                  onChange={(e) => setPrepDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#222934] bg-[#0c0e12] text-white font-outfit focus:outline-none focus:border-[#EFCC80] transition-colors"
                />
                <span className="text-[11px] text-stone-500">
                  تحدد موعد إطلاق التذكرة في شاشة المطبخ (افتراضياً: 15 دقيقة)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">
                  سعة الأفران القصوى لكل شريحة (15 دقيقة):
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={slotCapacity}
                  onChange={(e) => setSlotCapacity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#222934] bg-[#0c0e12] text-white font-outfit focus:outline-none focus:border-[#EFCC80] transition-colors"
                />
                <span className="text-[11px] text-stone-500">
                  الحد الأقصى للطلبات المتزامنة قبل وضع الشريحة بحالة &quot;ممتلئ&quot;
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">
                  رقم الهاتف الثابت للفرع:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#222934] bg-[#0c0e12] text-white font-outfit focus:outline-none focus:border-[#EFCC80] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">
                  رقم الواتساب الرسمي (خدمة العملاء):
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#222934] bg-[#0c0e12] text-white font-outfit focus:outline-none focus:border-[#EFCC80] transition-colors"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-stone-300">
                  العنوان الرسمي ونقاط الدلالة (بالعربية):
                </label>
                <input
                  type="text"
                  value={addressAr}
                  onChange={(e) => setAddressAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#222934] bg-[#0c0e12] text-white focus:outline-none focus:border-[#EFCC80] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true);
                  setSaveSuccessMsg("");
                  const res = await updateStoreSettingsAction({
                    defaultPrepDuration: prepDuration,
                    slotCapacityLimit: slotCapacity,
                    phone,
                    whatsapp,
                    addressAr,
                  });
                  if (res.success) {
                    setSaveSuccessMsg("تم حفظ وتحديث إعدادات الفرع بنجاح!");
                    router.refresh();
                  }
                  setIsProcessing(false);
                }}
                className="bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 active:scale-95 text-[#2C1A04] px-6 py-2.5 rounded-xl text-xs font-black shadow-md shadow-[#EFCC80]/20 transition-all"
              >
                {isProcessing ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </div>

          {/* Official Bank Accounts Information */}
          <div className="bg-[#14181f]/90 backdrop-blur-md p-6 rounded-3xl border border-[#222934] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-4">
            <h3 className="text-base font-bold text-white font-cairo">
              حسابات التحويل المالي المعتمدة للعملاء
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0c0e12] border border-[#222934] space-y-1">
                <span className="font-bold text-[#EFCC80] block">
                  بنك الكريمي (حاسب)
                </span>
                <span className="font-outfit font-black text-white block text-sm">
                  PH-772207788
                </span>
                <span className="text-[11px] text-stone-400">باسم: بيتزا هاوس</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0c0e12] border border-[#222934] space-y-1">
                <span className="font-bold text-emerald-400 block">
                  شركة العمقي للصرافة
                </span>
                <span className="font-outfit font-black text-white block text-sm">
                  25401982
                </span>
                <span className="text-[11px] text-stone-400">حساب تجاري: بيتزا هاوس</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0c0e12] border border-[#222934] space-y-1">
                <span className="font-bold text-sky-400 block">
                  شركة البسيري للصرافة
                </span>
                <span className="font-outfit font-black text-white block text-sm">
                  889104
                </span>
                <span className="text-[11px] text-stone-400">فرع فوه: بيتزا هاوس</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Inspection Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#14181f] rounded-3xl max-w-lg w-full overflow-hidden border border-[#C69843]/40 shadow-2xl space-y-4 p-5">
            <div className="flex justify-between items-center border-b border-[#222934] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  معاينة إشعار التحويل • {selectedReceiptOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-400">
                  المرسل: {selectedReceiptOrder.customerName} (
                  {selectedReceiptOrder.payment?.amount?.toLocaleString()}{" "}
                  {dict.menu.currency})
                </p>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#222934] max-h-96 flex items-center justify-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedReceiptOrder.payment?.receipt?.fileUrl}
                alt="Receipt Full Preview"
                className="max-h-96 w-full object-contain"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-[#222934] bg-[#0c0e12] text-stone-300 hover:text-white text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() => handleVerifyPayment(selectedReceiptOrder.id, true)}
                className="px-5 py-2.5 bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 active:scale-95 text-[#2C1A04] rounded-xl text-xs font-black shadow-md shadow-[#EFCC80]/20 transition-all"
              >
                اعتماد وتأكيد التحويل
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
