import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { IS_DEMO } from "@/components/shared/DemoBanner";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  // The public demo must not compete in search results with real restaurants.
  if (IS_DEMO) {
    return { rules: [{ userAgent: "*", disallow: ["/"] }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/admin", "/kitchen", "/api/", "/checkout", "/profile", "/orders"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
