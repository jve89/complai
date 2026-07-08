import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

import { CookieConsent } from "@/components/cookie-consent";
import { env } from "@/lib/env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "ComplAI — Word AI Act-compliant zonder advieskosten",
    template: "%s · ComplAI",
  },
  description:
    "ComplAI helpt Nederlandse mkb-organisaties stap voor stap werken aan naleving van de EU AI Act: risicoscan, AI-register, documenten, e-learning en governance vanuit één omgeving.",
  keywords: ["EU AI Act", "AI compliance", "AI-register", "risicoscan", "FRIA", "AI governance"],
  // Held out of search until launch (flip ALLOW_INDEXING=true in Vercel).
  robots: env.allowIndexing ? undefined : { index: false, follow: false },
  // Optional HTML-tag verification for Search Console / Bing. Left empty unless
  // the token env vars are set (DNS verification needs neither).
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : {},
  },
  alternates: { canonical: "/" },
  applicationName: "ComplAI",
  openGraph: {
    title: "ComplAI — Word AI Act-compliant zonder advieskosten",
    description:
      "Scan uw risico's, leg uw AI-systemen vast, genereer de verplichte documenten en maak uw team AI-vaardig — alles op één plek.",
    url: "/",
    siteName: "ComplAI",
    locale: "nl_NL",
    type: "website",
    // og:image is provided automatically by app/opengraph-image.tsx.
  },
  twitter: {
    card: "summary_large_image",
    title: "ComplAI — Word AI Act-compliant zonder advieskosten",
    description:
      "De EU AI Act begrijpelijk en behapbaar voor het Nederlandse mkb — risicoscan, AI-register, documenten, e-learning en governance op één plek.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <CookieConsent />
        {/* Vercel telemetry — cookieless, production-only, no consent needed. */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
