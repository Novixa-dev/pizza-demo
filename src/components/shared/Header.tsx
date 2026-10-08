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

  const navLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/menu", label: dict.nav.menu },
    { href: "/history", label: dict.nav.orderHistory },
    { href: "/track", label: dict.nav.trackOrder },
    { href: "/#branches", label: dict.nav.branches },
    { href: "/#about", label: dict.nav.about },
    { href: "/kitchen", label: dict.nav.kitchen, badge: "KDS" },
    { href: "/admin", label: dict.nav.admin },
  ];

  const quickCategories = [
    { nameAr: "البيتزا الإيطالية", nameEn: "Specialty Pizzas", slug: "pizzas" },
    { nameAr: "الفطائر والمعجنات", nameEn: "Fatayer & Pies", slug: "fatayer" },
    { nameAr: "المقبلات والإضافات", nameEn: "Appetizers & Sides", slug: "sides" },
    { nameAr: "الحلويات", nameEn: "Desserts", slug: "desserts" },
    { nameAr: "المشروبات المنعشة", nameEn: "Beverages", slug: "drinks" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0e1217]/95 text-white backdrop-blur-md border-b border-[#1f2632] transition-colors shadow-sm">
      {/* Top micro bar for branch details & hours */}
      <div className="bg-[#080a0e] text-stone-300 text-xs py-1.5 px-4 hidden md:block border-b border-[#161b24]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#e45a38]" />
              <span>{dict.brand.masaken} ({dict.brand.landmarks})</span>
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

      {/* Main Bar (Matches Reference: Logo on Right, Search in Middle, Actions on Left) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#e45a38] via-pizza-600 to-[#b8381c] flex items-center justify-center text-white shadow-md shadow-[#e45a38]/25 group-hover:scale-105 transition-transform">
              <Pizza className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-cairo">
                  {dict.brand.name}
                </span>
                <span className="text-xs bg-[#e45a38]/20 text-[#e45a38] border border-[#e45a38]/30 px-1.5 py-0.5 rounded-full font-bold font-outfit">
                  66
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 hidden sm:block">
                {language === "ar" ? "بيتزا إيطالية فاخرة مخبوزة على الحجر" : "Artisanal Stone-Baked Italian Pizza"}
              </p>
            </div>
          </Link>

          {/* Central Search Bar (Matches Reference Image) */}
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
                    ? "ابحث عن البيتزا المفضلة (ببروني، رانش، سوبريم...)"
                    : "Search pizzas (Pepperoni, Ranch, Supreme...)"
                }
                className="w-full pl-10 pr-10 py-2.5 bg-[#141820] border border-[#242c38] rounded-full text-xs sm:text-sm text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#e45a38]/50 focus:border-[#e45a38] transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#e45a38] transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Actions & Utilities (Matches Reference: Orange Pill Button, Wishlist/Bell, Cart) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Orange Pill Button: "سجل طلباتي" */}
            <Link
              href="/history"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#e45a38] hover:bg-[#d04a2c] text-white px-4 py-2 rounded-full text-xs font-bold shadow-md shadow-orange-950/40 active:scale-95 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "سجل طلباتي" : "My Orders"}</span>
            </Link>

            {/* Recurring Order Reminders / Wishlist Bell */}
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="p-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-pizza-600 hover:bg-stone-50 dark:hover:bg-stone-800 relative transition-colors"
              title={
                language === "ar"
                  ? "تنبيهات الوجبة المفضلة (كل أسبوعين)"
                  : "Favorite Meal Reminders (2 Weeks)"
              }
              aria-label="Recurring Order Reminders"
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-pizza-600 animate-pulse" />
            </button>

            {/* Cart Trigger with Circular Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2.5 rounded-full border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-all"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-pizza-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-pizza-600 text-white text-[11px] font-black flex items-center justify-center font-outfit shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Global Language Toggle */}
            <div
              className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-full border border-stone-200/80 dark:border-stone-700/80"
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
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              title="تبديل المظهر"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
              aria-label="Open Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Nav Bar (Matches Reference: Categories + Links on Right, Phone Support on Left) */}
      <div className="border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs">
          {/* Right Navigation & Category Dropdown */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Categories Dropdown Button (دسته‌بندی‌ها) */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-pizza-600" />
                <span>{language === "ar" ? "دسته‌بندی‌ها (الفئات)" : "Categories"}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isCategoryMenuOpen && (
                <div
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  className="absolute top-full start-0 mt-1 w-52 bg-white dark:bg-stone-850 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {quickCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/menu?category=${cat.slug}`}
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-pizza-50 dark:hover:bg-pizza-950/40 hover:text-pizza-600"
                    >
                      {language === "ar" ? cat.nameAr : cat.nameEn}
                    </Link>
                  ))}
                  <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                  <Link
                    href="/menu"
                    onClick={() => setIsCategoryMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-pizza-600 hover:underline"
                  >
                    {language === "ar" ? "عرض كامل القائمة ←" : "View All Menu →"}
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
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "text-pizza-600 dark:text-pizza-400 font-bold bg-pizza-50 dark:bg-pizza-950/50"
                      : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] font-bold bg-crust-500 text-stone-950 px-1.5 py-0.2 rounded font-outfit">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Left: Support Phone Line (Matches Reference: پشتیبانی: ۰۲۱۸۸۲۳...) */}
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <a
              href="tel:05375561"
              className="flex items-center gap-1.5 hover:text-pizza-600 transition-colors font-medium font-outfit"
            >
              <span>{language === "ar" ? "خدمة العملاء: 05375561" : "Support: 05375561"}</span>
              <PhoneCall className="w-3.5 h-3.5 text-pizza-600" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 pt-3 pb-5 space-y-2">
          {/* Mobile Language Switcher Row */}
          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-pizza-600" />
                <span>{language === "ar" ? "لغة الواجهة" : "Interface Language"}</span>
              </span>
              <span className="text-[11px] text-stone-400 font-bold uppercase font-outfit">
                {language === "ar" ? "العربية (RTL)" : "English (LTR)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  language === "ar"
                    ? "bg-pizza-700 text-white border-pizza-700 shadow-xs font-black"
                    : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                }`}
              >
                <span>🇾🇪 العربية</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all font-outfit ${
                  language === "en"
                    ? "bg-pizza-700 text-white border-pizza-700 shadow-xs font-black"
                    : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>
          </div>

          {/* Real-time Branch Status in Mobile Drawer */}
          <div className="p-3 mb-2 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 dark:text-white">
                {language === "ar" ? "حالة الفرع الآن:" : "Branch Status:"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                  opStatus.status === "OPEN_FOR_ORDERING"
                    ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : opStatus.status === "CLOSING_SOON"
                    ? "text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300"
                    : opStatus.status === "SCHEDULED_ONLY"
                    ? "text-sky-700 bg-sky-100 dark:bg-sky-950/80 dark:text-sky-300"
                    : "text-red-700 bg-red-100 dark:bg-red-950/80 dark:text-red-300"
                }`}
              >
                {language === "ar" ? opStatus.badgeLabelAr : opStatus.badgeLabelEn}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {language === "ar" ? opStatus.descriptionAr : opStatus.descriptionEn}
            </p>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-bold text-stone-800 dark:text-stone-200 hover:bg-pizza-50 dark:hover:bg-stone-800"
            >
              <div className="flex items-center justify-between">
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-xs bg-crust-500 text-stone-950 font-bold px-2 py-0.5 rounded font-outfit">
                    {link.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}

          {/* Mobile Recurring Reminders Button */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsReminderModalOpen(true);
            }}
            className="w-full mt-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-pizza-600" />
              <span>
                {language === "ar"
                  ? "تنبيهات الوجبة المفضلة (كل أسبوعين)"
                  : "Meal Reminders (2 Weeks)"}
              </span>
            </span>
            <span className="text-[10px] bg-pizza-600 text-white px-2 py-0.5 rounded-full font-bold">
              {language === "ar" ? "ضبط" : "Setup"}
            </span>
          </button>

          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 space-y-1">
            <p className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pizza-600" />
              <span>{dict.brand.masaken}</span>
            </p>
            <p className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-crust-500" />
              <span>8:00 ص - 12:00 م | 4:00 م - 11:30 م</span>
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
