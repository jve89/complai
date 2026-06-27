import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "ComplAI — Grip op uw AI. Klaar voor de AI Act.",
    template: "%s · ComplAI",
  },
  description:
    "ComplAI helpt Nederlandse organisaties om compliant te worden met de EU AI Act: risicoscan, AI-register, documentgeneratie, e-learning en governance in één platform.",
  keywords: ["EU AI Act", "AI compliance", "AI-register", "risicoscan", "FRIA", "AI governance"],
  openGraph: {
    title: "ComplAI — Klaar voor de AI Act",
    description:
      "Risicoscan, AI-register, documenten, e-learning en governance. Word compliant met de EU AI Act.",
    locale: "nl_NL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
