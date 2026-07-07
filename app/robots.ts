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
      // Private/app surfaces + the read-only demo (thin, duplicate of the app).
      disallow: ["/dashboard/", "/api/", "/auth/", "/demo/"],
    },
    sitemap: `${env.appUrl}/sitemap.xml`,
    host: env.appUrl,
  };
}
