import Link from "next/link";

import { SiteLogo } from "@/components/site-logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/scan", label: "Risicoscan" },
      { href: "/demo/register", label: "AI-register" },
      { href: "/demo/documents", label: "Documenten" },
      { href: "/demo/training", label: "E-learning" },
      { href: "/demo/kennisbank", label: "Kennisbank" },
      { href: "/pricing", label: "Prijzen" },
    ],
  },
  {
    title: "Hulpbronnen",
    links: [
      { href: "/kennisbank", label: "Kennisbank" },
      { href: "/updates", label: "Updates" },
      { href: "/kwaliteit", label: "Kwaliteit & bronnen" },
      { href: "/demo", label: "Demo bekijken" },
      { href: "/#hoe-het-werkt", label: "Hoe het werkt" },
      { href: "/#faq", label: "Veelgestelde vragen" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Bedrijf",
    links: [
      { href: "/over-ons", label: "Over ons" },
      { href: "/login", label: "Inloggen" },
      { href: "/signup", label: "Gratis starten" },
    ],
  },
  {
    title: "Juridisch",
    links: [
      { href: "/privacy", label: "Privacyverklaring" },
      { href: "/voorwaarden", label: "Algemene voorwaarden" },
      { href: "/verwerkersovereenkomst", label: "Verwerkersovereenkomst" },
      { href: "/cookies", label: "Cookiebeleid" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-white">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <SiteLogo className="text-white" />
          <p className="max-w-xs text-sm text-white/60">
            Eén werkomgeving om te werken aan naleving van de EU AI Act — van de
            eerste risicoscan tot doorlopende governance.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="space-y-3">
            <h4 className="text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link, i) => (
                <li key={`${link.label}-${i}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/50 sm:flex-row">
          <p>© 2026 ComplAI. Alle rechten voorbehouden.</p>
          <p>Voor het Nederlandse mkb · Niet bedoeld als juridisch advies.</p>
        </div>
      </div>
    </footer>
  );
}
