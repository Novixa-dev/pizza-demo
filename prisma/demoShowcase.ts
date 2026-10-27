import type { PrismaClient } from "@prisma/client";

/**
 * Showcase data for the public demo: coupons, automatic gift tiers, customer
 * reviews and a demo customer with an unlocked loyalty reward, so visitors can
 * try every feature without staff setting anything up.
 *
 * Idempotent and additive: rows are keyed by coupon code, gift name and order
 * number, existing rows are never overwritten (an admin's edits survive every
 * container restart) and nothing is deleted.
 */

/** Demo customer: 5 completed orders, so the loyalty reward is ready to claim. */
export const DEMO_CUSTOMER_PHONE = "770000000";

const DAY_MS = 24 * 60 * 60 * 1000;

const COUPONS = [
  {
    code: "NOVIXA20",
    titleAr: "خصم 20% لتجربة الديمو",
    titleEn: "20% Off — Demo Tryout",
    titleId: "Diskon 20% Uji Coba Demo",
    descriptionAr: "خصم 20% على أي طلب بقيمة 3,000 ر.ي فأكثر (حد أقصى 3,000 ر.ي) — مخصص لتجربة النظام",
    descriptionEn: "20% off any order of 3,000 YER or more (max 3,000 YER) — made for trying the demo",
    descriptionId: "Diskon 20% untuk pesanan minimal 3.000 YER (maks 3.000 YER) — untuk mencoba demo",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderAmount: 3000,
    maxDiscount: 3000,
  },
  {
    code: "WELCOME10",
    titleAr: "خصم 10% للطلب الأول",
    titleEn: "10% Off First Order",
    titleId: "Diskon 10% Pesanan Pertama",
    descriptionAr: "خصم 10% عند طلبك الأول بقيمة 8,000 ر.ي أو أكثر (حد أقصى للخصم 1,000 ر.ي)",
    descriptionEn: "10% off your first order of 8,000 YER or more (max discount 1,000 YER)",
    descriptionId: "Diskon 10% untuk pesanan pertama minimal 8.000 YER (maksimal diskon 1.000 YER)",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 8000,
    maxDiscount: 1000,
    isFirstOrderOnly: true,
  },
  {
    code: "MUKALLA500",
    titleAr: "خصم فوري 500 ر.ي",
    titleEn: "Instant 500 YER Discount",
    titleId: "Diskon Instan 500 YER",
    descriptionAr: "خصم فوري 500 ر.ي على جميع الطلبات بقيمة 6,000 ر.ي فأكثر",
    descriptionEn: "Instant 500 YER off any order of 6,000 YER or more",
    descriptionId: "Diskon instan 500 YER untuk semua pesanan mulai dari 6.000 YER",
    discountType: "FIXED",
    discountValue: 500,
    minOrderAmount: 6000,
  },
  {
    code: "HADRAMOUT",
    titleAr: "عرض الطلاب وأهالي المدينة 15%",
    titleEn: "15% Students & Community Deal",
    titleId: "Promo Mahasiswa & Komunitas 15%",
    descriptionAr: "خصم 15% لطلبات 10,000 ر.ي فأكثر (حد أقصى 2,000 ر.ي)",
    descriptionEn: "15% off orders of 10,000 YER or more (max 2,000 YER)",
    descriptionId: "Diskon 15% untuk pesanan 10.000+ YER (maks 2.000 YER)",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderAmount: 10000,
    maxDiscount: 2000,
  },
  {
    code: "FAMILYBOX",
    titleAr: "خبز بالثوم والموزاريلا مجاناً",
    titleEn: "Free Cheesy Garlic Bread",
    titleId: "Roti Bawang Putih Keju Gratis",
    descriptionAr: "خبز بالثوم والموزاريلا مجاناً مع الطلبات العائلية بقيمة 15,000 ر.ي فأكثر",
    descriptionEn: "Free cheesy garlic bread with family orders of 15,000 YER or more",
    descriptionId: "Roti bawang putih keju gratis untuk pesanan keluarga 15.000 YER ke atas",
    discountType: "FREE_ITEM",
    discountValue: 0,
    freeItemNameAr: "خبز بالثوم والموزاريلا مجاناً",
    freeItemNameEn: "Free Cheesy Garlic Bread",
    minOrderAmount: 15000,
  },
];

const GIFTS = [
  {
    nameAr: "خبز بالثوم والموزاريلا الساخن",
    nameEn: "Hot Cheesy Garlic Bread",
    nameId: "Roti Bawang Putih Keju Hangat",
    descriptionAr: "هدية مجانية تلقائية تضاف لطلبك عند تجاوز 12,000 ر.ي",
    descriptionEn: "Added to your order automatically when you spend 12,000 YER or more",
    minSpend: 12000,
    imageUrl: "https://images.unsplash.com/photo-1619895092538-128341789043?w=600&q=80",
    sortOrder: 1,
  },
  {
    nameAr: "فطيرة نوتيلا بالموز الفاخرة",
    nameEn: "Premium Nutella & Banana Fatayer",
    nameId: "Fatayer Nutella Pisang Premium",
    descriptionAr: "هدية تحلية فاخرة تضاف تلقائياً للطلبات الكبيرة عند بلوغ 20,000 ر.ي",
    descriptionEn: "A premium dessert gift added automatically on orders of 20,000 YER or more",
    minSpend: 20000,
    imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80",
    sortOrder: 2,
  },
];

interface CompletedOrderSeed {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productNameEn: string;
  daysAgo: number;
  review?: { mealRating: number; serviceRating: number; tags: string; comment: string };
}

