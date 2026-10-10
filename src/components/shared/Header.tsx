"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ShoppingBag,
  Moon,
  Sun,
  Globe,
  Menu as MenuIcon,
  X,
  Clock,
  MapPin,
  Pizza,
  Flame,
  ChefHat,
  ShieldCheck,
  Info,
  Bell,
  Search,
  PhoneCall,
  ChevronDown,
  LayoutGrid,
  User,
  Heart,
  History,
  Truck,
  MessageSquare,
  Instagram,
  Navigation,
} from "lucide-react";
import { calculateRestaurantStatus, getYemenNow } from "@/lib/businessHours";
import RecurringReminderModal from "@/components/customer/RecurringReminderModal";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    cartCount,
    setIsCartOpen,
    dict,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [opStatus, setOpStatus] = useState(() => calculateRestaurantStatus({ now: getYemenNow() }));
  const pathname = usePathname();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setOpStatus(calculateRestaurantStatus({ now: getYemenNow() }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/menu");
    }
  };

  const navLinks: Array<{ href: string; label: string; badge?: string }> = [
    { href: "/", label: dict.nav.home },
    { href: "/menu", label: dict.nav.menu },
    { href: "/offers", label: dict.nav.offers, badge: language === "ar" ? "جديد" : language === "id" ? "Baru" : "New" },
    { href: "/#reviews", label: language === "ar" ? "التقييمات" : language === "id" ? "Ulasan" : "Reviews" },
    { href: "/#branches", label: dict.nav.branches },
    { href: "/#about", label: dict.nav.about },
    { href: "/admin", label: dict.nav.admin },
  ];

  const quickCategories = [
    { nameAr: "البيتزا الإيطالية", nameEn: "Specialty Pizzas", nameId: "Pizza Spesial", slug: "pizzas" },
    { nameAr: "الفطائر والمعجنات", nameEn: "Fatayer & Pies", nameId: "Fatayer & Kue Pastry", slug: "fatayer" },
    { nameAr: "المقبلات والإضافات", nameEn: "Appetizers & Sides", nameId: "Hidangan Pembuka & Sampingan", slug: "sides" },
    { nameAr: "الحلويات", nameEn: "Desserts", nameId: "Hidangan Penutup", slug: "desserts" },
    { nameAr: "المشروبات المنعشة", nameEn: "Beverages", nameId: "Minuman Segar", slug: "drinks" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#08090d]/90 text-white backdrop-blur-2xl border-b border-amber-500/15 transition-colors shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
      {/* Top micro bar for branch details & hours */}
      <div className="bg-[#050608]/95 text-stone-400 text-xs py-1.5 px-4 hidden md:block border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#ff8c00]" />
              <span className="text-stone-300">{dict.brand.masaken} ({dict.brand.landmarks})</span>
            </span>
            <span className="text-stone-700">|</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>4:00 م - 11:30 م (فترة المساء)</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <span
              title={language === "ar" ? opStatus.descriptionAr : opStatus.descriptionEn}
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                opStatus.status === "OPEN_FOR_ORDERING"
                  ? "text-emerald-400"
                  : opStatus.status === "CLOSING_SOON"
                  ? "text-amber-300"
                  : opStatus.status === "SCHEDULED_ONLY"
                  ? "text-sky-300"
                  : "text-red-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  opStatus.status === "OPEN_FOR_ORDERING"
                    ? "bg-emerald-400 animate-pulse"
                    : opStatus.status === "CLOSING_SOON"
                    ? "bg-amber-400 animate-ping"
                    : opStatus.status === "SCHEDULED_ONLY"
                    ? "bg-sky-400"
                    : "bg-red-400"
                }`}
              />
              <span>{language === "ar" ? opStatus.badgeLabelAr : opStatus.badgeLabelEn}</span>
            </span>
            <span>{dict.brand.phones}</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#ff8c00] via-[#ea580c] to-[#dc2626] flex items-center justify-center text-white shadow-lg shadow-[#ff8c00]/30 group-hover:scale-105 transition-transform border border-amber-300/30">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-100 fill-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-2xl font-black text-white font-cairo">
                  {language === "ar" ? "بيتزا هاوس" : "Pizza House"}
                </span>
                <span className="text-[10px] bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] px-1.5 py-0.5 rounded-full font-bold font-cairo">
                  {language === "ar" ? "المكلا" : "Mukalla"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-200/60 hidden sm:block font-cairo">
                {language === "ar" ? "الحرفية الإيطالية الفاخرة على الحجر" : "Artisanal Stone-Baked Luxury Pizza"}
              </p>
            </div>
          </Link>

          {/* Central Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "ابحث عن البيتزا المفضلة (ترافل، ببروني، مارغريتا، بوراتا...)"
                    : "Search artisanal pizzas (Truffle, Pepperoni, Burrata...)"
                }
                className="w-full pl-10 pr-10 py-2.5 bg-[#11131a]/90 border border-amber-500/20 rounded-full text-xs sm:text-sm text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff8c00]/40 focus:border-[#ff8c00] transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#ff8c00] transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Order Now Button */}
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(198,152,67,0.35)] active:scale-95 transition-all font-cairo"
            >
              <Pizza className="w-4 h-4 text-[#2C1A04]" />
              <span className="hidden xs:inline">{language === "ar" ? "اطلب الآن" : "Order Now"}</span>
            </Link>

            {/* Quick Call on mobile */}
            <a
              href="tel:05375561"
              className="p-2 sm:hidden rounded-full bg-[#141720] border border-white/10 text-[#EFCC80] hover:bg-[#1a202c] transition-colors"
              title="اتصال فوري"
              aria-label="Call"
            >
              <PhoneCall className="w-4 h-4" />
            </a>

            {/* Orange Pill Button: "سجل طلباتي" (Desktop only) */}
            <Link
              href="/history"
              className="hidden lg:inline-flex items-center gap-1.5 bg-[#141720] hover:bg-[#1c212d] border border-white/10 hover:border-amber-500/30 text-stone-300 px-3 py-2 rounded-full text-xs font-semibold active:scale-95 transition-all"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "ar" ? "سجل طلباتي" : language === "id" ? "Pesanan Saya" : "My Orders"}</span>
            </Link>

            {/* Recurring Order Reminders Bell (Desktop only) */}
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="hidden md:flex p-2.5 rounded-full bg-[#141720] border border-white/10 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 relative transition-colors"
              title={
                language === "ar"
                  ? "تنبيهات الوجبة المفضلة (كل أسبوعين)"
                  : language === "id"
                  ? "Pengingat Menu Favorit (Tiap 2 Minggu)"
                  : "Favorite Meal Reminders (2 Weeks)"
              }
              aria-label="Recurring Order Reminders"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-[#ff8c00] animate-pulse shadow-[0_0_8px_rgba(255,140,0,0.8)]" />
            </button>

            {/* Cart Trigger with Circular Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 sm:p-2.5 rounded-full bg-[#141720] border border-white/10 hover:border-amber-500/40 text-stone-200 hover:text-white transition-all cursor-pointer"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#ff8c00]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-gradient-to-r from-[#ff8c00] to-[#dc2626] text-white text-[11px] font-black flex items-center justify-center font-outfit shadow-md shadow-orange-950/60">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Global Language Toggle (Desktop only) */}
            <div
              className="hidden md:flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-full border border-stone-200/80 dark:border-stone-700/80"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  language === "ar"
                    ? "bg-white dark:bg-stone-900 text-pizza-600 shadow-xs font-black"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="العربية"
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded-full text-xs font-bold font-outfit transition-all ${
                  language === "en"
                    ? "bg-white dark:bg-stone-900 text-pizza-600 shadow-xs font-black"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`px-2 py-1 rounded-full text-xs font-bold font-outfit transition-all ${
                  language === "id"
                    ? "bg-white dark:bg-stone-900 text-pizza-600 shadow-xs font-black"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
                title="Bahasa Indonesia"
              >
                ID
              </button>
            </div>

            {/* Dark / Light Mode Toggle (Desktop only) */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              title="تبديل المظهر"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-white bg-[#141720] border border-amber-500/25 hover:border-amber-500/50 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Open Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#EFCC80]" />
              ) : (
                <MenuIcon className="w-5 h-5 text-[#EFCC80]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Nav Bar */}
      <div className="border-t border-amber-500/10 bg-[#07090d]/90 text-stone-300 hidden md:block backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs">
          {/* Right Navigation & Category Dropdown */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Categories Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-stone-200 hover:text-white hover:bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#ff8c00]" />
                <span>{language === "ar" ? "قائمة الأقسام (الفئات)" : language === "id" ? "Kategori Menu" : "Categories"}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isCategoryMenuOpen && (
                <div
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  className="absolute top-full start-0 mt-1 w-56 bg-[#11141c]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/20 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {quickCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/menu?category=${cat.slug}`}
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold text-stone-300 hover:bg-[#ff8c00]/15 hover:text-[#ff8c00] transition-colors"
                    >
                      {language === "ar" ? cat.nameAr : language === "id" ? cat.nameId : cat.nameEn}
                    </Link>
                  ))}
                  <div className="border-t border-white/10 my-1" />
                  <Link
                    href="/menu"
                    onClick={() => setIsCategoryMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-[#ff8c00] hover:underline"
                  >
                    {language === "ar" ? "عرض كامل القائمة ←" : language === "id" ? "Lihat Semua Menu →" : "View All Menu →"}
                  </Link>
                </div>
              )}
            </div>

            <span className="text-stone-300 dark:text-stone-700">|</span>

            {/* Standard Nav Links */}
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-sm shadow-amber-950/40"
                      : "text-stone-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-amber-500/20"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-outfit ${
                        isActive
                          ? "bg-[#2C1A04] text-[#EFCC80]"
                          : "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04]"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Left: Support Phone Line (Matches Reference: پشتیبانی: ۰۲۱۸۸۲۳...) */}
          <div className="flex items-center gap-2 text-stone-300">
            <a
              href="tel:05375561"
              className="flex items-center gap-1.5 hover:text-[#EFCC80] transition-colors font-semibold font-outfit"
            >
              <span>{language === "ar" ? "خدمة العملاء: 05375561" : language === "id" ? "Layanan Pelanggan: 05375561" : "Support: 05375561"}</span>
              <PhoneCall className="w-3.5 h-3.5 text-[#C69843]" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-amber-500/20 bg-[#090b10]/98 backdrop-blur-2xl px-4 pt-4 pb-8 space-y-4 shadow-2xl max-h-[calc(100dvh-65px)] overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-2 duration-200 font-cairo">
          {/* 1. Mobile Quick Search */}
          <form
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setIsMobileMenuOpen(false);
            }}
            className="relative w-full"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "ar"
                  ? "ابحث عن البيتزا أو الوجبة المفضلة..."
                  : language === "id"
                  ? "Cari pizza, fatayer, hidangan..."
                  : "Search pizzas, fatayer, sides..."
              }
              className="w-full pl-10 pr-10 py-2.5 bg-[#141822] border border-amber-500/25 rounded-2xl text-xs sm:text-sm text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff8c00]/50 focus:border-[#ff8c00] transition-all font-cairo shadow-inner"
            />
            <button
              type="submit"
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-[#EFCC80] transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute start-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* 2. Real-time Branch Status & Quick Contacts */}
          <div className="p-3.5 bg-gradient-to-b from-[#141822] to-[#0e1118] rounded-2xl border border-amber-500/20 text-xs space-y-2.5 shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Clock className="w-4 h-4 text-[#C69843]" />
                <span>{language === "ar" ? "حالة الفرع الآن:" : language === "id" ? "Status Cabang Saat Ini:" : "Branch Status:"}</span>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  opStatus.status === "OPEN_FOR_ORDERING"
                    ? "text-emerald-300 bg-emerald-950/80 border border-emerald-500/30"
                    : opStatus.status === "CLOSING_SOON"
                    ? "text-amber-300 bg-amber-950/80 border border-amber-500/30"
                    : opStatus.status === "SCHEDULED_ONLY"
                    ? "text-sky-300 bg-sky-950/80 border border-sky-500/30"
                    : "text-red-300 bg-red-950/80 border border-red-500/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    opStatus.status === "OPEN_FOR_ORDERING"
                      ? "bg-emerald-400 animate-pulse"
                      : opStatus.status === "CLOSING_SOON"
                      ? "bg-amber-400 animate-ping"
                      : opStatus.status === "SCHEDULED_ONLY"
                      ? "bg-sky-400"
                      : "bg-red-400"
                  }`}
                />
                {language === "ar" ? opStatus.badgeLabelAr : language === "id" ? opStatus.badgeLabelId : opStatus.badgeLabelEn}
              </span>
            </div>

            <p className="text-[11px] text-stone-300">
              {language === "ar" ? opStatus.descriptionAr : language === "id" ? opStatus.descriptionId : opStatus.descriptionEn}
            </p>

            {/* Quick 1-tap Calling & WhatsApp Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
              <a
                href="tel:05375561"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#1a202c] hover:bg-[#222a3a] border border-amber-500/30 text-[#EFCC80] font-bold text-xs active:scale-95 transition-all font-outfit"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#C69843]" />
                <span>05375561</span>
              </a>
              <a
                href="https://wa.me/967772207788"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-bold text-xs active:scale-95 transition-all font-outfit"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>772207788</span>
              </a>
            </div>
          </div>

          {/* 3. Core Primary Actions (2x2 Grid) */}
          <div>
            <div className="text-[11px] font-bold text-stone-400 mb-1.5 px-1 font-cairo">
              {language === "ar" ? "الوصول السريع" : language === "id" ? "Akses Cepat" : "Quick Actions"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-1.5 active:scale-95 ${
                  pathname === "/menu"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] border-[#EFCC80] shadow-md shadow-amber-950/40"
                    : "bg-[#141822] text-stone-200 border-white/10 hover:border-amber-500/30 hover:bg-[#1a202c]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Pizza className={`w-5 h-5 ${pathname === "/menu" ? "text-[#2C1A04]" : "text-[#EFCC80]"}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-cairo ${
                    pathname === "/menu" ? "bg-[#2C1A04] text-[#EFCC80]" : "bg-amber-500/20 text-[#EFCC80]"
                  }`}>
                    {language === "ar" ? "المنيو" : language === "id" ? "Menu" : "Menu"}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs font-cairo">
                    {language === "ar" ? "قائمة الطعام" : language === "id" ? "Daftar Menu" : "Food Menu"}
                  </div>
                  <div className={`text-[10px] ${pathname === "/menu" ? "text-[#2C1A04]/80" : "text-stone-400"} font-cairo`}>
                    {language === "ar" ? "تصفح كل الوجبات" : language === "id" ? "Jelajahi semua hidangan" : "Browse all items"}
                  </div>
                </div>
              </Link>

              <Link
                href="/history"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-1.5 active:scale-95 ${
                  pathname === "/history"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] border-[#EFCC80] shadow-md shadow-amber-950/40"
                    : "bg-[#141822] text-stone-200 border-white/10 hover:border-amber-500/30 hover:bg-[#1a202c]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <History className={`w-5 h-5 ${pathname === "/history" ? "text-[#2C1A04]" : "text-[#EFCC80]"}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-cairo ${
                    pathname === "/history" ? "bg-[#2C1A04] text-[#EFCC80]" : "bg-amber-500/20 text-[#EFCC80]"
                  }`}>
                    {language === "ar" ? "طلباتي" : language === "id" ? "Pesanan" : "Orders"}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs font-cairo">
                    {language === "ar" ? "سجل طلباتي" : language === "id" ? "Riwayat Pesanan" : "Order History"}
                  </div>
                  <div className={`text-[10px] ${pathname === "/history" ? "text-[#2C1A04]/80" : "text-stone-400"} font-cairo`}>
                    {language === "ar" ? "الطلبات السابقة" : language === "id" ? "Pesanan sebelumnya" : "Previous orders"}
                  </div>
                </div>
              </Link>

              <Link
                href="/track"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-1.5 active:scale-95 ${
                  pathname.startsWith("/track")
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] border-[#EFCC80] shadow-md shadow-amber-950/40"
                    : "bg-[#141822] text-stone-200 border-white/10 hover:border-amber-500/30 hover:bg-[#1a202c]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Truck className={`w-5 h-5 ${pathname.startsWith("/track") ? "text-[#2C1A04]" : "text-[#EFCC80]"}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-cairo ${
                    pathname.startsWith("/track") ? "bg-[#2C1A04] text-[#EFCC80]" : "bg-amber-500/20 text-[#EFCC80]"
                  }`}>
                    {language === "ar" ? "تتبع" : language === "id" ? "Lacak" : "Track"}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs font-cairo">
                    {language === "ar" ? "تتبع طلبك" : language === "id" ? "Lacak Pesanan" : "Track Order"}
                  </div>
                  <div className={`text-[10px] ${pathname.startsWith("/track") ? "text-[#2C1A04]/80" : "text-stone-400"} font-cairo`}>
                    {language === "ar" ? "متابعة مسار التوصيل" : language === "id" ? "Pantau status pesanan" : "Live delivery status"}
                  </div>
                </div>
              </Link>

              <Link
                href="/kitchen"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-1.5 active:scale-95 ${
                  pathname === "/kitchen"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] border-[#EFCC80] shadow-md shadow-amber-950/40"
                    : "bg-[#141822] text-stone-200 border-white/10 hover:border-amber-500/30 hover:bg-[#1a202c]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <ChefHat className={`w-5 h-5 ${pathname === "/kitchen" ? "text-[#2C1A04]" : "text-[#EFCC80]"}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-outfit ${
                    pathname === "/kitchen" ? "bg-[#2C1A04] text-[#EFCC80]" : "bg-amber-500/20 text-[#EFCC80]"
                  }`}>
                    KDS
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs font-cairo">
                    {language === "ar" ? "شاشة المطبخ" : language === "id" ? "Layar Dapur" : "Kitchen Display"}
                  </div>
                  <div className={`text-[10px] ${pathname === "/kitchen" ? "text-[#2C1A04]/80" : "text-stone-400"} font-cairo`}>
                    {language === "ar" ? "نظام KDS الحي" : language === "id" ? "Sistem KDS Langsung" : "Live orders screen"}
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* 4. Quick Categories Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 px-1 font-cairo">
              <span className="flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5 text-[#C69843]" />
                <span>{language === "ar" ? "أقسام القائمة السريعة" : language === "id" ? "Kategori Menu Cepat" : "Menu Categories"}</span>
              </span>
              <Link
                href="/menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#EFCC80] hover:underline"
              >
                {language === "ar" ? "عرض الكل ←" : language === "id" ? "Lihat semua →" : "View all →"}
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/menu?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1f2536] border border-white/5 hover:border-amber-500/30 text-stone-300 hover:text-[#EFCC80] text-xs font-semibold active:scale-95 transition-all font-cairo"
                >
                  {language === "ar" ? cat.nameAr : language === "id" ? cat.nameId : cat.nameEn}
                </Link>
              ))}
            </div>
          </div>

          {/* 5. Additional Navigation Links */}
          <div className="p-2 bg-[#141822]/80 rounded-2xl border border-white/5 space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                pathname === "/"
                  ? "bg-amber-500/15 text-[#EFCC80] border border-amber-500/30"
                  : "text-stone-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{dict.nav.home}</span>
              <span className="text-[10px] text-stone-500">🏠</span>
            </Link>
            <Link
              href="/#branches"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <span>{dict.nav.branches}</span>
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
            </Link>
            <Link
              href="/#about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <span>{dict.nav.about}</span>
              <Info className="w-3.5 h-3.5 text-stone-400" />
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                pathname === "/admin"
                  ? "bg-amber-500/15 text-[#EFCC80] border border-amber-500/30"
                  : "text-stone-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C69843]" />
                <span>{dict.nav.admin}</span>
              </span>
              <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-bold font-cairo">
                {language === "ar" ? "لوحة التحكم" : language === "id" ? "Panel Admin" : "Admin Panel"}
              </span>
            </Link>
          </div>

          {/* 6. Recurring Reminders Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsReminderModalOpen(true);
            }}
            className="w-full p-3 rounded-2xl bg-[#141822] border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-between hover:bg-[#1a202c] active:scale-95 transition-all shadow-sm font-cairo"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C69843] animate-bounce" />
              <span>
                {language === "ar"
                  ? "تنبيهات الوجبة المفضلة (كل أسبوعين)"
                  : language === "id"
                  ? "Pengingat Menu Favorit (Tiap 2 Minggu)"
                  : "Meal Reminders (Every 2 Weeks)"}
              </span>
            </span>
            <span className="text-[10px] bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] px-2.5 py-1 rounded-full font-bold">
              {language === "ar" ? "ضبط التنبيه" : language === "id" ? "Atur" : "Configure"}
            </span>
          </button>

          {/* 7. Interface Preferences: Language & Theme */}
          <div className="p-3 bg-[#141822] rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5 font-cairo">
                <Globe className="w-3.5 h-3.5 text-[#C69843]" />
                <span>{language === "ar" ? "لغة التطبيق والمظهر" : language === "id" ? "Bahasa & Tema Tampilan" : "Language & Theme"}</span>
              </span>
            </div>

            {/* Three Languages Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 transition-all ${
                  language === "ar"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] border-[#EFCC80] font-black shadow-md shadow-amber-950/40"
                    : "bg-[#0c0e12] text-stone-300 border-white/10 hover:text-white"
                }`}
              >
                <span>🇾🇪 العربية</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 transition-all font-outfit ${
                  language === "en"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] border-[#EFCC80] font-black shadow-md shadow-amber-950/40"
                    : "bg-[#0c0e12] text-stone-300 border-white/10 hover:text-white"
                }`}
              >
                <span>🇬🇧 English</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 transition-all font-outfit ${
                  language === "id"
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] border-[#EFCC80] font-black shadow-md shadow-amber-950/40"
                    : "bg-[#0c0e12] text-stone-300 border-white/10 hover:text-white"
                }`}
              >
                <span>🇮🇩 Indonesia</span>
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full py-2 px-3 rounded-xl border bg-[#0c0e12] text-stone-300 border-white/10 hover:text-white flex items-center justify-between text-xs font-bold transition-all font-cairo"
            >
              <span className="flex items-center gap-2">
                {theme === "light" ? (
                  <Moon className="w-4 h-4 text-stone-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {language === "ar"
                    ? "مظهر الواجهة:"
                    : language === "id"
                    ? "Tema Tampilan:"
                    : "Theme Mode:"}
                </span>
              </span>
              <span className="text-amber-300">
                {theme === "light"
                  ? language === "ar"
                    ? "فاتح (Light)"
                    : language === "id"
                    ? "Terang (Light)"
                    : "Light"
                  : language === "ar"
                  ? "داكن (Dark)"
                  : language === "id"
                  ? "Gelap (Dark)"
                  : "Dark"}
              </span>
            </button>
          </div>

          {/* 8. Mobile Quick Shortcuts: Google Maps & Instagram */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://maps.app.goo.gl/zre73sxKGyM27KvE6"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#141822] hover:bg-[#1a202c] text-stone-300 hover:text-[#EFCC80] text-xs font-semibold border border-white/10 active:scale-95 transition-all font-cairo"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C69843]" />
              <span>{language === "ar" ? "خرائط Google" : language === "id" ? "Google Maps" : "Google Maps"}</span>
            </a>
            <a
              href="https://www.instagram.com/pizza_house66/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#141822] hover:bg-[#1a202c] text-stone-300 hover:text-rose-400 text-xs font-semibold border border-white/10 active:scale-95 transition-all font-outfit"
            >
              <span className="text-rose-400">📸</span>
              <span>@pizza_house66</span>
            </a>
          </div>

          {/* 9. Branch Location & Official Operating Hours */}
          <div className="p-3 rounded-2xl bg-[#0e1118] border border-white/5 text-[11px] text-stone-400 space-y-1.5 font-cairo">
            <p className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C69843] shrink-0 mt-0.5" />
              <span>{dict.brand.masaken} ({dict.brand.landmarks})</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{language === "ar" ? "4:00 م - 11:30 م (فترة المساء)" : language === "id" ? "16:00 - 23:30 (Sesi Sore)" : "4:00 PM - 11:30 PM (Evening Shift)"}</span>
            </p>
          </div>
        </div>
      )}

      {/* Recurring Order Reminder Configuration Modal */}
      <RecurringReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />
    </header>
  );
}
