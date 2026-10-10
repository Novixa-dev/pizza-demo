import { BusinessHourRecord } from "./scheduler";

export type RestaurantOperationalStatus =
  | "OPEN_FOR_ORDERING"
  | "CLOSING_SOON"
  | "SCHEDULED_ONLY"
  | "TEMPORARILY_PAUSED"
  | "CLOSED";

export interface RestaurantStatusResult {
  status: RestaurantOperationalStatus;
  isOpen: boolean;
  canOrderImmediate: boolean;
  canOrderScheduled: boolean;
  badgeLabelAr: string;
  badgeLabelEn: string;
  badgeLabelId: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionId: string;
  nextShiftOpensAt?: string;
  activeShiftName?: string;
  cutoffTime?: string;
}

/**
 * Returns current Date & Time in Yemen timezone (Asia/Aden, UTC+3).
 */
export function getYemenNow(): Date {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Aden",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const dateMap: Record<string, string> = {};
    parts.forEach((p) => {
      dateMap[p.type] = p.value;
    });

    return new Date(
      `${dateMap.year}-${dateMap.month}-${dateMap.day}T${dateMap.hour}:${dateMap.minute}:${dateMap.second}`
    );
  } catch {
    // Fallback: manually offset UTC by +3 hours
    const d = new Date();
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 3);
  }
}

/**
 * Parses time string (e.g. "08:00" or "23:30") into decimal minutes from midnight.
 */
function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Formats time from decimal minutes to 12-hour display string.
 */
function formatMinutesTo12h(minutes: number, lang: "ar" | "en" | "id" = "ar"): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const periodAr = h24 >= 12 ? "م" : "ص";
  const periodEn = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  const mm = String(m).padStart(2, "0");

  if (lang === "id") {
    return `${String(h24).padStart(2, "0")}:${mm}`;
  }
  return lang === "ar" ? `${h12}:${mm} ${periodAr}` : `${h12}:${mm} ${periodEn}`;
}

/**
 * Centralized business hours and restaurant operational status evaluator.
 * Determines real-time availability based on Yemen timezone, morning/evening shifts,
 * Friday schedule, order cutoffs (30 min before closing), and management pause state.
 */