const REVIEWED_ORDERS: CompletedOrderSeed[] = [
  {
    orderNumber: "#PH-991",
    customerName: "أحمد سالم (عميل تجريبي)",
    customerPhone: "771234567",
    productNameEn: "Pizza Nova Supreme Special",
    daysAgo: 1,
    review: {
      mealRating: 5,
      serviceRating: 5,
      tags: "طازج وساخن, عجينة ممتازة, استلام سريع",
      comment: "طلبت مسبقاً ووصلت الفرع واستلمتها ساخنة مقرمشة طازجة من الفرن بدون أي انتظار. العجينة خفيفة جداً.",
    },
  },
  {
    orderNumber: "#PH-992",
    customerName: "د. عمر (عميل تجريبي)",
    customerPhone: "772345678",
    productNameEn: "Chicken Ranch Pizza",
    daysAgo: 2,
    review: {
      mealRating: 5,
      serviceRating: 5,
      tags: "خدمة راقية, دقة الموعد",
      comment: "خدمة الطلب المسبق وفرت علينا وقتاً ثميناً بين المحاضرات. صوص الرانش والتحمير على الحجر متقن.",
    },
  },
  {
    orderNumber: "#PH-993",
    customerName: "أم عبدالله (عميلة تجريبية)",
    customerPhone: "773456789",
    productNameEn: "Traditional Margherita",
    daysAgo: 3,
    review: {
      mealRating: 5,
      serviceRating: 5,
      tags: "جلسات عائلية مريحة, نظافة فائقة",
      comment: "جلسات العائلات مريحة وتوفر الخصوصية. الأبناء استمتعوا جداً بطعم البيتزا والفطائر الساخنة.",
    },
  },
  {
    orderNumber: "#PH-994",
    customerName: "سالم (عميل تجريبي)",
    customerPhone: "774567890",
    productNameEn: "Classic Pepperoni Pizza",
    daysAgo: 4,
    review: {
      mealRating: 5,
      serviceRating: 4,
      tags: "طعم إيطالي أصيل, تحويل سهل",
      comment: "دفعت بالتحويل وأرفقت السند بسهولة، واستلمت الطلب في موعده تماماً. الخبز على الحجر له نكهة مميزة.",
    },
  },
  {
    orderNumber: "#PH-995",
    customerName: "م. خالد (عميل تجريبي)",
    customerPhone: "775678901",
    productNameEn: "Chicken Ranch Pizza",
    daysAgo: 5,
    review: {
      mealRating: 5,
      serviceRating: 5,
      tags: "كرنش ممتاز, صوصات رهيبة",
      comment: "فكرة شاشة متابعة حالة الخبز في الفرن ذكية واحترافية. استمروا بهذا المستوى!",
    },
  },
];

const DEMO_CUSTOMER_ORDERS: CompletedOrderSeed[] = [6, 9, 13, 18, 24].map((daysAgo, i) => ({
  orderNumber: `#PH-DEMO-${i + 1}`,
  customerName: "عميل تجريبي",
  customerPhone: DEMO_CUSTOMER_PHONE,
  productNameEn: ["Classic Pepperoni Pizza", "Traditional Margherita", "Chicken Ranch Pizza"][i % 3],
  daysAgo,
}));

export async function seedDemoShowcase(
  prisma: PrismaClient,
  restaurantId: string,
  now: Date = new Date(),
): Promise<void> {
  let coupons = 0;
  for (const coupon of COUPONS) {
    const existing = await prisma.coupon.findUnique({ where: { code: coupon.code } });
    if (existing) continue;
    await prisma.coupon.create({ data: { ...coupon, isActive: true } });
    coupons++;
  }

  let gifts = 0;
  for (const gift of GIFTS) {
    const existing = await prisma.automaticGift.findFirst({ where: { nameEn: gift.nameEn } });
    if (existing) continue;
    await prisma.automaticGift.create({ data: { ...gift, isActive: true } });
    gifts++;
  }

  let orders = 0;
  for (const seed of [...REVIEWED_ORDERS, ...DEMO_CUSTOMER_ORDERS]) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: seed.orderNumber } });
    if (existing) continue;

    const product =
      (await prisma.product.findFirst({ where: { nameEn: seed.productNameEn } })) ??
      (await prisma.product.findFirst({ orderBy: { sortOrder: "asc" } }));
    if (!product) continue;

    const at = new Date(now.getTime() - seed.daysAgo * DAY_MS);
    await prisma.order.create({
      data: {
        orderNumber: seed.orderNumber,
        restaurantId,
        customerName: seed.customerName,
        customerPhone: seed.customerPhone,
        pickupMode: "SCHEDULED",
        requestedPickupTime: at,
        plannedPrepStartTime: new Date(at.getTime() - 20 * 60 * 1000),
        actualPrepStartTime: new Date(at.getTime() - 20 * 60 * 1000),
        readyTime: at,
        completedTime: at,
        status: "COMPLETED",
        subtotal: product.basePrice,
        total: product.basePrice,
        createdAt: new Date(at.getTime() - 2 * 60 * 60 * 1000),
        items: {
          create: {
            productId: product.id,
            productNameAr: product.nameAr,
            productNameEn: product.nameEn,
            unitPrice: product.basePrice,
            quantity: 1,
            subtotal: product.basePrice,
          },
        },
        payment: {
          create: { method: "PAY_AT_PICKUP", status: "VERIFIED", amount: product.basePrice, verifiedAt: at },
        },
        ...(seed.review && {
          feedback: { create: { ...seed.review, customerName: seed.customerName, createdAt: at } },
        }),
      },
    });
    orders++;
  }

  console.log(`✅ Demo showcase: +${coupons} coupon(s), +${gifts} gift tier(s), +${orders} completed order(s).`);
}
