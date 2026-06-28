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
    default: "ComplAI — Word AI Act-compliant zonder advieskosten",
    template: "%s · ComplAI",
  },
  description:
    "ComplAI helpt Nederlandse mkb-organisaties stap voor stap voldoen aan de EU AI Act: risicoscan, AI-register, documenten, e-learning en governance vanuit één omgeving.",
  keywords: ["EU AI Act", "AI compliance", "AI-register", "risicoscan", "FRIA", "AI governance"],
  openGraph: {
    title: "ComplAI — Word AI Act-compliant zonder advieskosten",
    description:
      "Scan uw risico's, leg uw AI-systemen vast, genereer de verplichte documenten en maak uw team AI-vaardig — alles op één plek.",
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
