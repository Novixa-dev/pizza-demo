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
  Percent,
  Tag,
  Plus,
  Navigation,
} from "lucide-react";
import MenuCard from "@/components/customer/MenuCard";
import HeroSection from "@/components/customer/HeroSection";
import FloatingParticles from "@/components/customer/FloatingParticles";
import CustomizerModal, {
  CustomizerProduct,
} from "@/components/customer/CustomizerModal";
import QuickReorderHeroCard from "@/components/customer/QuickReorderHeroCard";
import LocationAndMapSection from "@/components/customer/LocationAndMapSection";
import TestimonialsSection from "@/components/customer/TestimonialsSection";
import { calculateRestaurantStatus, getYemenNow } from "@/lib/businessHours";

interface HomeClientViewProps {
  restaurant: any;
  featuredProducts: any[];
  latestProducts?: any[];
  categories: any[];
  initialTestimonials?: any[];
}

export default function HomeClientView({
  restaurant,
  featuredProducts,
  latestProducts = [],
  categories,
  initialTestimonials = [],
}: HomeClientViewProps) {
  const { language, dict, addToCart, setIsCartOpen } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<CustomizerProduct | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("all");
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const toggleLiked = (id: string) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 4 Stone-Oven Gourmet Dishes matching prompt exactly
  const stoneOvenSpecialties = [
    {
      id: "oven-pepperoni",
      nameAr: "بيتزا ببروني كلاسيك",
      nameEn: "Classic Pepperoni Pizza",
      nameId: "Pizza Pepperoni Klasik",
      descAr: "شرائح ببروني بقري فاخر مع جبنة موزاريلا ذائبة وصلصة الطماطم...",
      descEn: "Premium beef pepperoni slices, melted mozzarella & tomato sauce",
      descId: "Irisan pepperoni sapi premium dengan keju mozzarella leleh dan saus tomat khas...",
      prepTimeAr: "⏱️ 15 دقيقة",
      prepTimeEn: "⏱️ 15 mins",
      prepTimeId: "⏱️ 15 mnt",
      priceTextAr: "4,500 ر.ي",
      priceTextEn: "4,500 YER",
      priceTextId: "4.500 YER",
      numericPrice: 4500,
      category: "pizzas",
      image: "/images/aura/menu-pepperoni.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800",
    },
    {
      id: "oven-kraft-fatayer",
      nameAr: "فطيرة جبن كرافت بالعسل",
      nameEn: "Kraft Cheese & Honey Fatayer",
      nameId: "Fatayer Keju Kraft & Madu",
      descAr: "فطيرة ساخنة ومحشوة بجبنة كرافت الأصلية الغنية ومغطاة...",
      descEn: "Hot artisanal pastry loaded with rich Kraft cheese & sweet honey",
      descId: "Kue pastry hangat berisi keju Kraft asli yang melimpah dan lumuran madu manis...",
      prepTimeAr: "⏱️ 13 دقيقة",
      prepTimeEn: "⏱️ 13 mins",
      prepTimeId: "⏱️ 13 mnt",
      priceTextAr: "2,000 ر.ي",
      priceTextEn: "2,000 YER",
      priceTextId: "2.000 YER",
      numericPrice: 2000,
      category: "fatayer",
      image: "/images/aura/menu-kraft-fatayer.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=800",
    },
    {
      id: "oven-garlic-bread",
      nameAr: "خبز بالثوم وجبنة الموزاريلا",
      nameEn: "Garlic Bread with Mozzarella",
      nameId: "Roti Bawang Putih & Mozzarella",
      descAr: "قطع خبز فرنسي مقرمش مدهونة بزبدة الثوم والأعشاب...",
      descEn: "Crispy French loaf brushed with herb garlic butter & melted cheese",
      descId: "Roti Prancis renyah berbalut mentega bawang putih harum dengan keju meleleh...",
      prepTimeAr: "⏱️ 15 دقيقة",
      prepTimeEn: "⏱️ 15 mins",
      prepTimeId: "⏱️ 15 mnt",
      priceTextAr: "1,800 ر.ي",
      priceTextEn: "1,800 YER",
      priceTextId: "1.800 YER",
      numericPrice: 1800,
      category: "sides",
      image: "/images/aura/menu-garlic-bread.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=800",
    },
    {
      id: "oven-nutella-fatayer",
      nameAr: "فطيرة النوتيلا والموز الدافئة",
      nameEn: "Warm Nutella & Banana Fatayer",
      nameId: "Fatayer Hangat Nutella & Pisang",
      descAr: "عجينة بيتزا طازجة ومحشوة بشوكولاتة النوتيلا الغنية مع شرائح...",
      descEn: "Fresh sweet dough stuffed with rich Nutella chocolate & banana slices",
      descId: "Adonan manis segar berisi lelehan cokelat Nutella melimpah dan irisan pisang manis...",
      prepTimeAr: "⏱️ 13 دقيقة",
      prepTimeEn: "⏱️ 13 mins",
      prepTimeId: "⏱️ 13 mnt",
      priceTextAr: "2,500 ر.ي",
      priceTextEn: "2,500 YER",
      priceTextId: "2.500 YER",
      numericPrice: 2500,
      category: "fatayer",
      image: "/images/aura/menu-nutella-fatayer.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?q=80&w=800",
    },
  ];

  const displayedOvenProducts =
    activeCategoryTab === "all"
      ? stoneOvenSpecialties
      : stoneOvenSpecialties.filter((item) => item.category === activeCategoryTab).length > 0
      ? stoneOvenSpecialties.filter((item) => item.category === activeCategoryTab)
      : stoneOvenSpecialties;

  const handleAddOvenSpecialty = (item: (typeof stoneOvenSpecialties)[0]) => {
    const matched = featuredProducts.find(
      (p) =>
        p.nameAr?.includes(item.nameAr.split(" ")[0]) ||
        p.nameEn?.toLowerCase().includes(item.nameEn.toLowerCase().split(" ")[0])
    );
    if (matched && setSelectedProduct) {
      setSelectedProduct(matched);
      return;
    }
    addToCart({
      productId: item.id,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      basePrice: item.numericPrice,
      unitPrice: item.numericPrice,
      quantity: 1,
      selectedOptions: [],
      imageUrl: item.image,
    });
    setIsCartOpen(true);
  };

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
      nameId: "Pizza Margherita Klasik",
      descAr: "صلصة طماطم إيطالية غنية، جبنة موزاريلا فاخرة، ريحان طازج",
      descEn: "Rich Italian tomato sauce, premium mozzarella, fresh basil",
      descId: "Saus tomat Italia kaya rasa, keju mozzarella premium, daun kemangi segar",
      numericPrice: 3500,
      img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=160&q=80",
    },
    {
      id: "mc-2",
      nameAr: "بيتزا ببروني إيطالية",
      nameEn: "Italian Pepperoni Pizza",
      nameId: "Pizza Pepperoni Italia",
      descAr: "شرائح ببروني بقري مدخن، جبنة موزاريلا ذائبة، بهارات حارة خفيفة",
      descEn: "Smoked beef pepperoni slices, melted mozzarella, special spices",
      descId: "Irisan pepperoni sapi asap, keju mozzarella leleh, rempah gurih pilihan",
      numericPrice: 4200,
      img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=160&q=80",
    },
    {
      id: "mc-3",
      nameAr: "بيتزا سوبريم فرن حجري",
      nameEn: "Stone Oven Supreme Pizza",
      nameId: "Pizza Supreme Oven Batu",
      descAr: "لحم مفروم، فطر طازج، فلفل ألوان، زيتون أسود، وجبنة موزاريلا",
      descEn: "Minced beef, fresh mushrooms, bell peppers, black olives, mozzarella",
      descId: "Daging cincang, jamur segar, paprika warna-warni, zaitun hitam, keju mozzarella",
      numericPrice: 4800,
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=160&q=80",
    },
    {
      id: "mc-4",
      nameAr: "بيتزا تشيكن رانش بالثوم",
      nameEn: "Chicken Ranch Garlic Pizza",
      nameId: "Pizza Ayam Ranch & Bawang Putih",
      descAr: "دجاج متبل مشوي، صوص رانش فاخر، ثومية خفيفة، وأطراف محمرة",
      descEn: "Seasoned grilled chicken, gourmet ranch drizzle, garlic crust",
      descId: "Ayam panggang berbumbu, saus ranch gurih, aroma bawang putih lembut, pinggiran renyah",
      numericPrice: 4500,
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=160&q=80",
    },
  ];

  const fatayerMenuCardList = [
    {
      id: "mc-5",
      nameAr: "فطيرة لحم بالجبن البلدي",
      nameEn: "Meat & Melted Cheese Fatayer",
      nameId: "Fatayer Daging & Keju Leleh",
      descAr: "لحم بقري مفروم بالبهارات الشرقية مع مزيج جبنة قشقوان وموزاريلا",
      descEn: "Spiced minced beef with melted kashkaval & mozzarella cheese",
      descId: "Daging sapi cincang rempah dengan kombinasi keju kashkaval dan mozzarella",
      numericPrice: 2500,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fatayer.jpg/960px-Fatayer.jpg",
    },
    {
      id: "mc-6",
      nameAr: "فطيرة دجاج شاورما خاصة",
      nameEn: "Chicken Shawarma Fatayer",
      nameId: "Fatayer Shawarma Ayam Spesial",
      descAr: "دجاج متبل بخلطة الشيف مع مايونيز بالثوم ومخلل خيار مقرمش",
      descEn: "Special seasoned chicken with garlic mayo and crisp pickles",
      descId: "Ayam marinasi bumbu khas koki dengan saus mayones bawang putih dan acar renyah",
      numericPrice: 2200,
      img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=160&q=80",
    },
    {
      id: "mc-7",
      nameAr: "أصابع الموزاريلا المقرمشة",
      nameEn: "Crispy Mozzarella Sticks",
      nameId: "Stik Mozzarella Krispi",
      descAr: "5 أصابع مقرمشة محشوة بجبنة موزاريلا تمط مع صوص مارينارا",
      descEn: "5 golden breaded mozzarella sticks with tangy marinara dip",
      descId: "5 stik keju mozzarella goreng keemasan dengan cocolan saus marinara segar",
      numericPrice: 2000,
      img: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=160&q=80",
    },
    {
      id: "mc-8",
      nameAr: "بطاطس ودجز إيطالية متبلة",
      nameEn: "Seasoned Potato Wedges",
      nameId: "Kentang Wedges Rempah Italia",
      descAr: "بطاطس ودجز عريضة مخبوزة بأعشاب إيطالية وبارميزان ناعم",
      descEn: "Thick cut potato wedges baked with Italian herbs & parmesan",
      descId: "Potongan kentang wedges tebal dipanggang dengan rempah herba Italia & keju parmesan",
      numericPrice: 1500,
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
      {/* =========================================================================
          2. THREE MIDDLE HIGHLIGHT CARDS (Three Large Glowing Boxes)
      ========================================================================= */}
      <section id="features" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Box 1: Fast Delivery & Takeout */}
          <div className="bg-[#14161f]/90 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-[#C69843]/35 hover:border-[#EFCC80] shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(239,204,128,0.22)] transition-all duration-300 flex items-center gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#EFCC80]/20 to-[#C69843]/10 border border-[#EFCC80]/40 flex items-center justify-center text-[#EFCC80] shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <Truck className="w-7 h-7 text-[#EFCC80]" />
            </div>
            <div className="text-start">
              <h3 className="text-base sm:text-lg font-bold text-white font-cairo">
                {language === "ar"
                  ? "استلام فوري وتوصيل سريع"
                  : language === "id"
                  ? "Ambil di Toko & Pengantaran Cepat"
                  : "Fast Delivery & Instant Takeout"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 font-cairo leading-relaxed">
                {language === "ar"
                  ? "تجهيز فوري خلال 15 دقيقة بدون انتظار"
                  : language === "id"
                  ? "Disiapkan segar dalam 15 menit tanpa antre"
                  : "Prepared fresh in 15 mins zero wait"}
              </p>
            </div>
          </div>

          {/* Box 2: 100% Fresh Stone Oven */}
          <div className="bg-[#14161f]/90 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-[#C69843]/35 hover:border-[#EFCC80] shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(239,204,128,0.22)] transition-all duration-300 flex items-center gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#EFCC80]/20 to-[#C69843]/10 border border-[#EFCC80]/40 flex items-center justify-center text-[#EFCC80] shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <Flame className="w-7 h-7 text-[#EFCC80] fill-[#EFCC80]" />
            </div>
            <div className="text-start">
              <h3 className="text-base sm:text-lg font-bold text-white font-cairo">
                {language === "ar"
                  ? "فرن حجري 100% طازج"
                  : language === "id"
                  ? "100% Oven Batu Alami Segar"
                  : "100% Fresh Stone Oven"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 font-cairo leading-relaxed">
                {language === "ar"
                  ? "عجين يومي مخبوز على الحجر الطبيعي"
                  : language === "id"
                  ? "Adonan harian dipanggang di atas batu alami"
                  : "Artisanal dough baked on natural stone"}
              </p>
            </div>
          </div>

          {/* Box 3: Secure Local Payment */}
          <div className="bg-[#14161f]/90 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-[#C69843]/35 hover:border-[#EFCC80] shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(239,204,128,0.22)] transition-all duration-300 flex items-center gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#EFCC80]/20 to-[#C69843]/10 border border-[#EFCC80]/40 flex items-center justify-center text-[#EFCC80] shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <CreditCard className="w-7 h-7 text-[#EFCC80]" />
            </div>
            <div className="text-start">
              <h3 className="text-base sm:text-lg font-bold text-white font-cairo">
                {language === "ar"
                  ? "دفع محلي آمن ومرن"
                  : language === "id"
                  ? "Pembayaran Lokal Aman & Fleksibel"
                  : "Secure Local Payment"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 font-cairo leading-relaxed">
                {language === "ar"
                  ? "كريمي، العمقي، البسيري، والدفع نقداً"
                  : language === "id"
                  ? "Kuraimi, Al-Amqi, Al-Busairi & Tunai"
                  : "Kuraimi, Amqi, Busairi & Cash"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SHOP BY COLLECTION - "تسوق حسب التصنيف" (Matches Specification)
      ========================================================================= */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-start">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-cairo tracking-tight">
              {language === "ar"
                ? "تسوق حسب التصنيف"
                : language === "id"
                ? "Belanja Berdasarkan Kategori"
                : "Shop By Category"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-cairo">
              {language === "ar"
                ? "اختر تشكيلتك المفضلة من أصناف البيتزا والمعجنات الإيطالية"
                : language === "id"
                ? "Pilih kategori favorit Anda dari pizza Italia dan aneka pastry lezat"
                : "Explore our artisan categories crafted daily"}
            </p>
          </div>

          {/* Small Golden Navigation Arrows (< and >) on the Left */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById("collection-carousel");
                if (el) el.scrollBy({ left: -220, behavior: "smooth" });
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 flex items-center justify-center transition-all active:scale-95 shadow-md shadow-amber-950/40 font-bold"
              aria-label="Previous Collection"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("collection-carousel");
                if (el) el.scrollBy({ left: 220, behavior: "smooth" });
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 flex items-center justify-center transition-all active:scale-95 shadow-md shadow-amber-950/40 font-bold"
              aria-label="Next Collection"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Collection Cards */}
        <div
          id="collection-carousel"
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {[
            {
              id: "col-1",
              nameAr: "بيتزا ببروني",
              nameEn: "Pepperoni Pizza",
              nameId: "Pizza Pepperoni",
              img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&q=80",
              slug: "pizzas",
            },
            {
              id: "col-2",
              nameAr: "بيتزا مارجريتا",
              nameEn: "Margherita Pizza",
              nameId: "Pizza Margherita",
              img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80",
              slug: "pizzas",
            },
            {
              id: "col-3",
              nameAr: "بيتزا تشيكن رانش",
              nameEn: "Chicken Ranch",
              nameId: "Pizza Ayam Ranch",
              img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80",
              slug: "pizzas",
            },
            {
              id: "col-4",
              nameAr: "بيتزا سوبريم",
              nameEn: "Supreme Pizza",
              nameId: "Pizza Supreme",
              img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80",
              slug: "pizzas",
            },
            {
              id: "col-5",
              nameAr: "فطائر ومعجنات",
              nameEn: "Pastries & Fatayer",
              nameId: "Fatayer & Pastri",
              img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fatayer.jpg/960px-Fatayer.jpg",
              slug: "fatayer",
            },
            {
              id: "col-6",
              nameAr: "مقبلات وأصابع",
              nameEn: "Appetizers & Sides",
              nameId: "Menu Pendamping",
              img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=300&q=80",
              slug: "sides",
            },
          ].map((col) => (
            <Link
              key={col.id}
              href={`/menu?category=${col.slug}`}
              className="group shrink-0 flex flex-col items-center gap-3 bg-[#15171f]/90 hover:bg-[#1a1c26] border border-[#C69843]/20 hover:border-[#EFCC80]/70 rounded-2xl p-4 sm:p-5 transition-all duration-300 w-36 sm:w-44 text-center shadow-xl hover:-translate-y-1.5"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#0c0e12] border-2 border-[#C69843]/60 group-hover:border-[#EFCC80] transition-all p-1 shadow-[0_0_15px_rgba(239,204,128,0.2)] group-hover:shadow-[0_0_25px_rgba(239,204,128,0.45)]">
                <Image
                  src={col.img}
                  alt={language === "ar" ? col.nameAr : language === "id" ? col.nameId : col.nameEn}
                  fill
                  sizes="120px"
                  className="object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-stone-200 group-hover:text-[#EFCC80] transition-colors font-cairo">
                {language === "ar" ? col.nameAr : language === "id" ? col.nameId : col.nameEn}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. TOP PROMOTION SECTION (Two Large Horizontal Banners Side-by-Side)
      ========================================================================= */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Right Banner (First in RTL): الأكثر طلباً في المكلا */}
          <div className="relative rounded-2xl bg-[#14161f]/90 backdrop-blur-md border border-[#C69843]/35 hover:border-[#EFCC80] p-6 sm:p-8 overflow-hidden group transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(239,204,128,0.22)] flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10 space-y-3 max-w-[62%] sm:max-w-[65%] text-start">
              <span className="text-xs font-bold text-[#EFCC80] font-cairo block">
                {language === "ar"
                  ? "الأكثر طلباً في المكلا"
                  : language === "id"
                  ? "Paling Favorit di Mukalla"
                  : "Most Popular in Mukalla"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-cairo leading-snug">
                {language === "ar"
                  ? "البيتزا الإيطالية الأكثر تفضيلاً هنا"
                  : language === "id"
                  ? "Pizza Italia Paling Disukai di Sini"
                  : "The Most Loved Italian Pizza Here"}
              </h3>
              <p className="text-xs text-stone-400 font-cairo leading-relaxed">
                {language === "ar"
                  ? "جبن موزاريلا ذائب وأطراف مقرمشة ساخنة مخبوزة على الحجر الطبيعي."
                  : language === "id"
                  ? "Keju mozzarella meleleh dengan pinggiran garing panas dipanggang di atas batu alami."
                  : "Melted mozzarella with crisp stone-baked edges freshly prepared on natural stone."}
              </p>
              <div className="pt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 px-5 py-2.5 rounded-[10px] font-black text-xs shadow-md shadow-amber-950/50 transition-all active:scale-95 font-cairo"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                  <span>
                    {language === "ar"
                      ? "اطلب الآن"
                      : language === "id"
                      ? "Pesan Sekarang"
                      : "Order Now"}
                  </span>
                </Link>
              </div>
            </div>

            {/* 3D-Overlapping Circular Dish on Left in RTL */}
            <div className="absolute -left-6 sm:-left-8 -bottom-6 sm:-bottom-8 w-44 h-44 sm:w-56 sm:h-56 pointer-events-none group-hover:scale-105 group-hover:rotate-6 transition-transform duration-500 rounded-full p-2 bg-[#0c0d12] border-2 border-[#2b2c35] shadow-[0_15px_35px_rgba(0,0,0,0.95),0_0_20px_rgba(198,152,67,0.2)]">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/images/aura/banner-favorite-pizza.jpg"
                  alt={language === "ar" ? "البيتزا الإيطالية الأكثر تفضيلاً هنا" : language === "id" ? "Pizza Italia Terfavorit" : "Most Loved Pizza"}
                  fill
                  sizes="250px"
                  className="object-cover rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Left Banner (Second in RTL): وجبات التوفير العائلي */}
          <div className="relative rounded-2xl bg-[#14161f]/90 backdrop-blur-md border border-[#C69843]/35 hover:border-[#EFCC80] p-6 sm:p-8 overflow-hidden group transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(239,204,128,0.22)] flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10 space-y-3 max-w-[62%] sm:max-w-[65%] text-start">
              <span className="text-xs font-bold text-[#EFCC80] font-cairo block">
                {language === "ar"
                  ? "وجبات التوفير العائلي"
                  : language === "id"
                  ? "Paket Hemat Keluarga"
                  : "Family Savings Meals"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-cairo leading-snug">
                {language === "ar"
                  ? "وجبات عائلية متكاملة لجميع الأحبة"
                  : language === "id"
                  ? "Paket Makanan Lengkap untuk Seluruh Keluarga"
                  : "Complete Family Meals for Loved Ones"}
              </h3>
              <p className="text-xs text-stone-400 font-cairo leading-relaxed">
                {language === "ar"
                  ? "عروض التوفير الكبرى على أحجام البيتزا الكبيرة مع المقبلات والمشروبات."
                  : language === "id"
                  ? "Promo hemat besar untuk pizza ukuran besar lengkap dengan makanan pendamping dan minuman."
                  : "Major savings deals on large pizzas bundled with appetizers and drinks."}
              </p>
              <div className="pt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 px-5 py-2.5 rounded-[10px] font-black text-xs shadow-md shadow-amber-950/50 transition-all active:scale-95 font-cairo"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                  <span>
                    {language === "ar"
                      ? "اطلب الآن"
                      : language === "id"
                      ? "Pesan Sekarang"
                      : "Order Now"}
                  </span>
                </Link>
              </div>
            </div>

            {/* 3D-Overlapping Circular Dish on Left in RTL */}
            <div className="absolute -left-6 sm:-left-8 -bottom-6 sm:-bottom-8 w-44 h-44 sm:w-56 sm:h-56 pointer-events-none group-hover:scale-105 group-hover:rotate-6 transition-transform duration-500 rounded-full p-2 bg-[#0c0d12] border-2 border-[#2b2c35] shadow-[0_15px_35px_rgba(0,0,0,0.95),0_0_20px_rgba(198,152,67,0.2)]">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/images/aura/banner-family-combo.jpg"
                  alt={language === "ar" ? "وجبات عائلية متكاملة" : language === "id" ? "Paket Hemat Keluarga" : "Family Combo"}
                  fill
                  sizes="250px"
                  className="object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. MIDDLE NAVIGATION & TITLE SECTION + BOTTOM GRID SECTION (100% Matching Specification)
      ========================================================================= */}
      <section id="menu" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        {/* Environmental Floating Particles */}
        <FloatingParticles />

        {/* Middle Navigation & Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          {/* On the Right in RTL: Section Title */}
          <div className="text-start space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-cairo tracking-tight">
              {language === "ar"
                ? "أطباق الفرن الحجري المخبوزة طازجة"
                : language === "id"
                ? "Menu Oven Batu Panggang Segar"
                : "Fresh Stone-Oven Dishes"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-cairo max-w-xl">
              {language === "ar"
                ? "أشهى أنواع البيتزا والفطائر المخبوزة طازجة عند الطلب بأيدي شيف متخصص"
                : language === "id"
                ? "Pizza dan fatayer artisanal lezat dipanggang segar saat dipesan oleh koki ahli"
                : "Handcrafted stone-baked pizzas and pastries baked fresh to order"}
            </p>
          </div>

          {/* On the Left in RTL: Horizontal Filter Tags */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: language === "ar" ? "الكل" : language === "id" ? "Semua" : "All" },
              { id: "pizzas", label: language === "ar" ? "البيتزا الإيطالية" : language === "id" ? "Pizza Italia" : "Italian Pizzas" },
              { id: "fatayer", label: language === "ar" ? "فطائر ومعجنات" : language === "id" ? "Fatayer & Pastri" : "Pastries & Pies" },
              { id: "sides", label: language === "ar" ? "المقبلات" : language === "id" ? "Menu Pendamping" : "Sides & Appetizers" },
              { id: "drinks", label: language === "ar" ? "المشروبات" : language === "id" ? "Minuman" : "Drinks" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold font-cairo transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  activeCategoryTab === tab.id
                    ? "bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] shadow-md shadow-amber-950/40 border border-[#EFCC80]/60"
                    : "bg-[#14161f] text-stone-300 hover:text-white border border-white/10 hover:border-[#EFCC80]/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Grid Section: Four Vertical Product Cards (Right to Left) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative z-10">
          {displayedOvenProducts.map((item) => (
            <div
              key={item.id}
              className="bg-[#14161f]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#C69843]/30 hover:border-[#EFCC80] shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(239,204,128,0.25)] transition-all duration-300 flex flex-col justify-between group relative overflow-visible"
            >
              {/* Top Row: Heart on Right, Prep-Time Badge on Left in RTL */}
              <div className="flex items-center justify-between w-full mb-3 z-10">
                {/* Right in RTL: Subtle hollow heart icon */}
                <button
                  type="button"
                  onClick={() => toggleLiked(item.id)}
                  className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                  aria-label="Favorite"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      likedItems[item.id] ? "fill-rose-500 text-rose-500" : "text-stone-400"
                    }`}
                  />
                </button>

                {/* Left in RTL: Orange/Gold Prep-Time Badge */}
                <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-[#EFCC80] border border-[#EFCC80]/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 font-cairo">
                  <span>{language === "ar" ? item.prepTimeAr : language === "id" ? item.prepTimeId : item.prepTimeEn}</span>
                </span>
              </div>

              {/* Large Rich 3D-Overlapping Circular Dish Image */}
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto my-2 rounded-full p-1.5 bg-[#0c0d12] border-2 border-[#2b2c35] shadow-[0_12px_28px_rgba(0,0,0,0.95),0_0_15px_rgba(198,152,67,0.2)] group-hover:scale-105 group-hover:border-[#EFCC80]/60 transition-all duration-500 shrink-0">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={language === "ar" ? item.nameAr : language === "id" ? item.nameId : item.nameEn}
                    fill
                    unoptimized
                    sizes="180px"
                    className="object-cover rounded-full group-hover:rotate-6 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== item.fallbackImage) {
                        target.src = item.fallbackImage;
                      }
                    }}
                  />
                </div>
              </div>

              {/* Five Golden Rating Stars (★★★★★) */}
              <div className="flex items-center justify-center gap-1 my-2 text-[#EFCC80]">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>

              {/* Bold White Title & Small Muted Description */}
              <div className="text-center space-y-1 mb-4 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-white font-cairo group-hover:text-[#EFCC80] transition-colors line-clamp-1">
                  {language === "ar" ? item.nameAr : language === "id" ? item.nameId : item.nameEn}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400 font-cairo line-clamp-2 leading-relaxed">
                  {language === "ar" ? item.descAr : language === "id" ? item.descId : item.descEn}
                </p>
              </div>

              {/* Bottom Row: Price in Gold on Right, Amber Round "+" Button on Left in RTL */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between w-full mt-auto">
                {/* Right in RTL: Price in Gold "X,XXX ر.ي" */}
                <span className="text-sm sm:text-base font-black text-[#EFCC80] font-cairo tracking-wide">
                  {language === "ar" ? item.priceTextAr : language === "id" ? item.priceTextId : item.priceTextEn}
                </span>

                {/* Left in RTL: Amber Round "+" Button */}
                <button
                  type="button"
                  onClick={() => handleAddOvenSpecialty(item)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-110 font-black flex items-center justify-center text-lg shadow-[0_2px_12px_rgba(198,152,67,0.4)] active:scale-90 transition-all cursor-pointer"
                  title={language === "ar" ? "أضف إلى السلة" : language === "id" ? "Tambah ke Keranjang" : "Add to cart"}
                  aria-label={`Add ${language === "ar" ? item.nameAr : language === "id" ? item.nameId : item.nameEn} to cart`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Menu Button */}
        <div className="text-center pt-2">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#14161f] hover:bg-[#1a1e2b] text-[#EFCC80] border border-[#C69843]/40 hover:border-[#EFCC80] px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg active:scale-95 group font-cairo"
          >
            <span>
              {language === "ar"
                ? "استعراض كامل القائمة الإيطالية (Menu)"
                : language === "id"
                ? "Lihat Semua Menu Italia"
                : "View Complete Menu"}
            </span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 text-[#EFCC80]" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          6. DEAL OF THE DAY SPOTLIGHT WITH COUNTDOWN (Matches Mockup)
      ========================================================================= */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
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
              <div className="absolute top-4 start-4 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] text-xs font-black px-3.5 py-1 rounded-full shadow-lg font-cairo">
                {language === "ar"
                  ? "عرض حصري"
                  : language === "id"
                  ? "Penawaran Spesial"
                  : "Special Offer"}
              </div>
            </div>

            {/* Content & Live Countdown Timer */}
            <div className="lg:col-span-6 p-6 sm:p-10 space-y-6 text-start">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-4xl font-black text-white font-cairo">
                  {language === "ar"
                    ? "عرض اليوم التوفيري المميز"
                    : language === "id"
                    ? "Promo Hemat Hari Ini"
                    : "Deal of The Day"}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg">
                  {language === "ar"
                    ? "بيتزا سوبريم حجرية كبيرة + أصابع جبنة موزاريلا مقرمشة + بيبسي عائلي مثلج بخصم خاص واستلام فوري بدون أي انتظار!"
                    : language === "id"
                    ? "Pizza Supreme besar oven batu + Stik mozzarella renyah + Minuman dingin keluarga dengan diskon spesial & ambil langsung!"
                    : "Large Stone-Baked Supreme Pizza + Crispy Mozzarella Sticks + Family Beverage at an exclusive discount for instant pickup!"}
                </p>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-[#EFCC80] font-outfit">
                  4,200 YER
                </span>
                <span className="text-sm font-bold text-stone-500 line-through font-outfit">
                  5,500 YER
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded font-outfit">
                  {language === "ar" ? "وفر 1,300 ر.ي" : language === "id" ? "HEMAT 1.300 YER" : "SAVE 1,300 YER"}
                </span>
              </div>

              {/* 4-Box Countdown Timer (Matches Mockup) */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-sm">
                {[
                  { value: String(timeLeft.days).padStart(2, "0"), labelAr: "يوم", labelEn: "DAYS", labelId: "HARI" },
                  { value: String(timeLeft.hours).padStart(2, "0"), labelAr: "ساعة", labelEn: "HOURS", labelId: "JAM" },
                  { value: String(timeLeft.minutes).padStart(2, "0"), labelAr: "دقيقة", labelEn: "MINS", labelId: "MENIT" },
                  { value: String(timeLeft.seconds).padStart(2, "0"), labelAr: "ثانية", labelEn: "SECS", labelId: "DETIK" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0c0e12] border border-[#222934] rounded-xl p-2.5 sm:p-3 text-center shadow-inner"
                  >
                    <span className="text-lg sm:text-2xl font-black text-white font-outfit block">
                      {item.value}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-stone-400 font-outfit tracking-wider">
                      {language === "ar" ? item.labelAr : language === "id" ? item.labelId : item.labelEn}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2.5 bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 px-8 py-3.5 rounded-[12px] font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-950/60 active:scale-95 transition-all font-cairo"
                >
                  <ShoppingBag className="w-4 h-4 text-[#2C1A04]" />
                  <span>
                    {language === "ar"
                      ? "اطلب العرض الآن واستلم فوراً"
                      : language === "id"
                      ? "Pesan Promo Sekarang"
                      : "SHOP NOW"}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. MENU CARD - TWO-COLUMN TABULAR PRICE LIST (Matches Mockup)
      ========================================================================= */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-cairo">
            {language === "ar"
              ? "قائمة أسعار أطباقنا (Menu Card)"
              : language === "id"
              ? "Daftar Harga Menu Pilihan"
              : "Menu Card"}
          </h2>
          <p className="text-xs text-stone-400 max-w-lg mx-auto">
            {language === "ar"
              ? "مختارات فاخرة محضرة من مكونات طازجة يومياً بأيدي أمهر الطهاة في المكلا"
              : language === "id"
              ? "Pilihan istimewa dibuat dari bahan segar setiap hari oleh koki terbaik di Mukalla"
              : "Signature oven selections with verified pricing and fresh daily dough"}
          </p>
        </div>

        {/* Two Columns Table List with Dotted Leaders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Column 1: Pizzas */}
          <div className="bg-[#14181f] border border-[#222934] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-[#EFCC80] border-b border-[#222934] pb-3 flex items-center justify-between font-cairo">
              <span>{language === "ar" ? "أطباق البيتزا الحجرية" : language === "id" ? "Menu Pizza Oven Batu" : "Artisan Pizzas"}</span>
              <Pizza className="w-5 h-5 text-[#C69843]" />
            </h3>

            <div className="space-y-5">
              {pizzaMenuCardList.map((item) => (
                <div key={item.id} className="flex items-center gap-3.5 group">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#222934] bg-[#0c0e12]">
                    <Image
                      src={item.img}
                      alt={language === "ar" ? item.nameAr : language === "id" ? item.nameId : item.nameEn}
                      fill
                      sizes="50px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white font-cairo group-hover:text-[#EFCC80] transition-colors truncate">
                        {language === "ar" ? item.nameAr : language === "id" ? item.nameId : item.nameEn}
                      </h4>
                      <div className="flex-1 border-b border-dotted border-stone-600/60 mx-2" />
                      <span className="text-xs sm:text-sm font-bold text-amber-300 font-outfit whitespace-nowrap">
                        {language === "ar" ? `${item.numericPrice.toLocaleString()} ر.ي` : `${item.numericPrice.toLocaleString()} YER`}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {language === "ar" ? item.descAr : language === "id" ? item.descId : item.descEn}
                    </p>
                  </div>

                  <Link
                    href="/menu"
                    className="w-7 h-7 rounded-full bg-[#0c0e12] border border-[#222934] text-stone-300 group-hover:bg-gradient-to-b group-hover:from-[#EFCC80] group-hover:to-[#C69843] group-hover:text-[#2C1A04] flex items-center justify-center transition-colors shrink-0"
                    title={language === "ar" ? "اطلب الآن" : language === "id" ? "Pesan Sekarang" : "Order Now"}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Pastries & Sides */}
          <div className="bg-[#14181f] border border-[#222934] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-[#EFCC80] border-b border-[#222934] pb-3 flex items-center justify-between font-cairo">
              <span>{language === "ar" ? "الفطائر والمعجنات والمقبلات" : language === "id" ? "Fatayer, Pastri & Pendamping" : "Pastries & Sides"}</span>
              <Utensils className="w-5 h-5 text-[#C69843]" />
            </h3>

            <div className="space-y-5">
              {fatayerMenuCardList.map((item) => (
                <div key={item.id} className="flex items-center gap-3.5 group">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#222934] bg-[#0c0e12]">
                    <Image
                      src={item.img}
                      alt={language === "ar" ? item.nameAr : language === "id" ? item.nameId : item.nameEn}
                      fill
                      sizes="50px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white font-cairo group-hover:text-[#EFCC80] transition-colors truncate">
                        {language === "ar" ? item.nameAr : language === "id" ? item.nameId : item.nameEn}
                      </h4>
                      <div className="flex-1 border-b border-dotted border-stone-600/60 mx-2" />
                      <span className="text-xs sm:text-sm font-bold text-amber-300 font-outfit whitespace-nowrap">
                        {language === "ar" ? `${item.numericPrice.toLocaleString()} ر.ي` : `${item.numericPrice.toLocaleString()} YER`}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {language === "ar" ? item.descAr : language === "id" ? item.descId : item.descEn}
                    </p>
                  </div>

                  <Link
                    href="/menu"
                    className="w-7 h-7 rounded-full bg-[#0c0e12] border border-[#222934] text-stone-300 group-hover:bg-gradient-to-b group-hover:from-[#EFCC80] group-hover:to-[#C69843] group-hover:text-[#2C1A04] flex items-center justify-center transition-colors shrink-0"
                    title={language === "ar" ? "اطلب الآن" : language === "id" ? "Pesan Sekarang" : "Order Now"}
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
      <section id="about" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        <div className="relative rounded-2xl w-full sm:rounded-3xl overflow-hidden aspect-[16/8] sm:aspect-[21/9] max-h-[420px] bg-[#14181f] border border-[#222934] flex items-center justify-center group shadow-2xl">
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
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] hover:brightness-105 mx-auto flex items-center justify-center shadow-[0_0_35px_rgba(239,204,128,0.5)] active:scale-95 transition-all group-hover:scale-110"
              aria-label="Artisan Video Showcase"
            >
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-[#2C1A04] text-[#2C1A04] ms-1" />
            </Link>
            <h3 className="text-xl sm:text-3xl font-black text-white font-cairo">
              {language === "ar"
                ? "فن صناعة البيتزا الحجرية في المكلا"
                : language === "id"
                ? "Seni Pembuatan Pizza Oven Batu di Mukalla"
                : "Artisan Stone Oven Craftsmanship"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
              {language === "ar"
                ? "مخبوزة يومياً بأيدي أمهر الطهاة بأسرار العجينة الإيطالية الطبيعية"
                : language === "id"
                ? "Dipanggang setiap hari oleh koki berbakat dengan resep adonan alami Italia"
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
            <span className="text-[#EFCC80]">✦</span>
            <span className="font-cairo">بيتزا هاوس المكلا</span>
            <span className="text-[#EFCC80]">✦</span>
            <span>Stone-Baked Daily</span>
            <span className="text-[#EFCC80]">✦</span>
            <span className="font-cairo">عجين يومي طازج</span>
            <span className="text-[#EFCC80]">✦</span>
            <span>A Personal Touch</span>
            <span className="text-[#EFCC80]">✦</span>
            <span className="font-cairo">استلام فوري 15 دقيقة</span>
            <span className="text-[#EFCC80]">✦</span>
            <span>Italian Mozzarella</span>
            <span className="text-[#EFCC80]">✦</span>
          </span>
          <span className="flex items-center gap-4">
            <span>A Personal Touch</span>
            <span className="text-[#EFCC80]">✦</span>
            <span className="font-cairo">بيتزا هاوس المكلا</span>
            <span className="text-[#EFCC80]">✦</span>
            <span>Stone-Baked Daily</span>
            <span className="text-[#EFCC80]">✦</span>
            <span className="font-cairo">عجين يومي طازج</span>
            <span className="text-[#EFCC80]">✦</span>
            <span>A Personal Touch</span>
            <span className="text-[#EFCC80]">✦</span>
            <span className="font-cairo">استلام فوري 15 دقيقة</span>
            <span className="text-[#EFCC80]">✦</span>
            <span>Italian Mozzarella</span>
            <span className="text-[#EFCC80]">✦</span>
          </span>
        </div>
      </section>

      {/* =========================================================================
          10. CUSTOMER TESTIMONIALS (Customer Reviews & Praise - 100% Matching)
      ========================================================================= */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        {/* Header Row: Title on the Right, Navigation on the Top Left in RTL */}
        <div className="flex items-center justify-between gap-4">
          {/* Title on the Right in RTL */}
          <div className="text-start space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-cairo tracking-tight">
              {language === "ar"
                ? "ماذا يقول عملاؤنا في المكلا؟"
                : language === "id"
                ? "Apa Kata Pelanggan Kami di Mukalla?"
                : "What Our Customers Say in Mukalla"}
            </h2>
          </div>

          {/* Navigation: Small Gold Left/Right Circular Arrow Buttons on the Top Left */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById("testimonials-grid");
                if (el) el.scrollBy({ left: 350, behavior: "smooth" });
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center hover:brightness-105 transition-all shadow-md shadow-amber-950/40 font-bold active:scale-95 cursor-pointer"
              aria-label="Previous Testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("testimonials-grid");
                if (el) el.scrollBy({ left: -350, behavior: "smooth" });
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center hover:brightness-105 transition-all shadow-md shadow-amber-950/40 font-bold active:scale-95 cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Three Elegant Floating Testimonial Cards */}
        <div id="testimonials-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: "rev-1",
              name: "م. عمر باوزير",
              role: "المكلا · فوه حي المساكن",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
              quote:
                "أفضل بيتزا في المكلا بلا منازع! العجينة خفيفة ومقرمشة والجبن أصلي وجودته عالية جداً، وخدمة الاستلام الفوري مريحة للغاية بدون أي انتظار.",
              rating: 5,
            },
            {
              id: "rev-2",
              name: "د. سارة العمودي",
              role: "المكلا · بالقرب من جامعة الأحقاف",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
              quote:
                "أطلب عبر الموقع وأوصل ألقى الطلب جاهز وساخن كأنه لسه طالع من الفرن الحجري، خلطة الرانش والببروني لا يعلى عليها وطعم لا يُنسى!",
              rating: 5,
            },
            {
              id: "rev-3",
              name: "أحمد بن عبدات",
              role: "عميل دائم",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
              quote:
                "الفطائر والبيتزا عندهم إدمان عائلي أسبوعي، النظافة ممتازة والتعامل راقي جداً وسرعة الإنجاز والحرص على جودة المكونات استثنائية.",
              rating: 5,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="relative bg-[#14161f]/90 backdrop-blur-md border border-[#C69843]/35 hover:border-[#EFCC80] rounded-2xl p-6 sm:p-7 space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[0_0_25px_rgba(239,204,128,0.22)] transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div className="space-y-3 relative z-10">
                {/* Five Gold Stars (★★★★★) at the Top */}
                <div className="flex items-center gap-1 text-[#EFCC80]">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} className="text-base">★</span>
                  ))}
                </div>

                {/* Short Review Text in White */}
                <p className="text-sm sm:text-[15px] text-white/95 leading-relaxed font-cairo font-normal">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Bottom Row: Customer Avatar & Name next to Glowing Green "✓ عميل موثق" Badge */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10 mt-auto">
                {/* Customer Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#C69843]/50 shadow-md shrink-0">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="text-start">
                    <h4 className="text-sm font-bold text-white font-cairo">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-stone-400 font-cairo block">
                      {item.role}
                    </span>
                  </div>
                </div>

                {/* Glowing Green "✓ عميل موثق" (Verified Customer) Badge */}
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-bold font-cairo flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0">
                  <span>✓ عميل موثق</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          11. INSTAGRAM PIZZA GALLERY (6 Square High-Resolution Photos Seamless Row)
      ========================================================================= */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#EFCC80] to-[#C69843] text-[#2C1A04] flex items-center justify-center shadow-md shadow-amber-950/40">
              <Instagram className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-white font-cairo">
              @pizza_house66 • معرض صور بيتزا هاوس
            </span>
          </div>

          <a
            href="https://www.instagram.com/pizza_house66/"
            target="_blank"
            rel="noreferrer"
            className="text-xs sm:text-sm font-bold text-[#EFCC80] hover:text-white transition-colors flex items-center gap-1.5 group font-cairo"
          >
            <span>تابعنا على إنستغرام</span>
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
          </a>
        </div>

        {/* 6 Seamless High-Resolution Square Food Images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {[
            {
              url: "/images/aura/menu-fries.jpg",
              title: "بطاطس مقرمشة ذهبية مع صوص الجبن الذائب",
            },
            {
              url: "/images/aura/menu-pepperoni.jpg",
              title: "بيتزا دبل بيبروني كرسبي محملة",
            },
            {
              url: "/images/aura/wood-fired-hero.jpg",
              title: "جبنة موزاريلا ذائبة على الحجر الطبيعي",
            },
            {
              url: "/images/aura/margherita-craft.jpg",
              title: "بيتزا مارغريتا كرافت الحجرية",
            },
            {
              url: "/images/aura/menu-garlic-bread.jpg",
              title: "خبز بالثوم وجبنة الموزاريلا المقرمش",
            },
            {
              url: "/images/aura/spicy-burrata.jpg",
              title: "سبايسي بوراتا الإيطالية بالجبنة الغنية",
            },
          ].map((item, i) => (
            <a
              key={i}
              href="https://www.instagram.com/pizza_house66/"
              target="_blank"
              rel="noreferrer"
              className="relative aspect-square overflow-hidden group bg-[#14181f] rounded-2xl border border-white/10 hover:border-[#EFCC80]/60 shadow-lg hover:shadow-[0_0_20px_rgba(239,204,128,0.25)] transition-all duration-300"
            >
              <Image
                src={item.url}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500 rounded-2xl"
                unoptimized
              />
              {/* Subtle Dark Overlay with Faint White Instagram Icon on Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================================
          12. RETURNING CUSTOMER QUICK REORDER
      ========================================================================= */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20 relative z-20 font-cairo">
        <QuickReorderHeroCard />
      </section>

      {/* 3.8 Verified Customer Testimonials & Reviews Section */}
      <TestimonialsSection initialTestimonials={initialTestimonials} />

      {/* 4. Comprehensive Interactive Location & Map Section with Instagram & Amenities */}
      <LocationAndMapSection />

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
