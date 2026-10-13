import { describe, it, expect } from "vitest";
import { siteMetadata, siteViewport, jsonLdRestaurantData } from "@/lib/seoConfig";
import { dictionaries } from "@/lib/i18n/dictionaries";

describe("Location, Google Maps, Instagram & SEO Suite", () => {
  it("verifies optimized mobile viewport settings", () => {
    expect(siteViewport.width).toBe("device-width");
    expect(siteViewport.initialScale).toBe(1);
    expect(siteViewport.maximumScale).toBe(5);
    expect(siteViewport.userScalable).toBe(true);
    expect(siteViewport.viewportFit).toBe("cover");
    expect(Array.isArray(siteViewport.themeColor)).toBe(true);
  });

  it("verifies siteMetadata includes dynamic OG imagery and social tags", () => {
    expect(siteMetadata.title).toContain("بيتزا هاوس المكلا");
    expect(siteMetadata.description).toContain("فوه");
    expect(siteMetadata.description).toContain("حي المساكن");
    expect(siteMetadata.keywords).toContain("pizza_house66");
    expect(siteMetadata.keywords).toContain("خريطة بيتزا هاوس المكلا");
    expect(siteMetadata.twitter?.site).toBe("@pizza_house66");
    expect(siteMetadata.openGraph?.siteName).toContain("@pizza_house66");

    // Dynamic OG images
    const ogImages = siteMetadata.openGraph?.images as any[];
    expect(ogImages).toBeDefined();
    expect(ogImages.some((img) => img.url === "/og-image.jpg")).toBe(true);

    // Other restaurant meta
    expect(siteMetadata.other?.["restaurant:contact_info:street_address"]).toBeTruthy();
    expect(siteMetadata.other?.["place:location:latitude"]).toBe("14.4892");
  });

  it("verifies Schema.org JSON-LD LocalBusiness structured data enhancements", () => {
    expect(jsonLdRestaurantData["@type"]).toContain("Restaurant");
    expect(jsonLdRestaurantData["@type"]).toContain("LocalBusiness");
    expect(jsonLdRestaurantData.alternateName).toContain("pizza_house66");
    expect(jsonLdRestaurantData.sameAs).toContain("https://www.instagram.com/pizza_house66/");
    expect(jsonLdRestaurantData.sameAs).toContain("https://maps.app.goo.gl/zre73sxKGyM27KvE6");
    expect(jsonLdRestaurantData.hasMap).toBe("https://maps.app.goo.gl/zre73sxKGyM27KvE6");

    // Coordinates check
    expect(jsonLdRestaurantData.geo.latitude).toBeCloseTo(14.4892, 2);
    expect(jsonLdRestaurantData.geo.longitude).toBeCloseTo(49.0445, 2);

    // Contact points & amenities
    expect(jsonLdRestaurantData.telephone).toBe("+967-5-375561");
    expect(jsonLdRestaurantData.contactPoint.length).toBeGreaterThanOrEqual(2);
    expect(jsonLdRestaurantData.address.postalCode).toBe("F2QV+HPW");
    expect(jsonLdRestaurantData.amenityFeature.length).toBeGreaterThanOrEqual(3);
    expect(jsonLdRestaurantData.servesBreakfast).toBe(true);
    expect(jsonLdRestaurantData.servesDinner).toBe(true);
  });

  it("verifies Arabic dictionary has complete location and Instagram definitions", () => {
    const locAr = dictionaries.ar.location;
    expect(locAr.openInGoogleMaps).toBe("فتح في خرائط Google");
    expect(locAr.instagramHandle).toBe("@pizza_house66");
    expect(locAr.plusCode).toBe("F2QV+HPW, Fuh, Yemen");
    expect(locAr.landline).toBe("05-375561");
    expect(locAr.whatsapp).toBe("772207788");
    expect(locAr.familyHall).toBeTruthy();
    expect(locAr.youthHall).toBeTruthy();
  });

  it("verifies English dictionary has complete location and Instagram definitions", () => {
    const locEn = dictionaries.en.location;
    expect(locEn.openInGoogleMaps).toBe("Open in Google Maps");
    expect(locEn.instagramHandle).toBe("@pizza_house66");
    expect(locEn.plusCode).toBe("F2QV+HPW, Fuh, Yemen");
    expect(locEn.landline).toBe("05-375561");
    expect(locEn.whatsapp).toBe("772207788");
    expect(locEn.familyHall).toBeTruthy();
    expect(locEn.youthHall).toBeTruthy();
  });
});
