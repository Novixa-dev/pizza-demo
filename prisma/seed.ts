import { PrismaClient } from "@prisma/client";
import { legacyBrandChanges } from "./legacyBrand";

const prisma = new PrismaClient();

/**
 * Rewrites the pre-rebrand restaurant name inside already-seeded catalog rows.
 * Returns how many rows were changed; a second run changes none.
 */
async function neutralizeLegacyBrandInCatalog(): Promise<number> {
  let changed = 0;
  const apply = async <T extends { id: string }>(
    rows: T[],
    fields: ReadonlyArray<keyof T & string>,
    save: (id: string, data: Record<string, string>) => Promise<unknown>,
  ) => {
    for (const row of rows) {
      const data = legacyBrandChanges(row, fields);
      if (!data) continue;
      await save(row.id, data);
      changed++;
    }
  };

  await apply(await prisma.category.findMany(), ["nameAr", "nameEn"], (id, data) =>
    prisma.category.update({ where: { id }, data }),
  );
  await apply(
    await prisma.product.findMany(),
    ["nameAr", "nameEn", "descriptionAr", "descriptionEn"],
    (id, data) => prisma.product.update({ where: { id }, data }),
  );
  await apply(await prisma.optionGroup.findMany(), ["nameAr", "nameEn"], (id, data) =>
    prisma.optionGroup.update({ where: { id }, data }),
  );
  await apply(await prisma.optionItem.findMany(), ["nameAr", "nameEn"], (id, data) =>
    prisma.optionItem.update({ where: { id }, data }),
  );
  await apply(
    await prisma.coupon.findMany(),
    ["titleAr", "titleEn", "descriptionAr", "descriptionEn"],
    (id, data) => prisma.coupon.update({ where: { id }, data }),
  );
  await apply(
    await prisma.automaticGift.findMany(),
    ["nameAr", "nameEn", "descriptionAr", "descriptionEn"],
    (id, data) => prisma.automaticGift.update({ where: { id }, data }),
  );
  return changed;
}

