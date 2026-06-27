import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/scan", "/pricing", "/login", "/signup"];
  return routes.map((route) => ({
    url: `${env.appUrl}${route}`,
    lastModified: new Date("2026-06-27"),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
