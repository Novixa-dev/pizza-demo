"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Clock,
  MapPin,
  Phone,
  Flame,
  CheckCircle2,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Pizza,
  Sparkles,
  ShoppingBag,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Truck,
  Award,
  Star,
  Utensils,
  PhoneCall,
  Heart,
  Play,
  Quote,
  Instagram,
  Timer,
  Percent,
  Tag,
  Plus,
} from "lucide-react";
import MenuCard from "@/components/customer/MenuCard";
import HeroSection from "@/components/customer/HeroSection";
import CustomizerModal, {
  CustomizerProduct,
} from "@/components/customer/CustomizerModal";
import QuickReorderHeroCard from "@/components/customer/QuickReorderHeroCard";
import { calculateRestaurantStatus, getYemenNow } from "@/lib/businessHours";

interface HomeClientViewProps {
  restaurant: any;
  featuredProducts: any[];
  latestProducts?: any[];
  categories: any[];
}

export default function HomeClientView({
  restaurant,
  featuredProducts,
  latestProducts = [],
  categories,
}: HomeClientViewProps) {
  const { language, dict } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<CustomizerProduct | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("all");

  // Deal of the day countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 14,
    minutes: 35,
    seconds: 48,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 1, hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const opStatus = calculateRestaurantStatus({
    businessHours: restaurant?.businessHours,
    isOnlineOrderingPaused: restaurant?.isOnlineOrderingPaused,
    pauseMessageAr: restaurant?.pauseMessageAr,
    pauseMessageEn: restaurant?.pauseMessageEn,
    now: getYemenNow(),
  });

  // Category fallback images
  const categoryDefaultImages: Record<string, string> = {
    pizzas: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
    fatayer: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fatayer.jpg/960px-Fatayer.jpg",
    sides: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80",
    desserts: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
    drinks: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80",
  };

  // Filter products by selected tab
  const allAvailableProducts = [...featuredProducts, ...latestProducts].filter(
    (item, index, self) => index === self.findIndex((p) => p.id === item.id)
  );

  const filteredProducts =
    activeCategoryTab === "all"
      ? allAvailableProducts
      : allAvailableProducts.filter((product) => {
          const catSlug = product.category?.slug?.toLowerCase() || "";
          if (activeCategoryTab === "pizzas") return catSlug.includes("pizza");
          if (activeCategoryTab === "fatayer") return catSlug.includes("fatayer");
          if (activeCategoryTab === "sides") return catSlug.includes("side");
          if (activeCategoryTab === "drinks") return catSlug.includes("drink");
          return true;
        });

  // Fixed signature price list for Menu Card
  const pizzaMenuCardList = [
    {
      id: "mc-1",
      nameAr: "بيتزا مارجريتا كلاسيك",
      nameEn: "Classic Margherita Pizza",
      descAr: "صلصة طماطم إيطالية غنية، جبنة موزاريلا فاخرة، ريحان طازج",
      descEn: "Rich Italian tomato sauce, premium mozzarella, fresh basil",
      price: "3,500 YER",
      img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=160&q=80",
    },
    {
      id: "mc-2",
      nameAr: "بيتزا ببروني إيطالية",
      nameEn: "Italian Pepperoni Pizza",
      descAr: "شرائح ببروني بقري مدخن، جبنة موزاريلا ذائبة، بهارات حارة خفيفة",
      descEn: "Smoked beef pepperoni slices, melted mozzarella, special spices",
      price: "4,200 YER",
      img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=160&q=80",
    },
    {
      id: "mc-3",
      nameAr: "بيتزا سوبريم فرن حجري",
      nameEn: "Stone Oven Supreme Pizza",
      descAr: "لحم مفروم، فطر طازج، فلفل ألوان، زيتون أسود، وجبنة موزاريلا",
      descEn: "Minced beef, fresh mushrooms, bell peppers, black olives, mozzarella",
      price: "4,800 YER",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=160&q=80",
    },
    {
      id: "mc-4",
      nameAr: "بيتزا تشيكن رانش بالثوم",
      nameEn: "Chicken Ranch Garlic Pizza",
      descAr: "دجاج متبل مشوي، صوص رانش فاخر، ثومية خفيفة، وأطراف محمرة",
      descEn: "Seasoned grilled chicken, gourmet ranch drizzle, garlic crust",
      price: "4,500 YER",
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=160&q=80",
    },
  ];

  const fatayerMenuCardList = [
    {
      id: "mc-5",
      nameAr: "فطيرة لحم بالجبن البلدي",
      nameEn: "Meat & Melted Cheese Fatayer",
      descAr: "لحم بقري مفروم بالبهارات الشرقية مع مزيج جبنة قشقوان وموزاريلا",
      descEn: "Spiced minced beef with melted kashkaval & mozzarella cheese",
      price: "2,500 YER",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fatayer.jpg/960px-Fatayer.jpg",
    },
    {
      id: "mc-6",
      nameAr: "فطيرة دجاج شاورما خاصة",
      nameEn: "Chicken Shawarma Fatayer",
      descAr: "دجاج متبل بخلطة الشيف مع مايونيز بالثوم ومخلل خيار مقرمش",
      descEn: "Special seasoned chicken with garlic mayo and crisp pickles",
      price: "2,200 YER",
      img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=160&q=80",
    },
    {
      id: "mc-7",
      nameAr: "أصابع الموزاريلا المقرمشة",
      nameEn: "Crispy Mozzarella Sticks",
      descAr: "5 أصابع مقرمشة محشوة بجبنة موزاريلا تمط مع صوص مارينارا",
      descEn: "5 golden breaded mozzarella sticks with tangy marinara dip",
      price: "2,000 YER",
      img: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=160&q=80",
    },
    {
      id: "mc-8",
      nameAr: "بطاطس ودجز إيطالية متبلة",
      nameEn: "Seasoned Potato Wedges",
      descAr: "بطاطس ودجز عريضة مخبوزة بأعشاب إيطالية وبارميزان ناعم",
      descEn: "Thick cut potato wedges baked with Italian herbs & parmesan",
      price: "1,500 YER",
      img: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=160&q=80",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-[#0c0e12] text-white overflow-hidden">
      {/* =========================================================================
          1. NEW ANIMATED LUXURY HERO SECTION
      ========================================================================= */}
      <HeroSection
        language={language}
        opStatus={opStatus}
        onCustomizeProduct={(prod) => setSelectedProduct(prod)}
        featuredProducts={featuredProducts}
      />

      {/* =========================================================================
          2. THREE SERVICE PILLARS STRIP (Matching Section Below Hero in Mockup)
      ========================================================================= */}
      <section id="features" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 relative z-20">
        <div className="glass-panel-luxury rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/10 hover:border-amber-500/30 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/10">
            {/* Pillar 1 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0">
              <div className="w-12 h-12 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-orange-950/40">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide uppercase font-cairo">
                  {language === "ar" ? "استلام فوري وتوصيل سريع" : "FAST DELIVERY & TAKEOUT"}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 font-cairo">
                  {language === "ar" ? "تجهيز فوري خلال 15 دقيقة بدون انتظار" : "Prepared fresh in 15 mins zero wait"}
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:px-6">
              <div className="w-12 h-12 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-orange-950/40">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide uppercase font-cairo">
                  {language === "ar" ? "فرن حجري 100% طازج" : "100% STONE-BAKED OVEN"}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 font-cairo">
                  {language === "ar" ? "عجين يومي مخبوز على الحجر الطبيعي" : "Artisanal dough baked on natural stone"}
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:px-6">
              <div className="w-12 h-12 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-orange-950/40">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide uppercase font-cairo">
                  {language === "ar" ? "دفع محلي آمن ومرن" : "SECURE LOCAL PAYMENT"}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 font-cairo">
                  {language === "ar" ? "كريمي، العمقي، البسيري، والدفع نقداً" : "Kuraimi, Amqi, Busairi & Cash"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SHOP BY COLLECTION - CIRCULAR DISHES ROW (Matches Mockup)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-cairo tracking-tight">
              {language === "ar" ? "تسوق حسب التصنيف" : "Shop By Collection"}
            </h2>
            <p className="text-xs text-stone-400">
              {language === "ar"
                ? "اختر تشكيلتك المفضلة من أصناف البيتزا والمعجنات الإيطالية"
                : "Explore our artisan categories crafted daily"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById("collection-carousel");
                if (el) el.scrollBy({ left: -200, behavior: "smooth" });
              }}
              className="w-9 h-9 rounded-full bg-[#14181f] border border-[#222934] text-stone-300 hover:text-white hover:border-stone-500 flex items-center justify-center transition-colors"
              aria-label="Previous Collection"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("collection-carousel");
                if (el) el.scrollBy({ left: 200, behavior: "smooth" });
              }}
              className="w-9 h-9 rounded-full bg-[#e45a38] text-white flex items-center justify-center hover:bg-[#d24e2e] transition-colors shadow-md shadow-orange-950/50"
              aria-label="Next Collection"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Collection Cards */}
        <div
          id="collection-carousel"
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {[
            {
              id: "col-1",
              nameAr: "بيتزا ببروني",
              nameEn: "Pepperoni Pizza",
              img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&q=80",
              slug: "pizzas",
            },
            {
              id: "col-2",
              nameAr: "بيتزا مارجريتا",
              nameEn: "Margherita Pizza",
              img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80",
              slug: "pizzas",
            },
            {
              id: "col-3",
              nameAr: "بيتزا تشيكن رانش",
              nameEn: "Chicken Ranch",
              img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80",
              slug: "pizzas",
            },
            {
              id: "col-4",
              nameAr: "بيتزا سوبريم",
              nameEn: "Supreme Pizza",
              img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80",
              slug: "pizzas",
            },
            {
              id: "col-5",
              nameAr: "فطائر ومعجنات",
              nameEn: "Pastries & Fatayer",
              img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fatayer.jpg/960px-Fatayer.jpg",
              slug: "fatayer",
            },
            {
              id: "col-6",
              nameAr: "مقبلات وأصابع",
              nameEn: "Appetizers & Sides",
              img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=300&q=80",
              slug: "sides",
            },
          ].map((col) => (
            <Link
              key={col.id}
              href={`/menu?category=${col.slug}`}
              className="group shrink-0 flex flex-col items-center gap-3 bg-[#14181f] hover:bg-[#1a202a] border border-[#222934] hover:border-[#e45a38]/80 rounded-2xl p-4 sm:p-5 transition-all duration-300 w-36 sm:w-44 text-center shadow-lg hover:-translate-y-1"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#0c0e12] border-2 border-[#2a3342] group-hover:border-[#e45a38] transition-colors p-1 shadow-md">
                <Image
                  src={col.img}
                  alt={col.nameAr}
                  fill
                  sizes="120px"
                  className="object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-stone-200 group-hover:text-[#e45a38] transition-colors font-cairo">
                {language === "ar" ? col.nameAr : col.nameEn}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. TWO SPLIT PROMOTIONAL BANNERS (Matches Mockup Side-by-Side Cards)
          "Pizza Is The Favorite Food Here" + "For The Whole Family"
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Pizza Is The Favorite Food Here */}
          <div className="relative rounded-2xl bg-[#14181f] border border-[#222934] p-6 sm:p-8 overflow-hidden group hover:border-[#e45a38]/60 transition-colors shadow-xl flex flex-col justify-between">
            <div className="relative z-10 space-y-3 max-w-[65%]">
              <span className="text-[11px] font-bold text-[#e45a38] uppercase tracking-wider font-outfit">
                {language === "ar" ? "أكثر طلباً في المكلا" : "TOP RATED SIGNATURE"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-cairo leading-snug">
                {language === "ar"
                  ? "البيتزا الإيطالية الأكثر تفضيلاً هنا"
                  : "Pizza Is The Favorite Food Here"}
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {language === "ar"
                  ? "جبن موزاريلا ذائب وأطراف مقرمشة ساخنة مخبوزة على الحجر."
                  : "Melted premium cheese, crisp stone-baked crust, and fresh toppings."}
              </p>
              <div className="pt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-[#e45a38] hover:bg-[#d24e2e] text-white px-5 py-2.5 rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-950/50 transition-all active:scale-95"
                >
                  <span>SHOP NOW</span>
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                </Link>
              </div>
            </div>

            {/* Image on Right */}
            <div className="absolute -end-6 -bottom-6 w-44 h-44 sm:w-56 sm:h-56 pointer-events-none group-hover:scale-105 transition-transform duration-500">
              <Image
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80"
                alt="Favorite Pizza"
                fill
                sizes="250px"
                className="object-cover rounded-full"
              />
            </div>
          </div>

          {/* Card 2: For The Whole Family */}
          <div className="relative rounded-2xl bg-[#14181f] border border-[#222934] p-6 sm:p-8 overflow-hidden group hover:border-[#e45a38]/60 transition-colors shadow-xl flex flex-col justify-between">
            <div className="relative z-10 space-y-3 max-w-[65%]">
              <span className="text-[11px] font-bold text-[#e45a38] uppercase tracking-wider font-outfit">
                {language === "ar" ? "وجبات التوفير العائلي" : "FAMILY COMBOS & SHARING"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-cairo leading-snug">
                {language === "ar"
                  ? "وجبات عائلية متكاملة لجميع الأحبّة"
                  : "For The Whole Family"}
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {language === "ar"
                  ? "عروض التوفير الكبرى على أحجام البيتزا الكبيرة مع المقبلات والمشروبات."
                  : "Perfect family size portions with appetizers and refreshing drinks."}
              </p>
              <div className="pt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-[#e45a38] hover:bg-[#d24e2e] text-white px-5 py-2.5 rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-950/50 transition-all active:scale-95"
                >
                  <span>SHOP NOW</span>
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                </Link>
              </div>
            </div>

            {/* Image on Right */}
            <div className="absolute -end-6 -bottom-6 w-44 h-44 sm:w-56 sm:h-56 pointer-events-none group-hover:scale-105 transition-transform duration-500">
              <Image
                src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&q=80"
                alt="Family Pizza"
                fill
                sizes="250px"
                className="object-cover rounded-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SHOP BY COLLECTION - PRODUCT GRID WITH TABS (Matches Mockup 8-Cards)
      ========================================================================= */}
      <section id="menu" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 font-cairo">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "ar" ? "قائمة الأطباق الحجرية" : "ALL ARTISAN PIES"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-playfair tracking-tight">
              {language === "ar" ? "أطباق الفرن الحجري المخبوزة طازجة" : "Stone-Oven Gourmet Collection"}
            </h2>
            <p className="text-xs text-stone-400 mt-1 font-cairo">
              {language === "ar"
                ? "أشهى أنواع البيتزا والفطائر المخبوزة طازجة عند الطلب بأيدي شيف متخصص"
                : "Handcrafted stone-oven specialties ready for instant ordering"}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "all", labelAr: "الكل", labelEn: "All" },
              { id: "pizzas", labelAr: "البيتزا الإيطالية", labelEn: "Pizzas" },
              { id: "fatayer", labelAr: "فطائر ومعجنات", labelEn: "Fatayer" },
              { id: "sides", labelAr: "المقبلات", labelEn: "Sides" },
              { id: "drinks", labelAr: "المشروبات", labelEn: "Drinks" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-cairo transition-all whitespace-nowrap ${
                  activeCategoryTab === tab.id
                    ? "bg-gradient-to-r from-[#ff8c00] to-[#dc2626] text-white shadow-md shadow-orange-950/60 border border-amber-300/30"
                    : "bg-[#11141c] text-stone-300 hover:text-white border border-white/10 hover:border-amber-500/30"
                }`}
              >
                {language === "ar" ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Product Cards Grid (Matches Obsidian Cards in Mockup) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <MenuCard
              key={product.id}
              product={product}
              onCustomize={(prod) => setSelectedProduct(prod)}
            />
          ))}
        </div>

        {/* View Full Menu Button */}
        <div className="text-center pt-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#12151e] hover:bg-[#1a1f2c] text-amber-400 border border-amber-500/30 hover:border-amber-400 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg shadow-orange-950/40 active:scale-95 group font-cairo"
          >
            <span>{language === "ar" ? "استعراض كامل القائمة الإيطالية (Menu)" : "View Complete Menu"}</span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 text-amber-400" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          6. DEAL OF THE DAY SPOTLIGHT WITH COUNTDOWN (Matches Mockup)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#14181f] border border-[#222934] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Visual: Cheesy Pizza on Board with Garlic and Peppers */}
            <div className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto lg:h-[450px] w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=85"
                alt="Deal of The Day Pizza"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-transparent to-[#14181f]/80 pointer-events-none" />
              <div className="absolute top-4 start-4 bg-[#e45a38] text-white text-[11px] font-black px-3 py-1 rounded font-outfit uppercase shadow-lg">
                HOT DEAL
              </div>
            </div>

            {/* Content & Live Countdown Timer */}
            <div className="lg:col-span-6 p-6 sm:p-10 space-y-6 text-start">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#e45a38] uppercase tracking-wider font-outfit">
                  LIMITED TIME EXCLUSIVE
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-white font-cairo">
                  {language === "ar" ? "عرض اليوم التوفيري المميز" : "Deal of The Day"}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg">
                  {language === "ar"
                    ? "بيتزا سوبريم حجرية كبيرة + أصابع جبنة موزاريلا مقرمشة + بيبسي عائلي مثلج بخصم خاص واستلام فوري بدون أي انتظار!"
                    : "Large Stone-Baked Supreme Pizza + Crispy Mozzarella Sticks + Family Beverage at an exclusive discount for instant pickup!"}
                </p>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-[#e45a38] font-outfit">
                  4,200 YER
                </span>
                <span className="text-sm font-bold text-stone-500 line-through font-outfit">
                  5,500 YER
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded font-outfit">
                  SAVE 1,300 YER
                </span>
              </div>

              {/* 4-Box Countdown Timer (Matches Mockup) */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-sm">
                {[
                  { value: String(timeLeft.days).padStart(2, "0"), labelAr: "يوم", labelEn: "DAYS" },
                  { value: String(timeLeft.hours).padStart(2, "0"), labelAr: "ساعة", labelEn: "HOURS" },
                  { value: String(timeLeft.minutes).padStart(2, "0"), labelAr: "دقيقة", labelEn: "MINS" },
                  { value: String(timeLeft.seconds).padStart(2, "0"), labelAr: "ثانية", labelEn: "SECS" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0c0e12] border border-[#222934] rounded-xl p-2.5 sm:p-3 text-center shadow-inner"
                  >
                    <span className="text-lg sm:text-2xl font-black text-white font-outfit block">
                      {item.value}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-stone-400 font-outfit tracking-wider">
                      {language === "ar" ? item.labelAr : item.labelEn}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2.5 bg-[#e45a38] hover:bg-[#d24e2e] text-white px-8 py-3.5 rounded-[6px] font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-orange-950/60 active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{language === "ar" ? "اطلب العرض الآن واستلم فوراً" : "SHOP NOW"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. MENU CARD - TWO-COLUMN TABULAR PRICE LIST (Matches Mockup)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#e45a38] uppercase tracking-wider font-outfit">
            AUTHENTIC STONE OVEN KITCHEN
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-cairo">
            {language === "ar" ? "قائمة أسعار أطباقنا (Menu Card)" : "Menu Card"}
          </h2>
          <p className="text-xs text-stone-400 max-w-lg mx-auto">
            {language === "ar"
              ? "مختارات فاخرة محضرة من مكونات طازجة يومياً بأيدي أمهر الطهاة في المكلا"
              : "Signature oven selections with verified pricing and fresh daily dough"}
          </p>
        </div>

        {/* Two Columns Table List with Dotted Leaders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Column 1: Pizzas */}
          <div className="bg-[#14181f] border border-[#222934] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-[#e45a38] border-b border-[#222934] pb-3 flex items-center justify-between font-cairo">
              <span>{language === "ar" ? "أطباق البيتزا الحجرية" : "Artisan Pizzas"}</span>
              <Pizza className="w-5 h-5 text-[#e45a38]" />
            </h3>

            <div className="space-y-5">
              {pizzaMenuCardList.map((item) => (
                <div key={item.id} className="flex items-center gap-3.5 group">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#222934] bg-[#0c0e12]">
                    <Image
                      src={item.img}
                      alt={item.nameAr}
                      fill
                      sizes="50px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white font-cairo group-hover:text-[#e45a38] transition-colors truncate">
                        {language === "ar" ? item.nameAr : item.nameEn}
                      </h4>
                      <div className="flex-1 border-b border-dotted border-stone-600/60 mx-2" />
                      <span className="text-xs sm:text-sm font-bold text-amber-300 font-outfit whitespace-nowrap">
                        {item.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {language === "ar" ? item.descAr : item.descEn}
                    </p>
                  </div>

                  <Link
                    href="/menu"
                    className="w-7 h-7 rounded-full bg-[#0c0e12] border border-[#222934] text-stone-300 group-hover:bg-[#e45a38] group-hover:text-white flex items-center justify-center transition-colors shrink-0"
                    title="اطلب الآن"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Pastries & Sides */}
          <div className="bg-[#14181f] border border-[#222934] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-[#e45a38] border-b border-[#222934] pb-3 flex items-center justify-between font-cairo">
              <span>{language === "ar" ? "الفطائر والمعجنات والمقبلات" : "Pastries & Sides"}</span>
              <Utensils className="w-5 h-5 text-[#e45a38]" />
            </h3>

            <div className="space-y-5">
              {fatayerMenuCardList.map((item) => (
                <div key={item.id} className="flex items-center gap-3.5 group">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#222934] bg-[#0c0e12]">
                    <Image
                      src={item.img}
                      alt={item.nameAr}
                      fill
                      sizes="50px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white font-cairo group-hover:text-[#e45a38] transition-colors truncate">
                        {language === "ar" ? item.nameAr : item.nameEn}
                      </h4>
                      <div className="flex-1 border-b border-dotted border-stone-600/60 mx-2" />
                      <span className="text-xs sm:text-sm font-bold text-amber-300 font-outfit whitespace-nowrap">
                        {item.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {language === "ar" ? item.descAr : item.descEn}
                    </p>
                  </div>

                  <Link
                    href="/menu"
                    className="w-7 h-7 rounded-full bg-[#0c0e12] border border-[#222934] text-stone-300 group-hover:bg-[#e45a38] group-hover:text-white flex items-center justify-center transition-colors shrink-0"
                    title="اطلب الآن"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. ARTISANAL CRAFTSMANSHIP / VIDEO SPOTLIGHT BANNER (Matches Mockup)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/8] sm:aspect-[21/9] max-h-[420px] bg-[#14181f] border border-[#222934] flex items-center justify-center group shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&q=85"
            alt="Pizza Craftsmanship in Mukalla"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/60 to-transparent" />

          {/* Central Play Badge */}
          <div className="relative z-10 text-center space-y-4 px-4">
            <Link
              href="/menu"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#e45a38] hover:bg-[#d24e2e] text-white mx-auto flex items-center justify-center shadow-[0_0_35px_rgba(228,90,56,0.8)] active:scale-95 transition-all group-hover:scale-110"
              aria-label="Artisan Video Showcase"
            >
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white ms-1" />
            </Link>
            <h3 className="text-xl sm:text-3xl font-black text-white font-cairo">
              {language === "ar"
                ? "فن صناعة البيتزا الحجرية في المكلا"
                : "Artisan Stone Oven Craftsmanship"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
              {language === "ar"
                ? "مخبوزة يومياً بأيدي أمهر الطهاة بأسرار العجينة الإيطالية الطبيعية"
                : "Baked daily on authentic stone oven using time-honored recipes"}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. "A PERSONAL TOUCH" INFINITE SCROLLING MARQUEE TICKER (Matches Mockup)
      ========================================================================= */}
      <section className="w-full bg-[#14181f] border-y border-[#222934] py-5 sm:py-6 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xl sm:text-3xl font-black tracking-widest text-white/90 uppercase font-outfit">
          <span className="flex items-center gap-4">
            <span>A Personal Touch</span>
            <span className="text-[#e45a38]">✦</span>
            <span className="font-cairo">بيتزا هاوس المكلا</span>
            <span className="text-[#e45a38]">✦</span>
            <span>Stone-Baked Daily</span>
            <span className="text-[#e45a38]">✦</span>
            <span className="font-cairo">عجين يومي طازج</span>
            <span className="text-[#e45a38]">✦</span>
            <span>A Personal Touch</span>
            <span className="text-[#e45a38]">✦</span>
            <span className="font-cairo">استلام فوري 15 دقيقة</span>
            <span className="text-[#e45a38]">✦</span>
            <span>Italian Mozzarella</span>
            <span className="text-[#e45a38]">✦</span>
          </span>
          <span className="flex items-center gap-4">
            <span>A Personal Touch</span>
            <span className="text-[#e45a38]">✦</span>
            <span className="font-cairo">بيتزا هاوس المكلا</span>
            <span className="text-[#e45a38]">✦</span>
            <span>Stone-Baked Daily</span>
            <span className="text-[#e45a38]">✦</span>
            <span className="font-cairo">عجين يومي طازج</span>
            <span className="text-[#e45a38]">✦</span>
            <span>A Personal Touch</span>
            <span className="text-[#e45a38]">✦</span>
            <span className="font-cairo">استلام فوري 15 دقيقة</span>
            <span className="text-[#e45a38]">✦</span>
            <span>Italian Mozzarella</span>
            <span className="text-[#e45a38]">✦</span>
          </span>
        </div>
      </section>

      {/* =========================================================================
          10. CUSTOMER TESTIMONIALS (Matches Mockup Reviews)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#e45a38] uppercase tracking-wider font-outfit">
              CUSTOMER REVIEWS & PRAISE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-cairo">
              {language === "ar" ? "ماذا يقول عملاؤنا في المكلا؟" : "What Our Customers Say"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full bg-[#14181f] border border-[#222934] text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Previous Testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-full bg-[#e45a38] text-white flex items-center justify-center hover:bg-[#d24e2e] transition-colors shadow-md shadow-orange-950/50"
              aria-label="Next Testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: "rev-1",
              name: "م. عمر باوزير",
              role: "المكلا · فوه حي المساكن",
              quote:
                "أفضل بيتزا في المكلا بلا منازع! العجينة خفيفة ومقرمشة والجبن أصلي وجودته عالية جداً، وخدمة الاستلام الفوري مريحة للغاية.",
              rating: 5,
            },
            {
              id: "rev-2",
              name: "د. سارة العمودي",
              role: "المكلا · بالقرب من جامعة الأحقاف",
              quote:
                "اطلب عبر الموقع وأوصل ألقى الطلب جاهز وساخن كأنه لسه طالع من الفرن الحجري، خلطة الرانش والببروني لا يعلى عليها!",
              rating: 5,
            },
            {
              id: "rev-3",
              name: "أحمد بن عبدات",
              role: "عميل دائم",
              quote:
                "الفطائر والبيتزا عندهم إدمان عائلي، النظافة ممتازة والتعامل راقي جداً وسرعة الإنجاز بدون أي تأخير.",
              rating: 5,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-[#14181f] border border-[#222934] rounded-2xl p-6 space-y-4 shadow-xl hover:border-[#e45a38]/60 transition-colors"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-cairo">
                "{item.quote}"
              </p>

              <div className="pt-2 border-t border-[#222934] flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white font-cairo">
                    {item.name}
                  </h4>
                  <span className="text-[11px] text-stone-500 font-cairo">{item.role}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-cairo">
                  عميل موثق
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          11. INSTAGRAM PIZZA GALLERY STRIP (Matches Mockup 7 Edge-to-Edge Photos)
      ========================================================================= */}
      <section className="w-full space-y-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
            <Instagram className="w-4 h-4 text-[#e45a38]" />
            <span>@pizza_house66 • معرض صور بيتزا هاوس</span>
          </div>
          <a
            href="https://www.instagram.com/pizza_house66/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-[#e45a38] hover:underline"
          >
            تابعنا على إنستغرام
          </a>
        </div>

        {/* 7-Photo Edge-to-Edge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 sm:gap-2 px-2">
          {[
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
            "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
            "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80",
            "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80",
            "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&q=80",
          ].map((url, i) => (
            <a
              key={i}
              href="https://www.instagram.com/pizza_house66/"
              target="_blank"
              rel="noreferrer"
              className="relative aspect-square overflow-hidden group bg-[#14181f] rounded-lg"
            >
              <Image
                src={url}
                alt={`Pizza House Gallery ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 15vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#0c0e12]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="w-6 h-6 text-[#e45a38]" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================================
          12. RETURNING CUSTOMER QUICK REORDER & BRANCH LOCATION / HOURS
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <QuickReorderHeroCard />

        {/* Verified Branch Location & Hours Banner */}
        <div id="branches" className="bg-[#14181f] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-[#222934] shadow-2xl relative overflow-hidden scroll-mt-24">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs bg-[#e45a38] text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider font-outfit">
                Fuwa Branch • فرع فوه
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-cairo">
                {language === "ar"
                  ? "تفضل بزيارتنا في فوه - حي المساكن"
                  : "Visit Our Fuwa Branch - Al-Masaken"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {language === "ar"
                  ? "يقع المطعم في موقع استراتيجي بالقرب من جامعة الأحقاف، مستوصف النور، ومدرسة السلال. تتوفر جلسات مريحة وخدمة استلام سريعة مسبقة الدفع والتجهيز."
                  : "Conveniently located near Al-Ahgaff University, Al-Noor Clinic, and Al-Sellal School. Dine-in seating and rapid prep-ahead takeout counter available."}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="tel:05375561"
                  className="inline-flex items-center gap-2 bg-[#0c0e12] hover:bg-[#1a202a] text-white text-xs font-bold px-4 py-2.5 rounded-full border border-[#222934] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#e45a38]" />
                  <span>05375561</span>
                </a>
                <a
                  href="https://wa.me/967772207788"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-bold px-4 py-2.5 rounded-full border border-emerald-700/60 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === "ar" ? "واتساب: 772207788" : "WhatsApp: 772207788"}</span>
                </a>
              </div>
            </div>

            <div className="bg-[#0c0e12] p-5 rounded-2xl border border-[#222934] space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#e45a38]" />
                <span>{language === "ar" ? "جدول الدوام المعتمد" : "Official Working Hours"}</span>
              </h4>
              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex justify-between border-b border-[#222934] pb-1.5">
                  <span>{language === "ar" ? "الفترة الصباحية (معجنات وفطائر):" : "Morning Shift (Pastries):"}</span>
                  <span className="font-outfit text-white">8:00 AM – 12:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-[#222934] pb-1.5">
                  <span>{language === "ar" ? "الفترة المسائية (بيتزا وعشاء):" : "Evening Shift (Dinner & Pizza):"}</span>
                  <span className="font-outfit text-white">4:00 PM – 11:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === "ar" ? "الجمعة (مساءً فقط):" : "Friday (Evening only):"}</span>
                  <span className="font-outfit text-white">4:00 PM – 11:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customizer Modal */}
      {selectedProduct && (
        <CustomizerModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