async function main() {
  const isProduction = process.env.NODE_ENV === "production";
  console.log("🌱 Seeding Pizza Nova database...");

  if (isProduction) {
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: "pizza-house-mukalla" },
    });
    if (existingRestaurant) {
      // Public demo: keep the restaurant profile neutral (no real business identity).
      if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false") {
        await prisma.restaurant.update({
          where: { id: existingRestaurant.id },
          data: {
            nameAr: "بيتزا نوڤا",
            nameEn: "Pizza Nova",
            phone: "05000000",
            whatsapp: "+967776248526",
            addressAr: "المكلا - وسط المدينة - عنوان تجريبي لأغراض العرض",
            addressEn: "Mukalla, City Center (demo address)",
          },
        });
        console.log("Demo mode: restaurant profile set to neutral demo values.");
        const renamed = await neutralizeLegacyBrandInCatalog();
        console.log(`Demo mode: removed the legacy restaurant name from ${renamed} catalog row(s).`);
      }
      console.log("Production data already exists; skipping seed without changes.");
      return;
    }
  } else {
    // Development fixtures are intentionally rebuilt from scratch.
    await prisma.auditLog.deleteMany();
    await prisma.analyticsEvent.deleteMany();
    await prisma.paymentReceipt.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItemOption.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.optionItem.deleteMany();
    await prisma.optionGroup.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.businessHour.deleteMany();
    await prisma.restaurant.deleteMany();
  }

  // 1. Create Restaurant profile
  const restaurant = await prisma.restaurant.create({
    data: {
      nameAr: "بيتزا نوڤا",
      nameEn: "Pizza Nova",
      slug: "pizza-house-mukalla",
      phone: "05000000",
      whatsapp: "+967776248526",
      addressAr: "المكلا - وسط المدينة - عنوان تجريبي لأغراض العرض",
      addressEn: "Mukalla, City Center (demo address)",
      currency: "YER",
      defaultPrepDuration: 15,
      slotCapacityMax: 8,
      isOnlineOrderingPaused: false,
    },
  });

  console.log(`✅ Created Restaurant: ${restaurant.nameAr}`);

  // 2. Business Hours (Saturday - Thursday: 8AM-12PM & 4PM-11:30PM; Friday: 4PM-11:30PM)
  const days = [0, 1, 2, 3, 4, 5, 6]; // Sun(0) to Sat(6)
  for (const day of days) {
    if (day === 5) {
      // Friday: Morning closed, Evening 4PM - 11:30PM
      await prisma.businessHour.create({
        data: {
          restaurantId: restaurant.id,
          dayOfWeek: day,
          shiftName: "Morning",
          openTime: "08:00",
          closeTime: "12:00",
          isClosed: true,
        },
      });
      await prisma.businessHour.create({
        data: {
          restaurantId: restaurant.id,
          dayOfWeek: day,
          shiftName: "Evening",
          openTime: "16:00",
          closeTime: "23:30",
          isClosed: false,
        },
      });
    } else {
      // Sat - Thu: Morning 8AM - 12PM, Evening 4PM - 11:30PM
      await prisma.businessHour.create({
        data: {
          restaurantId: restaurant.id,
          dayOfWeek: day,
          shiftName: "Morning",
          openTime: "08:00",
          closeTime: "12:00",
          isClosed: false,
        },
      });
      await prisma.businessHour.create({
        data: {
          restaurantId: restaurant.id,
          dayOfWeek: day,
          shiftName: "Evening",
          openTime: "16:00",
          closeTime: "23:30",
          isClosed: false,
        },
      });
    }
  }

  console.log("✅ Configured 7-day 2-shift operating hours");

  // 3. Categories
  const catPizza = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      nameAr: "البيتزا الإيطالية",
      nameEn: "Specialty Pizzas",
      slug: "pizzas",
      iconName: "Pizza",
      sortOrder: 1,
    },
  });

  const catFatayer = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      nameAr: "الفطائر والمعجنات",
      nameEn: "Savory Fatayer & Pies",
      slug: "fatayer",
      iconName: "Wheat",
      sortOrder: 2,
    },
  });

  const catSides = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      nameAr: "المقبلات والإضافات",
      nameEn: "Appetizers & Sides",
      slug: "sides",
      iconName: "UtensilsCrossed",
      sortOrder: 3,
    },
  });

  const catDesserts = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      nameAr: "الحلويات",
      nameEn: "Desserts & Sweet Pies",
      slug: "desserts",
      iconName: "Cake",
      sortOrder: 4,
    },
  });

  const catDrinks = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      nameAr: "المشروبات المنعشة",
      nameEn: "Beverages",
      slug: "drinks",
      iconName: "CupSoda",
      sortOrder: 5,
    },
  });

  console.log("✅ Created 5 categories");

  // Helper to add pizza with standard size & crust options
  async function createPizza({
    nameAr,
    nameEn,
    descriptionAr,
    descriptionEn,
    basePrice,
    imageUrl,
    isFeatured = false,
    sortOrder = 0,
  }: {
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    basePrice: number;
    imageUrl: string;
    isFeatured?: boolean;
    sortOrder?: number;
  }) {
    const product = await prisma.product.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: catPizza.id,
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        basePrice,
        imageUrl,
        isFeatured,
        sortOrder,
        optionGroups: {
          create: [
            {
              nameAr: "الحجم",
              nameEn: "Size",
              type: "RADIO",
              isRequired: true,
              minSelect: 1,
              maxSelect: 1,
              options: {
                create: [
                  { nameAr: "صغير (Small - 6 قطع)", nameEn: "Small (6 Slices)", priceDelta: 0 },
                  { nameAr: "وسط (Medium - 8 قطع)", nameEn: "Medium (8 Slices)", priceDelta: 2000 },
                  { nameAr: "كبير (Large - 10 قطع)", nameEn: "Large (10 Slices)", priceDelta: 4000 },
                ],
              },
            },
            {
              nameAr: "نوع العجينة",
              nameEn: "Crust Type",
              type: "RADIO",
              isRequired: true,
              minSelect: 1,
              maxSelect: 1,
              options: {
                create: [
                  { nameAr: "عجينة كلاسيكية هشة", nameEn: "Classic Hand-Tossed", priceDelta: 0 },
                  { nameAr: "عجينة رقيقة ومقرمشة", nameEn: "Thin & Crispy", priceDelta: 0 },
                  { nameAr: "أطراف محشوة بجبنة الموزاريلا", nameEn: "Cheese Stuffed Crust", priceDelta: 1000 },
                ],
              },
            },
            {
              nameAr: "إضافات اختيارية",
              nameEn: "Extra Toppings",
              type: "CHECKBOX",
              isRequired: false,
              minSelect: 0,
              maxSelect: 5,
              options: {
                create: [
                  { nameAr: "موزاريلا إضافية دبل", nameEn: "Double Mozzarella", priceDelta: 500 },
                  { nameAr: "زيتون أسود وأخضر", nameEn: "Sliced Olives", priceDelta: 300 },
                  { nameAr: "فطر طازج (مشروم)", nameEn: "Fresh Mushrooms", priceDelta: 400 },
                  { nameAr: "فلفل هالبينو حار", nameEn: "Jalapenos", priceDelta: 300 },
                  { nameAr: "صوص رانش إضافي على الوجه", nameEn: "Ranch Drizzle", priceDelta: 300 },
                ],
              },
            },
          ],
        },
      },
    });
    return product;
  }

  // 4. Populate Products
  await createPizza({
    nameAr: "بيتزا ببروني كلاسيك",
    nameEn: "Classic Pepperoni Pizza",
    descriptionAr: "شرائح ببروني بقري فاخر مع جبنة موزاريلا ذائبة وصلصة الطماطم الإيطالية الخاصة ببيتزا نوڤا على عجينة طازجة.",
    descriptionEn: "Premium beef pepperoni slices over melted mozzarella cheese and signature Italian pizza sauce on fresh dough.",
    basePrice: 4500,
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
    isFeatured: true,
    sortOrder: 1,
  });

  await createPizza({
    nameAr: "بيتزا نوڤا سوبريم الخاصة",
    nameEn: "Pizza Nova Supreme Special",
    descriptionAr: "مزيج متكامل من قطع اللحم والدجاج والببروني، مع الفلفل الرومي، البصل، الزيتون، والمشروم الطازج بجبنة الموزاريلا الغنية.",
    descriptionEn: "The ultimate house specialty loaded with beef, seasoned chicken, pepperoni, bell peppers, onions, olives, and mushrooms.",
    basePrice: 5500,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
    isFeatured: true,
    sortOrder: 2,
  });

  await createPizza({
    nameAr: "بيتزا دجاج رانش",
    nameEn: "Chicken Ranch Pizza",
    descriptionAr: "قطع صدور دجاج مشوية بتتبيلتنا الخاصة، صوص الرانش الغني، فطر طازج، وجبنة موزاريلا تعلوها رشة أوريجانو عطرة.",
    descriptionEn: "Tender grilled chicken breast cubes with creamy ranch sauce, fresh sliced mushrooms, and loaded mozzarella.",
    basePrice: 5000,
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    isFeatured: true,
    sortOrder: 3,
  });

  await createPizza({
    nameAr: "بيتزا دجاج باربكيو",
    nameEn: "BBQ Chicken Pizza",
    descriptionAr: "دجاج متبل بصلصة الباربكيو المدخنة اللذيذة مع شرائح البصل الأحمر وجبنة الموزاريلا وصوص البيتزا الذهبي.",
    descriptionEn: "Smoky BBQ glazed chicken with red onion slices, mozzarella cheese, and our golden signature crust.",
    basePrice: 4800,
    imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80",
    isFeatured: false,
    sortOrder: 4,
  });

  await createPizza({
    nameAr: "بيتزا مارجريتا الأصلية",
    nameEn: "Traditional Margherita",
    descriptionAr: "البساطة الإيطالية الفاخرة: صلصة طماطم متبلة بالأعشاب الطازجة، طبقة وفيرة من جبنة الموزاريلا الفاخرة، وزيت الزيتون البكر.",
    descriptionEn: "Classic Italian simplicity with herb-infused marinara sauce, generous melted mozzarella, and extra virgin olive oil.",
    basePrice: 3500,
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80",
    isFeatured: false,
    sortOrder: 5,
  });

  await createPizza({
    nameAr: "بيتزا خضار مشكل (فيجي)",
    nameEn: "Vegetarian Garden Pizza",
    descriptionAr: "تشكيلة غنية من الخضار الطازجة: فلفل حلو ملون، بصل مقرمش، طماطم، زيتون، مشروم، مع صلصة الطماطم وجبنة الموزاريلا.",
    descriptionEn: "A vibrant garden medley of crisp bell peppers, red onions, diced tomatoes, black olives, and fresh mushrooms.",
    basePrice: 4000,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
    isFeatured: false,
    sortOrder: 6,
  });

  // Fatayer
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catFatayer.id,
      nameAr: "فطيرة جبن كرافت بالعسل",
      nameEn: "Kraft Cheese & Honey Pie",
      descriptionAr: "فطيرة ساخنة ومحشوة بجبنة كرافت الأصلية الغنية ومغطاة بأجود أنواع العسل الصافي.",
      descriptionEn: "Warm golden pastry generously filled with savory melted Kraft cheese and drizzled with pure golden honey.",
      basePrice: 2000,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fatayer.jpg/960px-Fatayer.jpg",
      isFeatured: true,
      sortOrder: 1,
      optionGroups: {
        create: [
          {
            nameAr: "الحجم",
            nameEn: "Size",
            type: "RADIO",
            isRequired: true,
            minSelect: 1,
            maxSelect: 1,
            options: {
              create: [
                { nameAr: "عادي", nameEn: "Regular", priceDelta: 0 },
                { nameAr: "كبير دبل", nameEn: "Large Double", priceDelta: 1000 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catFatayer.id,
      nameAr: "فطيرة لحم مفروم بالبهارات",
      nameEn: "Spiced Minced Meat Fatayer",
      descriptionAr: "عجينة رقيقة ومحشوة باللحم المفروم الطازج المتبل بالبصل والبهارات الشرقية المميزة.",
      descriptionEn: "Delicate dough packed with freshly spiced minced beef, minced onions, and aromatic oriental herbs.",
      basePrice: 2200,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Sfiha2.jpg/960px-Sfiha2.jpg",
      isFeatured: false,
      sortOrder: 2,
    },
  });

  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catFatayer.id,
      nameAr: "فطيرة لبنة وزعتر بلدي",
      nameEn: "Labneh & Wild Za'atar Pie",
      descriptionAr: "لبنة كريمية تركية مع خلطة الزعتر البري وزيت الزيتون على عجينة مخبوزة على الحجر.",
      descriptionEn: "Smooth cream labneh paired with fragrant wild za'atar herbs and extra virgin olive oil.",
      basePrice: 1800,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Zaatar_Mankousheh.jpg/960px-Zaatar_Mankousheh.jpg",
      isFeatured: false,
      sortOrder: 3,
    },
  });

  // Sides
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSides.id,
      nameAr: "خبز بالثوم وجبنة الموزاريلا",
      nameEn: "Cheesy Garlic Bread",
      descriptionAr: "قطع خبز فرنسي مقرمش مدهونة بزبدة الثوم والأعشاب ومغطاة بجبنة الموزاريلا الساخنة الذائبة.",
      descriptionEn: "Crispy artisan baguette slices brushed with garlic herb butter and smothered in bubbling melted mozzarella.",
      basePrice: 1800,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Garlicbread.jpg/960px-Garlicbread.jpg",
      isFeatured: true,
      sortOrder: 1,
    },
  });

  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSides.id,
      nameAr: "بطاطس ودجز متبلة بالأعشاب",
      nameEn: "Herbed Potato Wedges",
      descriptionAr: "أصابع بطاطس ودجز مقرمشة ومتبلة بخلطة البابريكا والأعشاب الإيطالية مع صوص الكاتشب أو المايونيز.",
      descriptionEn: "Crispy, fluffy golden seasoned potato wedges dusted with smoked paprika and Italian herbs.",
      basePrice: 1500,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Potato_wedges_at_Mensa_Paderborn_%2811956794164%29.jpg/960px-Potato_wedges_at_Mensa_Paderborn_%2811956794164%29.jpg",
      isFeatured: false,
      sortOrder: 2,
    },
  });

  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSides.id,
      nameAr: "أصابع جبنة الموزاريلا المقلية (5 قطع)",
      nameEn: "Fried Mozzarella Sticks (5 pcs)",
      descriptionAr: "أصابع الموزاريلا الذهبية المقرمشة تقدم مع صوص المارينارا اللذيذ للتغميس.",
      descriptionEn: "Five golden-fried mozzarella batons with irresistible cheese pull, served with zesty marinara sauce.",
      basePrice: 2200,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Fried_Mozzarella_Sticks_at_Millers_Pub_%28301456962%29.jpg/960px-Fried_Mozzarella_Sticks_at_Millers_Pub_%28301456962%29.jpg",
      isFeatured: false,
      sortOrder: 3,
    },
  });

  // Desserts
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDesserts.id,
      nameAr: "فطيرة النوتيلا والموز الدافئة",
      nameEn: "Warm Nutella & Banana Pie",
      descriptionAr: "عجينة بيتزا طازجة ومحشوة بشوكولاتة النوتيلا الغنية مع شرائح الموز والمكسرات المحمصة.",
      descriptionEn: "Decadent dessert pastry smothered in rich Nutella hazelnut chocolate and fresh banana slices.",
      basePrice: 2500,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Nutella_Pizza.jpg/960px-Nutella_Pizza.jpg",
      isFeatured: true,
      sortOrder: 1,
    },
  });

  // Drinks
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDrinks.id,
      nameAr: "بيبسي بارد (علبة 330 مل)",
      nameEn: "Pepsi Can (330ml)",
      descriptionAr: "مشروب بيبسي غازي منعش ومثلج.",
      descriptionEn: "Ice-cold refreshing can of Pepsi.",
      basePrice: 700,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Pepsi_lime_330ml_can-front_PNr%C2%B00852.jpg/960px-Pepsi_lime_330ml_can-front_PNr%C2%B00852.jpg",
      sortOrder: 1,
    },
  });

  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDrinks.id,
      nameAr: "سفن آب بارد (علبة 330 مل)",
      nameEn: "7Up Can (330ml)",
      descriptionAr: "مشروب سفن آب ليمون منعش ومثلج.",
      descriptionEn: "Ice-cold refreshing can of 7Up.",
      basePrice: 700,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/7up_1.jpg/960px-7up_1.jpg",
      sortOrder: 2,
    },
  });

  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDrinks.id,
      nameAr: "مياه شرب نقية (500 مل)",
      nameEn: "Mineral Water (500ml)",
      descriptionAr: "مياه شرب معبأة نقية ومنعشة.",
      descriptionEn: "Pure bottled mineral water.",
      basePrice: 400,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/HK_Soft_drink_pre-packed_plastic_bottles_%E7%B6%AD%E4%BB%96_Vita_Pure_Distilled_Water_500ml_April_2019_SSG_01.jpg/960px-HK_Soft_drink_pre-packed_plastic_bottles_%E7%B6%AD%E4%BB%96_Vita_Pure_Distilled_Water_500ml_April_2019_SSG_01.jpg",
      sortOrder: 3,
    },
  });

  console.log("✅ Seeded full menu items and options!");

  if (isProduction) {
    console.log("Production bootstrap completed without synthetic customer data.");
    console.log("🎉 Database seeding completed successfully!");
    return;
  }

  // 5. Create 3 sample orders representing different realistic stages:
  // Order 1: Scheduled order for later this evening (QUEUED)
  const now = new Date();
  const laterToday = new Date(now.getTime() + 2.5 * 60 * 60 * 1000); // 2.5 hrs later
  const prepStart = new Date(laterToday.getTime() - 20 * 60 * 1000); // 20 min before pickup

  const sampleOrder1 = await prisma.order.create({
    data: {
      orderNumber: "#PH-1024",
      restaurantId: restaurant.id,
      customerName: "سالم بن محفوظ",
      customerPhone: "771234567",
      pickupMode: "SCHEDULED",
      requestedPickupTime: laterToday,
      plannedPrepStartTime: prepStart,
      status: "QUEUED",
      subtotal: 9500,
      discount: 0,
      total: 9500,
      notes: "يرجى تحمير البيتزا جيداً",
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { nameEn: "Classic Pepperoni Pizza" } }))!.id,
            productNameAr: "بيتزا ببروني كلاسيك",
            productNameEn: "Classic Pepperoni Pizza",
            unitPrice: 4500,
            quantity: 1,
            subtotal: 9500,
            options: {
              create: [
                { groupNameAr: "الحجم", groupNameEn: "Size", nameAr: "كبير (Large - 10 قطع)", nameEn: "Large (10 Slices)", priceDelta: 4000 },
                { groupNameAr: "نوع العجينة", groupNameEn: "Crust Type", nameAr: "أطراف محشوة بجبنة الموزاريلا", nameEn: "Cheese Stuffed Crust", priceDelta: 1000 },
              ],
            },
          },
        ],
      },
      payment: {
        create: {
          method: "TRANSFER_KURAIMI",
          status: "VERIFIED",
          amount: 9500,
          referenceNumber: "KM-849201",
          verifiedAt: now,
          verifiedBy: "الكاشير",
        },
      },
    },
  });

  // Order 2: In oven right now (PREPARING)
  const inOvenPickup = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins from now
  await prisma.order.create({
    data: {
      orderNumber: "#PH-1025",
      restaurantId: restaurant.id,
      customerName: "عمر باحميد",
      customerPhone: "733445566",
      pickupMode: "ASAP",
      requestedPickupTime: inOvenPickup,
      plannedPrepStartTime: now,
      actualPrepStartTime: now,
      status: "PREPARING",
      subtotal: 7000,
      discount: 0,
      total: 7000,
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { nameEn: "Chicken Ranch Pizza" } }))!.id,
            productNameAr: "بيتزا دجاج رانش",
            productNameEn: "Chicken Ranch Pizza",
            unitPrice: 5000,
            quantity: 1,
            subtotal: 7000,
            options: {
              create: [
                { groupNameAr: "الحجم", groupNameEn: "Size", nameAr: "وسط (Medium - 8 قطع)", nameEn: "Medium (8 Slices)", priceDelta: 2000 },
              ],
            },
          },
        ],
      },
      payment: {
        create: {
          method: "PAY_AT_PICKUP",
          status: "UNPAID",
          amount: 7000,
        },
      },
    },
  });

  // Order 3: Pending verification (PAYMENT_PENDING) with uploaded receipt
  await prisma.order.create({
    data: {
      orderNumber: "#PH-1026",
      restaurantId: restaurant.id,
      customerName: "محمد العمودي",
      customerPhone: "777889900",
      pickupMode: "SCHEDULED",
      requestedPickupTime: new Date(now.getTime() + 1.5 * 60 * 60 * 1000),
      plannedPrepStartTime: new Date(now.getTime() + 1.2 * 60 * 60 * 1000),
      status: "PAYMENT_PENDING",
      subtotal: 6000,
      discount: 0,
      total: 6000,
      notes: "بدون بصل لو سمحتم",
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { nameEn: "Traditional Margherita" } }))!.id,
            productNameAr: "بيتزا مارجريتا الأصلية",
            productNameEn: "Traditional Margherita",
            unitPrice: 3500,
            quantity: 1,
            subtotal: 5500,
            options: {
              create: [
                { groupNameAr: "الحجم", groupNameEn: "Size", nameAr: "وسط (Medium - 8 قطع)", nameEn: "Medium (8 Slices)", priceDelta: 2000 },
              ],
            },
          },
        ],
      },
      payment: {
        create: {
          method: "TRANSFER_BUSAIRI",
          status: "PENDING_VERIFICATION",
          amount: 6000,
          referenceNumber: "BS-110293",
          receipt: {
            create: {
              fileUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Receipt_taebaek_restaurant_IMG_2614_modified.jpg/960px-Receipt_taebaek_restaurant_IMG_2614_modified.jpg",
              fileName: "receipt_sample.jpg",
              mimeType: "image/jpeg",
              fileSize: 166260,
            },
          },
        },
      },
    },
  });

  // Seed completed orders with customer testimonials (OrderFeedback)
  const pepperoniProd = await prisma.product.findFirst({ where: { nameEn: "Classic Pepperoni Pizza" } });
  const supremeProd = await prisma.product.findFirst({ where: { nameEn: "Pizza Nova Supreme Special" } });
  const ranchProd = await prisma.product.findFirst({ where: { nameEn: "Chicken Ranch Pizza" } });
  const margheritaProd = await prisma.product.findFirst({ where: { nameEn: "Traditional Margherita" } });

  const feedbacksData = [
    {
      orderNumber: "#PH-991",
      customerName: "أحمد سالم باوزير",
      customerPhone: "771234567",
      product: supremeProd || pepperoniProd!,
      unitPrice: 5500,
      total: 7500,
      mealRating: 5,
      serviceRating: 5,
      tags: "طازج وساخن, عجينة ممتازة, استلام سريع",
      comment: "أفضل بيتزا في المكلا بلا منازع! طلبت مسبقاً ووصلت الفرع واستلمتها ساخنة مقرمشة طازجة من الفرن بدون أي انتظار. الجبنة الموزاريلا واضحة أنها أصلية والعجينة خفيفة جداً.",
      daysAgo: 1,
    },
    {
      orderNumber: "#PH-992",
      customerName: "د. عمر بن عبد العزيز",
      customerPhone: "772345678",
      product: ranchProd || pepperoniProd!,
      unitPrice: 5000,
      total: 7000,
      mealRating: 5,
      serviceRating: 5,
      tags: "خدمة راقية, دقة الموعد, موقع مميز",
      comment: "موقع المطعم ممتاز في وسط المدينة. خدمة الطلب المسبق وفرت علينا وقتاً ثميناً بين المحاضرات. صوص الرانش والتحمير على الحجر متقن للغاية.",
      daysAgo: 2,
    },
    {
      orderNumber: "#PH-993",
      customerName: "أم عبدالله الكندي",
      customerPhone: "773456789",
      product: margheritaProd || pepperoniProd!,
      unitPrice: 3500,
      total: 5500,
      mealRating: 5,
      serviceRating: 5,
      tags: "جلسات عائلية مريحة, نظافة فائقة",
      comment: "زرنا قسم العوائل في الفرع الرئيسي، الجلسات مريحة وتوفر الخصوصية التامة للعائلات مع تكييف ممتاز. الأبناء استمتعوا جداً بطعم البيتزا والفطائر الساخنة.",
      daysAgo: 3,
    },
    {
      orderNumber: "#PH-994",
      customerName: "سالم بن دغار",
      customerPhone: "774567890",
      product: pepperoniProd!,
      unitPrice: 4500,
      total: 8500,
      mealRating: 5,
      serviceRating: 4,
      tags: "طعم إيطالي أصيل, تحويل كريمي سهل",
      comment: "دفعت عن طريق تطبيق بنك الكريمي حاسب بسهولة واستلمت الطلب في موعده تماماً. الخبز على الحجر يعطي نكهة مدخنة مميزة تختلف عن أي مطعم آخر بالمكلا.",
      daysAgo: 4,
    },
    {
      orderNumber: "#PH-995",
      customerName: "م. خالد باحيدرة",
      customerPhone: "775678901",
      product: ranchProd || supremeProd!,
      unitPrice: 5000,
      total: 7000,
      mealRating: 5,
      serviceRating: 5,
      tags: "كرنش ممتاز, صوصات رهيبة",
      comment: "الصوصات الجانبية خصوصاً الثومية والهلابينو ممتازة وتكمل الطعم. فكرة شاشة متابعة حالة الخبز في الفرن ذكية واحترافية. استمروا بهذا المستوى!",
      daysAgo: 5,
    },
  ];

  for (const item of feedbacksData) {
    const orderDate = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000);
    const order = await prisma.order.create({
      data: {
        orderNumber: item.orderNumber,
        restaurantId: restaurant.id,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        pickupMode: "SCHEDULED",
        requestedPickupTime: orderDate,
        plannedPrepStartTime: orderDate,
        actualPrepStartTime: orderDate,
        readyTime: orderDate,
        completedTime: orderDate,
        status: "COMPLETED",
        subtotal: item.total,
        discount: 0,
        total: item.total,
        createdAt: orderDate,
        items: {
          create: {
            productId: item.product.id,
            productNameAr: item.product.nameAr,
            productNameEn: item.product.nameEn,
            unitPrice: item.unitPrice,
            quantity: 1,
            subtotal: item.total,
          },
        },
        payment: {
          create: {
            method: "PAY_AT_PICKUP",
            status: "VERIFIED",
            amount: item.total,
            verifiedAt: orderDate,
          },
        },
        feedback: {
          create: {
            mealRating: item.mealRating,
            serviceRating: item.serviceRating,
            tags: item.tags,
            comment: item.comment,
            customerName: item.customerName,
            createdAt: orderDate,
          },
        },
      },
    });
  }

  console.log("✅ Seeded 5 completed orders with authentic customer feedback testimonials!");

  // 6. Seed Coupons
  await prisma.coupon.deleteMany();
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        titleAr: "خصم 10% للطلب الأول",
        titleEn: "10% Off First Order",
        titleId: "Diskon 10% Pesanan Pertama",
        descriptionAr: "خصم 10% عند طلبك بقيمة 8,000 ر.ي أو أكثر (حد أقصى للخصم 1,000 ر.ي)",
        descriptionEn: "10% discount on orders of 8,000 YER or more (max discount 1,000 YER)",
        descriptionId: "Diskon 10% untuk pesanan minimal 8.000 YER (maksimal diskon 1.000 YER)",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 8000,
        maxDiscount: 1000,
        isFirstOrderOnly: true,
        isActive: true,
        usageLimit: 500,
        usedCount: 14,
      },
      {
        code: "FAMILYBOX",
        titleAr: "خبز بالثوم والموزاريلا مجاناً",
        titleEn: "Free Cheesy Garlic Bread",
        titleId: "Roti Bawang Putih Keju Gratis",
        descriptionAr: "احصل على خبز بالثوم والموزاريلا مجاناً مع وجبات التوفير العائلية بقيمة 15,000 ر.ي فأكثر",
        descriptionEn: "Receive free cheesy garlic bread on family feast orders of 15,000 YER or more",
        descriptionId: "Dapatkan roti bawang putih keju gratis untuk pesanan 15.000 YER ke atas",
        discountType: "FREE_ITEM",
        discountValue: 0,
        freeItemNameAr: "خبز بالثوم والموزاريلا مجاناً",
        freeItemNameEn: "Free Cheesy Garlic Bread",
        minOrderAmount: 15000,
        isActive: true,
        usageLimit: 300,
        usedCount: 28,
      },
      {
        code: "MUKALLA500",
        titleAr: "خصم فوري 500 ر.ي",
        titleEn: "Instant 500 YER Discount",
        titleId: "Diskon Instan 500 YER",
        descriptionAr: "خصم فوري 500 ر.ي على جميع طلبات البيتزا بقيمة 6,000 ر.ي فأكثر",
        descriptionEn: "Instant 500 YER off on any order of 6,000 YER or more",
        descriptionId: "Diskon instan 500 YER untuk semua pesanan mulai dari 6.000 YER",
        discountType: "FIXED",
        discountValue: 500,
        minOrderAmount: 6000,
        isActive: true,
        usageLimit: 1000,
        usedCount: 62,
      },
      {
        code: "HADRAMOUT",
        titleAr: "عرض رواد وسط المدينة والطلاب 15%",
        titleEn: "15% Hadramout Community & Students Deal",
        titleId: "Promo Komunitas & Mahasiswa 15%",
        descriptionAr: "خصم 15% للطلاب وأهالي المدينة لطلبات 10,000 ر.ي فأكثر (حد أقصى 2,000 ر.ي)",
        descriptionEn: "15% student discount on 10,000+ YER orders (max 2,000 YER)",
        descriptionId: "Diskon 15% untuk mahasiswa untuk pesanan 10.000+ YER (maks 2.000 YER)",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderAmount: 10000,
        maxDiscount: 2000,
        isActive: true,
        usageLimit: 400,
        usedCount: 45,
      },
    ],
  });
  console.log("✅ Seeded 4 promotional coupons!");

  // 7. Seed Automatic Gifts
  await prisma.automaticGift.deleteMany();
  await prisma.automaticGift.createMany({
    data: [
      {
        nameAr: "خبز بالثوم والموزاريلا الساخن",
        nameEn: "Hot Cheesy Garlic Bread",
        nameId: "Roti Bawang Putih Keju Hangat",
        descriptionAr: "هدية مجانية تلقائية تضاف لسلتك عند تجاوز 12,000 ر.ي",
        descriptionEn: "Automatically added to your cart when spending 12,000 YER or more",
        minSpend: 12000,
        imageUrl: "https://images.unsplash.com/photo-1619895092538-128341789043?w=600&q=80",
        isActive: true,
        sortOrder: 1,
      },
      {
        nameAr: "فطيرة نوتيلا بالموز الفاخرة",
        nameEn: "Premium Nutella & Banana Fatayer",
        nameId: "Fatayer Nutella Pisang Premium",
        descriptionAr: "هدية تحلية فاخرة تضاف تلقائياً للطلبات الكبيرة عند بلوغ 20,000 ر.ي",
        descriptionEn: "A premium dessert gift automatically added on large orders of 20,000 YER or more",
        minSpend: 20000,
        imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80",
        isActive: true,
        sortOrder: 2,
      },
    ],
  });
  console.log("✅ Seeded 2 automatic gift tiers!");

  // 8. Seed Customer Loyalty Records
  await prisma.customerLoyalty.deleteMany();
  await prisma.customerLoyalty.createMany({
    data: [
      {
        customerPhone: "776248526",
        ordersCount: 5,
        totalSpent: 32000,
        rewardsEarned: 1,
        rewardsClaimed: 0,
        lastOrderAt: now,
      },
      {
        customerPhone: "771234567",
        ordersCount: 3,
        totalSpent: 18500,
        rewardsEarned: 0,
        rewardsClaimed: 0,
        lastOrderAt: now,
      },
    ],
  });
  console.log("✅ Seeded customer loyalty records!");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
