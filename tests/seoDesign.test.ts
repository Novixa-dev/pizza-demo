import { describe, it, expect } from "vitest";
import { siteMetadata, jsonLdRestaurantData } from "@/lib/seoConfig";

describe("Theme, Design & SEO Comprehensive Verification", () => {
  it("defines robust OpenGraph and SEO metadata in root layout", () => {
    expect(siteMetadata.title).toBeDefined();
    expect(String(siteMetadata.title)).toContain("بيتزا هاوس المكلا");
    expect(siteMetadata.description).toBeDefined();
    expect(siteMetadata.openGraph).toBeDefined();
    expect((siteMetadata.openGraph as any)?.type).toBe("website");
    expect(siteMetadata.openGraph?.locale).toBe("ar_YE");
    expect(siteMetadata.twitter).toBeDefined();
    expect((siteMetadata.twitter as any)?.card).toBe("summary_large_image");
  });

  it("provides canonical URL and alternates", () => {
    expect(siteMetadata.alternates?.canonical).toBe("/");
    expect(siteMetadata.metadataBase?.toString()).toBe("https://pizza-house.novixa.dev/");
  });

  it("includes valid keywords matching Mukalla and Pizza House branding", () => {
    const keywords = (siteMetadata.keywords as string[]) || [];
    expect(keywords).toContain("بيتزا هاوس المكلا");
    expect(keywords).toContain("حي المساكن فوه");
    expect(keywords.some((k) => k.toLowerCase().includes("pizza"))).toBe(true);
  });

  it("validates Schema.org JSON-LD structured data coordinates and currency", () => {
    expect(jsonLdRestaurantData.name).toContain("Pizza House");
    expect(jsonLdRestaurantData.geo.latitude).toBeCloseTo(14.4892, 2);
    expect(jsonLdRestaurantData.geo.longitude).toBeCloseTo(49.0445, 2);
    expect(jsonLdRestaurantData.currenciesAccepted).toBe("YER");
    // Self-declared review aggregates violate Google's review-snippet policy; ratings come from real feedback only.
    expect("aggregateRating" in jsonLdRestaurantData).toBe(false);
    expect(jsonLdRestaurantData.url).toBe("https://pizza-house.novixa.dev");
  });
});

