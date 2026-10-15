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
    expect(siteMetadata.title).toContain("بيتزا نوڤا");
    expect(siteMetadata.description).toContain("وسط المدينة");
    expect(siteMetadata.description).toContain("وسط المدينة");
    expect(siteMetadata.keywords).toContain("novixa");
    expect(siteMetadata.keywords).toContain("خريطة بيتزا نوڤا");
    expect(siteMetadata.twitter?.site).toBe("@novixa");
    expect(siteMetadata.openGraph?.siteName).toContain("@novixa");

    // Dynamic OG images
    const ogImages = siteMetadata.openGraph?.images as any[];
    expect(ogImages).toBeDefined();
    expect(ogImages.some((img) => img.url === "/og-image.jpg")).toBe(true);

    // Other restaurant meta
    expect(siteMetadata.other?.["restaurant:contact_info:street_address"]).toBeTruthy();
    expect(siteMetadata.other?.["place:location:latitude"]).toBe("14.5425");
  });

  it("verifies Schema.org JSON-LD LocalBusiness structured data enhancements", () => {
    expect(jsonLdRestaurantData["@type"]).toContain("Restaurant");
    expect(jsonLdRestaurantData["@type"]).toContain("LocalBusiness");
    expect(jsonLdRestaurantData.alternateName).toContain("novixa");
    expect(jsonLdRestaurantData.sameAs).toContain("https://www.facebook.com/profile.php?id=61594556255556");
    expect(jsonLdRestaurantData.sameAs).toContain("https://www.google.com/maps/search/?api=1&query=Mukalla");
    expect(jsonLdRestaurantData.hasMap).toBe("https://www.google.com/maps/search/?api=1&query=Mukalla");

    // Coordinates check
    expect(jsonLdRestaurantData.geo.latitude).toBeCloseTo(14.5425, 2);
    expect(jsonLdRestaurantData.geo.longitude).toBeCloseTo(49.1242, 2);

    // Contact points & amenities
    expect(jsonLdRestaurantData.telephone).toBe("+967-5-000000");
    expect(jsonLdRestaurantData.contactPoint.length).toBeGreaterThanOrEqual(2);
    expect(jsonLdRestaurantData.address.postalCode).toBe("Demo");
    expect(jsonLdRestaurantData.amenityFeature.length).toBeGreaterThanOrEqual(3);
    expect(jsonLdRestaurantData.servesBreakfast).toBe(true);
    expect(jsonLdRestaurantData.servesDinner).toBe(true);
  });

  it("verifies Arabic dictionary has complete location and Instagram definitions", () => {
    const locAr = dictionaries.ar.location;
    expect(locAr.openInGoogleMaps).toBe("فتح في خرائط Google");
    expect(locAr.instagramHandle).toBe("@novixa");
    expect(locAr.plusCode).toBe("Mukalla, Yemen");
    expect(locAr.landline).toBe("05-000000");
    expect(locAr.whatsapp).toBe("700000000");
    expect(locAr.familyHall).toBeTruthy();
    expect(locAr.youthHall).toBeTruthy();
  });

  it("verifies English dictionary has complete location and Instagram definitions", () => {
    const locEn = dictionaries.en.location;
    expect(locEn.openInGoogleMaps).toBe("Open in Google Maps");
    expect(locEn.instagramHandle).toBe("@novixa");
    expect(locEn.plusCode).toBe("Mukalla, Yemen");
    expect(locEn.landline).toBe("05-000000");
    expect(locEn.whatsapp).toBe("700000000");
    expect(locEn.familyHall).toBeTruthy();
    expect(locEn.youthHall).toBeTruthy();
  });
});
