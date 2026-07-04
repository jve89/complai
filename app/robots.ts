import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Pre-launch: keep the whole site out of search until ALLOW_INDEXING=true.
  if (!env.allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
