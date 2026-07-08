import { env } from "@/lib/env";

/**
 * Organization + WebSite JSON-LD for the homepage. Gives search engines the
 * canonical site name, logo and language so a branded/rich result can show.
 * No SearchAction: there is no site-wide search endpoint to point it at.
 * Only emitted when indexing is allowed — no point advertising a hidden site.
 */
export function StructuredData() {
  if (!env.allowIndexing) return null;

  const base = env.appUrl;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "ComplAI",
        url: base,
        logo: `${base}/icon.svg`,
        email: "info@complai-eu.nl",
        description:
          "ComplAI helpt Nederlandse mkb-organisaties werken aan naleving van de EU AI Act: risicoscan, AI-register, verplichte documenten, e-learning en governance vanuit één omgeving.",
        areaServed: "NL",
        knowsLanguage: "nl-NL",
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "ComplAI",
        inLanguage: "nl-NL",
        publisher: { "@id": `${base}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user data is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
