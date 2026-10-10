"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Pizza,
  Flame,
  CheckCircle2,
  Clock,
  X,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Bell,
} from "lucide-react";

export interface StatusToast {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  previousStatus?: string;
  newStatus: string;
  trackingToken?: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  iconType: "flame" | "ready" | "check" | "confirmed" | "alert";
  timestamp: number;
}

/**
 * High-fidelity Web Audio API chime synthesizer for crisp real-time restaurant alerts.
 * Generates pleasant polyphonic tones without requiring external audio files.
 */
function playAudioAlert(
  type: "flame" | "ready" | "check" | "confirmed" | "alert" | "default" = "ready"
) {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "ready") {
      // Celebratory melody: C5 -> E5 -> G5 -> C6 (Hot & Ready to pickup)
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.frequency.setValueAtTime(783.99, now + 0.24);
      osc.frequency.setValueAtTime(1046.5, now + 0.36);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);
    } else if (type === "flame") {
      // Warm oven tone: F4 -> A4 -> C5 (Baking started)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(349.23, now);
      osc.frequency.setValueAtTime(440.0, now + 0.15);
      osc.frequency.setValueAtTime(523.25, now + 0.3);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } else {
      // Soft chime: G5 -> C6 (Confirmed / General)
      osc.type = "sine";
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.setValueAtTime(1046.5, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch {
    // Audio context may be temporarily suspended until user interacts with document
  }
}

export default function RealtimeOrderToaster() {
  const { language } = useApp();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<StatusToast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Cache of known order status to prevent duplicate toasts
  const knownStatusRef = useRef<Record<string, string>>({});
  const initialLoadDoneRef = useRef(false);

  // Load sound preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSound = localStorage.getItem("ph_sound_alerts");
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("ph_sound_alerts", String(next));
    if (next) {
      playAudioAlert("default");
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pushStatusToast = React.useCallback(
    (toastData: Omit<StatusToast, "id" | "timestamp">) => {
      const id = `${toastData.orderId}-${toastData.newStatus}-${Date.now()}`;
      const newToast: StatusToast = {
        ...toastData,
        id,
        timestamp: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep max 4 active toasts

      if (soundEnabled) {
        playAudioAlert(toastData.iconType);
      }

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        removeToast(id);
      }, 8500);
    },
    [soundEnabled]
  );

  // Expose global manual trigger for testing and cross-component notifications
  useEffect(() => {
    (window as unknown as { __triggerTestOrderToast?: (status?: string) => void }).__triggerTestOrderToast = (
      mockStatus = "READY"
    ) => {
      if (mockStatus === "PREPARING") {
        pushStatusToast({
          orderId: "demo-preparing",
          orderNumber: "#PH-1025",
          previousStatus: "CONFIRMED",
          newStatus: "PREPARING",
          titleAr: "طلبك في الفرن الآن! 🔥",
          titleEn: "Order In the Oven! 🔥",
          messageAr: "بدأ طهاة بيتزا هاوس بخبز البيتزا على الحجر لتكون ساخنة ومقرمشة.",
          messageEn: "Your stone-baked pizza is now baking in the oven at Fuwa branch.",
          iconType: "flame",
        });
      } else if (mockStatus === "READY") {
        pushStatusToast({
          orderId: "demo-ready",
          orderNumber: "#PH-1025",
          previousStatus: "PREPARING",
          newStatus: "READY",
          titleAr: "طلبك جاهز وساخن للاستلام! 🍕",
          titleEn: "Order Ready for Pickup! 🍕",
          messageAr: "تم إخراج طلبك من الفرن وموضوع على رف الاستلام الساخن بفرع فوه.",
          messageEn: "Your piping hot order is packaged and waiting at Fuwa counter.",
          iconType: "ready",
        });
      } else {
        pushStatusToast({
          orderId: "demo-completed",
          orderNumber: "#PH-1025",
          previousStatus: "READY",
          newStatus: "COMPLETED",
          titleAr: "تم تسليم الطلب بنجاح ❤️",
          titleEn: "Order Handed Over ❤️",
          messageAr: "شكراً لطلبك من بيتزا هاوس المكلا. نتمنى لك وجبة هنيئة!",
          messageEn: "Thank you for choosing Pizza House Mukalla. Enjoy your meal!",
          iconType: "check",
        });
      }
    };
  }, [pushStatusToast]);

  // Main real-time tracker: Connects to SSE stream with polling fallback
  useEffect(() => {
    let sseSource: EventSource | null = null;
    let pollTimer: NodeJS.Timeout | null = null;

    const getStoredCustomerPhone = () => {
      if (typeof window === "undefined") return "";
      return localStorage.getItem("ph_customer_phone") || "";
    };

    const processOrderUpdates = (orders: any[]) => {
      for (const ord of orders) {
        const prevStatus = knownStatusRef.current[ord.id];

        // Only alert if we already knew this order and its status strictly changed
        if (initialLoadDoneRef.current && prevStatus && prevStatus !== ord.status) {
          if (ord.status === "PREPARING") {
            pushStatusToast({
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              customerName: ord.customerName,
              previousStatus: prevStatus,
              newStatus: ord.status,
              trackingToken: ord.trackingToken,
              titleAr: `طلبك ${ord.orderNumber} في الفرن الآن! 🔥`,
              titleEn: `Order ${ord.orderNumber} is Baking in the Oven! 🔥`,
              messageAr: "بدأ طهاة بيتزا هاوس بخبز طلبك طازجاً على الحجر بالفرن.",
              messageEn: "Baking has started! Your pizza is being stone-baked to perfection.",
              iconType: "flame",
            });
          } else if (ord.status === "READY") {
            pushStatusToast({
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              customerName: ord.customerName,
              previousStatus: prevStatus,
              newStatus: ord.status,
              trackingToken: ord.trackingToken,
              titleAr: `طلبك ${ord.orderNumber} جاهز للاستلام! 🍕`,
              titleEn: `Order ${ord.orderNumber} is Ready for Pickup! 🍕`,
              messageAr: "طلبك ساخن وموضوع على رف الاستلام بفرع فوه. يمكنك استلامه الآن!",
              messageEn: "Your piping hot order is packaged and waiting at Fuwa counter.",
              iconType: "ready",
            });
          } else if (ord.status === "COMPLETED") {
            pushStatusToast({
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              customerName: ord.customerName,
              previousStatus: prevStatus,
              newStatus: ord.status,
              trackingToken: ord.trackingToken,
              titleAr: `تم تسليم طلبك ${ord.orderNumber} بنجاح ✅`,
              titleEn: `Order ${ord.orderNumber} Completed ✅`,
              messageAr: "شكراً لطلبك من بيتزا هاوس المكلا. بالهناء والشفاء!",
              messageEn: "Thank you for dining with Pizza House. Enjoy your meal!",
              iconType: "check",
            });
          } else if (ord.status === "CONFIRMED") {
            pushStatusToast({
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              customerName: ord.customerName,
              previousStatus: prevStatus,
              newStatus: ord.status,
              trackingToken: ord.trackingToken,
              titleAr: `تم تأكيد طلبك ${ord.orderNumber} ⏱️`,
              titleEn: `Order ${ord.orderNumber} Confirmed ⏱️`,
              messageAr: "تم تأكيد طلبك وحجز موعد الخبز في الفرن.",
              messageEn: "Your time slot has been confirmed in our kitchen system.",
              iconType: "confirmed",
            });
          } else if (ord.status === "REJECTED" || ord.status === "CANCELLED") {
            pushStatusToast({
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              customerName: ord.customerName,
              previousStatus: prevStatus,
              newStatus: ord.status,
              trackingToken: ord.trackingToken,
              titleAr: `تحديث بشأن طلبك ${ord.orderNumber}`,
              titleEn: `Update on order ${ord.orderNumber}`,
              messageAr: "تم إلغاء الطلب أو مراجعة إشعار التحويل.",
              messageEn: "Order has been updated or cancelled.",
              iconType: "alert",
            });
          }
        }

        // Update known status
        knownStatusRef.current[ord.id] = ord.status;
      }

      initialLoadDoneRef.current = true;
    };

    const fetchLiveUpdates = async () => {
      const phone = getStoredCustomerPhone();
      if (!phone) return;

      try {
        const res = await fetch(`/api/orders/live?phone=${encodeURIComponent(phone)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            processOrderUpdates(data.orders);
          }
        }
      } catch {
        // Silently tolerate network glitches
      }
    };

    // Initial check immediately
    fetchLiveUpdates();

    // High-frequency polling loop (every 4.5 seconds for instant reactive updates)
    pollTimer = setInterval(fetchLiveUpdates, 4500);

    // Also attempt SSE stream connection if browser supports EventSource
    const phone = getStoredCustomerPhone();
    if (typeof EventSource !== "undefined" && phone) {
      try {
        sseSource = new EventSource(`/api/orders/stream?phone=${encodeURIComponent(phone)}`);
        sseSource.addEventListener("status_change", (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.orderId) {
              processOrderUpdates([
                {
                  id: data.orderId,
                  orderNumber: data.orderNumber,
                  customerName: data.customerName,
                  status: data.newStatus,
                  trackingToken: data.trackingToken,
                },
              ]);
            }
          } catch {
            // Error parsing SSE event data
          }
        });
      } catch {
        // SSE not supported or blocked; polling timer remains active
      }
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (sseSource) sseSource.close();
    };
  }, [pushStatusToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-4 end-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isFlame = toast.iconType === "flame";
        const isReady = toast.iconType === "ready";
        const isCheck = toast.iconType === "check";

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border p-4 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              isReady
                ? "bg-[#14181f]/95 text-white border-emerald-500/50 shadow-emerald-950/40"
                : isFlame
                ? "bg-[#14181f]/95 text-white border-[#EFCC80]/50 shadow-amber-950/40"
                : isCheck
                ? "bg-[#14181f]/95 text-white border-emerald-500/40"
                : "bg-[#14181f]/95 text-white border-[#222934]"
            }`}
          >
            {/* Countdown draining bar */}
            <div className="absolute bottom-0 start-0 end-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
              <div
                className={`h-full animate-[shrink_8s_linear_forwards] ${
                  isReady
                    ? "bg-emerald-400"
                    : isFlame
                    ? "bg-[#EFCC80]"
                    : "bg-[#C69843]"
                }`}
                style={{
                  animation: "shrink 8s linear forwards",
                }}
              />
            </div>

            <div className="flex items-start gap-3">
              {/* Status Animated Icon */}
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  isReady
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 animate-bounce-subtle"
                    : isFlame
                    ? "bg-[#EFCC80]/20 border border-[#EFCC80]/40 text-[#EFCC80] animate-pulse"
                    : isCheck
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                    : "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04]"
                }`}
              >
                {isReady ? (
                  <Pizza className="w-6 h-6" />
                ) : isFlame ? (
                  <Flame className="w-6 h-6 animate-pulse" />
                ) : isCheck ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>

              {/* Toast Text Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0c0e12] border border-[#222934] text-[#EFCC80] font-outfit">
                      {toast.orderNumber}
                    </span>
                    <span className="text-[10px] text-stone-300 font-bold">
                      {language === "ar" ? "تحديث مباشر" : "Live Update"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Sound mute toggle button */}
                    <button
                      type="button"
                      onClick={toggleSound}
                      title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                      className="text-stone-400 hover:text-[#EFCC80] p-1 rounded-md transition-colors"
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-3.5 h-3.5 text-[#EFCC80]" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                      )}
                    </button>

                    {/* Close button */}
                    <button
                      type="button"
                      onClick={() => removeToast(toast.id)}
                      className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
                      aria-label="Dismiss toast"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-black font-cairo text-white">
                  {language === "ar" ? toast.titleAr : toast.titleEn}
                </h4>

                <p className="text-xs text-stone-300 leading-snug">
                  {language === "ar" ? toast.messageAr : toast.messageEn}
                </p>

                {/* Direct Action Link */}
                <div className="pt-2 flex items-center justify-between">
                  <Link
                    href={
                      toast.trackingToken
                        ? `/track/${toast.orderNumber}?token=${toast.trackingToken}`
                        : `/track/${toast.orderNumber}`
                    }
                    onClick={() => removeToast(toast.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 shadow-md shadow-[#EFCC80]/20 transition-all active:scale-95"
                  >
                    <span>{language === "ar" ? "تتبع مباشر في الفرن" : "View Live Oven Tracker"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <span className="text-[10px] text-stone-400 font-outfit">
                    {language === "ar" ? "الآن" : "Just now"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
