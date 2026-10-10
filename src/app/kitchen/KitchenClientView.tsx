"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { updateOrderStatusAction } from "@/app/actions/orderActions";
import { useRouter } from "next/navigation";
import {
  Flame,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCw,
  ChefHat,
  AlertTriangle,
  Package,
  LogOut,
} from "lucide-react";
import { logoutStaffAction } from "@/app/actions/orderActions";

interface KitchenClientViewProps {
  initialOrders: any[];
}

export default function KitchenClientView({ initialOrders }: KitchenClientViewProps) {
  const { language, dict } = useApp();
  const router = useRouter();

  const [orders, setOrders] = useState(initialOrders);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Sync state when initialOrders changes
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Clock tick & auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);

    const refreshTimer = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, [router]);

  // Audio Chime utility
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // Classify orders into 4 operational buckets based on state and release timing
  const { upcoming, readyToPrep, preparing, ready } = useMemo(() => {
    const buckets = {
      upcoming: [] as any[],
      readyToPrep: [] as any[],
      preparing: [] as any[],
      ready: [] as any[],
    };

    orders.forEach((order) => {
      const releaseTime = new Date(order.plannedPrepStartTime);
      const isReleaseTriggered = currentTime.getTime() >= releaseTime.getTime();

      if (order.status === "READY") {
        buckets.ready.push(order);
      } else if (order.status === "PREPARING") {
        buckets.preparing.push(order);
      } else if (order.status === "QUEUED" || order.status === "CONFIRMED") {
        if (isReleaseTriggered) {
          buckets.readyToPrep.push(order);
        } else {
          buckets.upcoming.push(order);
        }
      }
    });

    return buckets;
  }, [orders, currentTime]);

  const handleStatusChange = async (orderId: string, nextStatus: any) => {
    setIsUpdating(orderId);
    playChime();
    await updateOrderStatusAction(orderId, nextStatus, "مطبخ بيتزا هاوس");
    router.refresh();
    setIsUpdating(null);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0c0e12] text-white py-8 sm:py-12 relative overflow-hidden font-cairo">
      {/* Background Ambience */}
      <div className="absolute top-0 end-1/4 w-96 h-96 bg-[#EFCC80]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 start-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        {/* KDS Control Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#14181f]/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#C69843]/30 shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] flex items-center justify-center text-[#2C1A04] shadow-lg shadow-[#EFCC80]/20 flex-shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black font-cairo flex items-center gap-2">
              <span className="text-white">{dict.kitchen.title}</span>
              <span className="text-xs bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] px-2.5 py-0.5 rounded-full font-cairo font-bold shadow-sm">
                {language === "ar" ? "مباشر" : "LIVE"}
              </span>
            </h1>
            <p className="text-xs text-[#EFCC80]/80 font-outfit font-bold">
              {currentTime.toLocaleTimeString(language === "ar" ? "ar-YE" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? "bg-[#0c0e12] border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "bg-[#0c0e12] border-[#222934] text-stone-500 hover:text-stone-300"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{dict.kitchen.soundToggle}</span>
          </button>

          <button
            onClick={() => {
              router.refresh();
              playChime();
            }}
            className="p-2.5 rounded-xl bg-[#0c0e12] hover:bg-[#1a202c] border border-[#222934] hover:border-[#EFCC80]/40 text-stone-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <RotateCw className="w-4 h-4 text-[#EFCC80]" />
            <span className="hidden sm:inline">{dict.kitchen.autoRefresh}</span>
          </button>

          <button
            onClick={async () => {
              await logoutStaffAction();
              window.location.reload();
            }}
            className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 flex items-center gap-1.5 text-xs font-bold transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>

      {/* 4 Column Kitchen Board */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {/* Col 1: Upcoming Scheduled */}
        <div className="bg-[#14181f]/80 backdrop-blur-md rounded-3xl p-4 border border-[#222934] space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
          <div className="flex justify-between items-center border-b border-[#222934] pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-200 font-cairo">
                {dict.kitchen.colUpcoming}
              </h3>
              <p className="text-[11px] text-stone-400">{dict.kitchen.colUpcomingDesc}</p>
            </div>
            <span className="w-7 h-7 rounded-full bg-[#0c0e12] border border-[#222934] text-[#EFCC80] text-xs font-bold font-outfit flex items-center justify-center">
              {upcoming.length}
            </span>
          </div>

          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-8">{dict.kitchen.emptyCol}</p>
            ) : (
              upcoming.map((order) => (
                <TicketCard
                  key={order.id}
                  order={order}
                  type="upcoming"
                  language={language}
                  dict={dict}
                  isUpdating={isUpdating === order.id}
                  onAction={() => handleStatusChange(order.id, "PREPARING")}
                />
              ))
            )}
          </div>
        </div>

        {/* Col 2: Ready to Prepare (Release window active!) */}
        <div className="bg-[#14181f]/95 backdrop-blur-md rounded-3xl p-4 border-2 border-[#EFCC80] space-y-4 shadow-[0_0_30px_rgba(239,204,128,0.15)]">
          <div className="flex justify-between items-center border-b border-[#222934] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#EFCC80] font-cairo flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#EFCC80] animate-pulse" />
                <span>{dict.kitchen.colReadyToPrep}</span>
              </h3>
              <p className="text-[11px] text-stone-300">{dict.kitchen.colReadyToPrepDesc}</p>
            </div>
            <span className="w-7 h-7 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] text-xs font-black font-outfit flex items-center justify-center animate-pulse shadow-md">
              {readyToPrep.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyToPrep.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-8">{dict.kitchen.emptyCol}</p>
            ) : (
              readyToPrep.map((order) => (
                <TicketCard
                  key={order.id}
                  order={order}
                  type="readyToPrep"
                  language={language}
                  dict={dict}
                  isUpdating={isUpdating === order.id}
                  onAction={() => handleStatusChange(order.id, "PREPARING")}
                />
              ))
            )}
          </div>
        </div>

        {/* Col 3: Preparing (In Oven) */}
        <div className="bg-[#14181f]/80 backdrop-blur-md rounded-3xl p-4 border border-[#C69843]/40 space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
          <div className="flex justify-between items-center border-b border-[#222934] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#EFCC80] font-cairo flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#EFCC80]" />
                <span>{dict.kitchen.colPreparing}</span>
              </h3>
              <p className="text-[11px] text-stone-400">{dict.kitchen.colPreparingDesc}</p>
            </div>
            <span className="w-7 h-7 rounded-full bg-[#C69843]/20 border border-[#C69843]/40 text-[#EFCC80] text-xs font-bold font-outfit flex items-center justify-center">
              {preparing.length}
            </span>
          </div>

          <div className="space-y-3">
            {preparing.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-8">{dict.kitchen.emptyCol}</p>
            ) : (
              preparing.map((order) => (
                <TicketCard
                  key={order.id}
                  order={order}
                  type="preparing"
                  language={language}
                  dict={dict}
                  isUpdating={isUpdating === order.id}
                  onAction={() => handleStatusChange(order.id, "READY")}
                />
              ))
            )}
          </div>
        </div>

        {/* Col 4: Ready for Pickup */}
        <div className="bg-[#14181f]/80 backdrop-blur-md rounded-3xl p-4 border border-emerald-500/30 space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
          <div className="flex justify-between items-center border-b border-[#222934] pb-3">
            <div>
              <h3 className="text-sm font-bold text-emerald-400 font-cairo flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{dict.kitchen.colReady}</span>
              </h3>
              <p className="text-[11px] text-stone-400">{dict.kitchen.colReadyDesc}</p>
            </div>
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black font-outfit flex items-center justify-center">
              {ready.length}
            </span>
          </div>

          <div className="space-y-3">
            {ready.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-8">{dict.kitchen.emptyCol}</p>
            ) : (
              ready.map((order) => (
                <TicketCard
                  key={order.id}
                  order={order}
                  type="ready"
                  language={language}
                  dict={dict}
                  isUpdating={isUpdating === order.id}
                  onAction={() => handleStatusChange(order.id, "COMPLETED")}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

function TicketCard({
  order,
  type,
  language,
  dict,
  isUpdating,
  onAction,
}: {
  order: any;
  type: "upcoming" | "readyToPrep" | "preparing" | "ready";
  language: string;
  dict: any;
  isUpdating: boolean;
  onAction: () => void;
}) {
  const pickupTimeStr = new Date(order.requestedPickupTime).toLocaleTimeString(
    language === "ar" ? "ar-YE" : "en-US",
    { hour: "2-digit", minute: "2-digit" }
  );

  const releaseTimeStr = new Date(order.plannedPrepStartTime).toLocaleTimeString(
    language === "ar" ? "ar-YE" : "en-US",
    { hour: "2-digit", minute: "2-digit" }
  );

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        type === "readyToPrep"
          ? "bg-[#0c0e12]/95 border-[#EFCC80] shadow-[0_0_20px_rgba(239,204,128,0.2)]"
          : type === "preparing"
          ? "bg-[#0c0e12]/95 border-[#C69843]/60 shadow-[0_0_15px_rgba(198,152,67,0.15)]"
          : type === "ready"
          ? "bg-[#0c0e12]/95 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          : "bg-[#0c0e12]/90 border-[#222934] hover:border-[#EFCC80]/40"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b border-[#222934] pb-2.5">
        <div>
          <span className="text-base font-black text-white font-outfit">
            {order.orderNumber}
          </span>
          <p className="text-xs text-stone-300 font-bold">{order.customerName}</p>
        </div>

        <div className="text-end">
          <span className="text-[10px] text-stone-400 block font-cairo">
            {dict.kitchen.targetPickup}
          </span>
          <span className="text-xs font-black text-[#EFCC80] font-outfit">
            {pickupTimeStr}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="py-3 space-y-2 text-xs">
        {order.items.map((item: any) => (
          <div key={item.id} className="space-y-0.5">
            <div className="flex items-center justify-between font-bold text-stone-100">
              <span>
                {item.quantity}x {language === "ar" ? item.productNameAr : item.productNameEn}
              </span>
            </div>

            {item.options?.length > 0 && (
              <div className="text-[11px] text-[#EFCC80] font-medium ps-2">
                {item.options
                  .map((o: any) => (language === "ar" ? o.nameAr : o.nameEn))
                  .join(" + ")}
              </div>
            )}

            {item.itemNotes && (
              <p className="text-[10px] text-amber-300/90 italic ps-2">
                &quot;{item.itemNotes}&quot;
              </p>
            )}
          </div>
        ))}

        {order.notes && (
          <div className="pt-1.5 border-t border-[#222934] text-[11px] text-red-400 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>ملاحظة: {order.notes}</span>
          </div>
        )}
      </div>

      {/* Footer Action Button */}
      <div className="pt-2 border-t border-[#222934] flex items-center justify-between gap-2">
        <span className="text-[10px] text-stone-400 font-outfit">
          {order.pickupMode === "ASAP" ? "فوري (ASAP)" : `بدء: ${releaseTimeStr}`}
        </span>

        {type === "upcoming" ? (
          <button
            onClick={onAction}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-[#14181f] hover:bg-[#1a202c] border border-[#222934] hover:border-[#EFCC80]/40 text-stone-200 rounded-xl text-xs font-bold transition-colors"
          >
            تقديم البدء
          </button>
        ) : type === "readyToPrep" ? (
          <button
            onClick={onAction}
            disabled={isUpdating}
            className="px-4 py-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 active:scale-95 text-[#2C1A04] font-black rounded-xl text-xs shadow-md shadow-[#EFCC80]/20 transition-all flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{dict.kitchen.startBaking}</span>
          </button>
        ) : type === "preparing" ? (
          <button
            onClick={onAction}
            disabled={isUpdating}
            className="px-4 py-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] hover:brightness-110 active:scale-95 text-[#2C1A04] font-black rounded-xl text-xs shadow-md shadow-[#EFCC80]/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{dict.kitchen.markReady}</span>
          </button>
        ) : (
          <button
            onClick={onAction}
            disabled={isUpdating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-700/30 transition-all flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{dict.kitchen.markCompleted}</span>
          </button>
        )}
      </div>
    </div>
  );
}