export function calculateRestaurantStatus({
  businessHours,
  isOnlineOrderingPaused = false,
  pauseMessageAr,
  pauseMessageEn,
  now = getYemenNow(),
}: {
  businessHours?: BusinessHourRecord[];
  isOnlineOrderingPaused?: boolean;
  pauseMessageAr?: string | null;
  pauseMessageEn?: string | null;
  now?: Date;
}): RestaurantStatusResult {
  // 1. Check if manually paused by management
  if (isOnlineOrderingPaused) {
    return {
      status: "TEMPORARILY_PAUSED",
      isOpen: false,
      canOrderImmediate: false,
      canOrderScheduled: false,
      badgeLabelAr: "الطلبات متوقفة مؤقتاً",
      badgeLabelEn: "Ordering Paused",
      badgeLabelId: "Pemesanan Dijeda Sementara",
      descriptionAr:
        pauseMessageAr ||
        "نعتذر! تم إيقاف استقبال الطلبات الجديدة مؤقتاً بسبب ضغط العمل في المطبخ.",
      descriptionEn:
        pauseMessageEn ||
        "Online ordering is temporarily paused due to kitchen rush. Please check back shortly.",
      descriptionId:
        "Mohon maaf! Pemesanan online dijeda sementara karena dapur sedang padat. Silakan periksa kembali sebentar lagi.",
    };
  }

  // Fallback verified schedule if DB hours not yet populated:
  // Saturday–Thursday: 08:00–12:00, 16:00–23:30
  // Friday: 16:00–23:30
  const defaultHours: BusinessHourRecord[] = [
    // Friday (5)
    { dayOfWeek: 5, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
    // Saturday (6) through Thursday (4)
    ...[0, 1, 2, 3, 4, 6].flatMap((day) => [
      { dayOfWeek: day, shiftName: "Morning", openTime: "08:00", closeTime: "12:00", isClosed: false },
      { dayOfWeek: day, shiftName: "Evening", openTime: "16:00", closeTime: "23:30", isClosed: false },
    ]),
  ];

  const activeHours = (businessHours && businessHours.length > 0) ? businessHours : defaultHours;

  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayShifts = activeHours
    .filter((h) => h.dayOfWeek === dayOfWeek && !h.isClosed)
    .sort((a, b) => toMinutes(a.openTime) - toMinutes(b.openTime));

  if (todayShifts.length === 0) {
    return {
      status: "CLOSED",
      isOpen: false,
      canOrderImmediate: false,
      canOrderScheduled: true,
      badgeLabelAr: "مغلق اليوم",
      badgeLabelEn: "Closed Today",
      badgeLabelId: "Tutup Hari Ini",
      descriptionAr: "المطعم في عطلة اليوم. يمكنك جدولة طلبك مسبقاً للأيام القادمة.",
      descriptionEn: "Restaurant is closed today. You can pre-order for upcoming days.",
      descriptionId: "Restoran libur hari ini. Anda dapat menjadwalkan pesanan untuk hari berikutnya.",
    };
  }

  // Check each shift
  for (const shift of todayShifts) {
    const openMins = toMinutes(shift.openTime);
    let closeMins = toMinutes(shift.closeTime);

    // If shift closes past midnight (e.g. 00:30), add 24 hours
    if (closeMins < openMins) {
      closeMins += 24 * 60;
    }

    const cutoffMins = closeMins - 30; // 30 minutes before closing cutoff

    // Case A: Inside Active Shift
    if (currentMinutes >= openMins && currentMinutes < closeMins) {
      // Near closing cutoff?
      if (currentMinutes >= cutoffMins) {
        return {
          status: "CLOSING_SOON",
          isOpen: true,
          canOrderImmediate: false,
          canOrderScheduled: true,
          activeShiftName: shift.shiftName,
          cutoffTime: formatMinutesTo12h(cutoffMins),
          badgeLabelAr: "يغلق قريباً",
          badgeLabelEn: "Closing Soon",
          badgeLabelId: "Segera Tutup",
          descriptionAr: `الفرع يغلق خلال نصف ساعة (${formatMinutesTo12h(closeMins, "ar")}). الطلبات الفورية متوقفة، ولكن يمكنك جدولة طلبك للفترة القادمة.`,
          descriptionEn: `Branch is closing soon (${formatMinutesTo12h(closeMins, "en")}). Immediate orders closed, but you can schedule for the next shift.`,
          descriptionId: `Cabang akan tutup dalam 30 menit (${formatMinutesTo12h(closeMins, "id")}). Pesanan langsung ditutup, silakan jadwalkan untuk sesi berikutnya.`,
        };
      }

      // Fully open for immediate & scheduled orders
      return {
        status: "OPEN_FOR_ORDERING",
        isOpen: true,
        canOrderImmediate: true,
        canOrderScheduled: true,
        activeShiftName: shift.shiftName,
        badgeLabelAr: "مفتوح الآن للطلب",
        badgeLabelEn: "Open for Ordering",
        badgeLabelId: "Buka Sekarang untuk Dipesan",
        descriptionAr: `مفتوح الآن (${shift.shiftName === "Morning" ? "الفترة الصباحية" : "الفترة المسائية"}) — يمكنك الطلب الفوري أو المجدول بدون انتظار.`,
        descriptionEn: `Open Now (${shift.shiftName} shift) — Immediate pickup & scheduled orders available without waiting.`,
        descriptionId: `Buka Sekarang (${shift.shiftName === "Morning" ? "Sesi Pagi" : "Sesi Sore"}) — Pesan langsung atau terjadwal tanpa antre.`,
      };
    }
  }

  // Case B: Between shifts or before first shift today
  // Find next shift today
  const nextShiftToday = todayShifts.find((s) => toMinutes(s.openTime) > currentMinutes);

  if (nextShiftToday) {
    const nextOpenMins = toMinutes(nextShiftToday.openTime);

    // If it's early night/morning before 07:00 AM, it's CLOSED for the night
    if (currentMinutes < 7 * 60) {
      return {
        status: "CLOSED",
        isOpen: false,
        canOrderImmediate: false,
        canOrderScheduled: true,
        nextShiftOpensAt: formatMinutesTo12h(nextOpenMins),
        badgeLabelAr: "مغلق حالياً",
        badgeLabelEn: "Currently Closed",
        badgeLabelId: "Tutup Saat Ini",
        descriptionAr: `المطعم مغلق حالياً. نفتح ${formatMinutesTo12h(nextOpenMins, "ar")} — يمكنك جدولة موعد استلامك مسبقاً.`,
        descriptionEn: `Restaurant is currently closed. Reopens at ${formatMinutesTo12h(nextOpenMins, "en")} — You can pre-schedule your pickup.`,
        descriptionId: `Restoran sedang tutup. Buka pukul ${formatMinutesTo12h(nextOpenMins, "id")} — Anda dapat menjadwalkan waktu pengambilan terlebih dahulu.`,
      };
    }

    // Between morning and evening shift (e.g. 12:00 to 16:00)
    return {
      status: "SCHEDULED_ONLY",
      isOpen: false,
      canOrderImmediate: false,
      canOrderScheduled: true,
      nextShiftOpensAt: formatMinutesTo12h(nextOpenMins),
      badgeLabelAr: "جدولة فقط (استراحة)",
      badgeLabelEn: "Scheduled Orders Only",
      badgeLabelId: "Hanya Pesanan Terjadwal (Istirahat)",
      descriptionAr: `الفرع في فترة استراحة بين الشفتين. نفتح ${formatMinutesTo12h(nextOpenMins, "ar")} — يمكنك طلب وجدول حجزك الآن!`,
      descriptionEn: `In between shifts. Reopens at ${formatMinutesTo12h(nextOpenMins, "en")} — You can pre-schedule your order now!`,
      descriptionId: `Istirahat pergantian shift. Buka pukul ${formatMinutesTo12h(nextOpenMins, "id")} — Anda dapat memesan dan menjadwalkan sekarang!`,
    };
  }

  // Case C: After all shifts today ended
  return {
    status: "CLOSED",
    isOpen: false,
    canOrderImmediate: false,
    canOrderScheduled: true,
    badgeLabelAr: "مغلق حالياً",
    badgeLabelEn: "Currently Closed",
    badgeLabelId: "Tutup Saat Ini",
    descriptionAr: "انتهت فترات العمل لهذا اليوم. نفتح غداً الساعة 8:00 صباحاً (الجمعة 4:00 عصراً). يمكنك جدولة طلبك مسبقاً.",
    descriptionEn: "Closed for today. Reopens tomorrow at 8:00 AM (Friday at 4:00 PM). Pre-orders accepted.",
    descriptionId: "Jam operasional hari ini telah selesai. Buka besok pukul 08:00 (Jumat 16:00). Pesanan terjadwal diterima.",
  };
}
