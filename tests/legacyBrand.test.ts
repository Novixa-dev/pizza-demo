import { describe, it, expect } from "vitest";
import { legacyBrandChanges, neutralizeLegacyBrand } from "../prisma/legacyBrand";

describe("legacy restaurant name cleanup", () => {
  it("rewrites the Arabic and English dish names", () => {
    expect(neutralizeLegacyBrand("بيتزا هاوس سوبريم الخاصة")).toBe("بيتزا نوڤا سوبريم الخاصة");
    expect(neutralizeLegacyBrand("Pizza House Supreme Special")).toBe("Pizza Nova Supreme Special");
  });

  it("rewrites the name inside a longer description, including the attached ب prefix", () => {
    expect(neutralizeLegacyBrand("وصلصة الطماطم الإيطالية الخاصة ببيتزا هاوس على عجينة طازجة.")).toBe(
      "وصلصة الطماطم الإيطالية الخاصة ببيتزا نوڤا على عجينة طازجة.",
    );
  });

  it("is case-insensitive for Latin text and tolerant of extra whitespace", () => {
    expect(neutralizeLegacyBrand("pizza   house deal")).toBe("Pizza Nova deal");
    expect(neutralizeLegacyBrand("PIZZA HOUSE")).toBe("Pizza Nova");
  });

  it("leaves unrelated text and the demo name alone, so a rerun changes nothing", () => {
    for (const text of ["بيتزا نوڤا سوبريم الخاصة", "Pizza Nova Supreme Special", "Classic Pepperoni Pizza", ""]) {
      expect(neutralizeLegacyBrand(text)).toBe(text);
    }
    const once = neutralizeLegacyBrand("Pizza House Supreme Special");
    expect(neutralizeLegacyBrand(once)).toBe(once);
  });
});

describe("legacyBrandChanges", () => {
  const product = {
    id: "p1",
    nameAr: "بيتزا هاوس سوبريم الخاصة",
    nameEn: "Pizza House Supreme Special",
    descriptionAr: "مزيج متكامل من قطع اللحم والدجاج",
    descriptionEn: "The ultimate house specialty",
    basePrice: 5500,
  };

  it("returns only the columns that actually change", () => {
    expect(legacyBrandChanges(product, ["nameAr", "nameEn", "descriptionAr", "descriptionEn"])).toEqual({
      nameAr: "بيتزا نوڤا سوبريم الخاصة",
      nameEn: "Pizza Nova Supreme Special",
    });
  });

  it("returns null when the row is already clean so no write is issued", () => {
    const clean = { ...product, nameAr: "بيتزا نوڤا سوبريم الخاصة", nameEn: "Pizza Nova Supreme Special" };
    expect(legacyBrandChanges(clean, ["nameAr", "nameEn", "descriptionAr", "descriptionEn"])).toBeNull();
  });

  it("ignores non-text columns", () => {
    expect(legacyBrandChanges(product, ["basePrice" as never])).toBeNull();
  });
});
