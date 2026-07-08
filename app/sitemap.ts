import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

type Entry = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-04");

  // Public, indexable routes. Higher priority for the pages that drive
  // conversion and organic search; legal pages are indexable but low priority.
  const entries: Entry[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/scan", priority: 0.9, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/kennisbank", priority: 0.8, changeFrequency: "weekly" },
    { path: "/kwaliteit", priority: 0.6, changeFrequency: "monthly" },
    { path: "/over-ons", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    { path: "/login", priority: 0.4, changeFrequency: "yearly" },
    { path: "/signup", priority: 0.5, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/voorwaarden", priority: 0.3, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
    { path: "/verwerkersovereenkomst", priority: 0.3, changeFrequency: "yearly" },
  ];

  return entries.map(({ path, priority, changeFrequency }) => ({
    url: `${env.appUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
