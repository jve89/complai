import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";

import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata: Metadata = {
  title: "Prijzen",
  description:
    "Wat kost AI Act-compliance? Begin kosteloos met de Scan en stap door naar Basis, Compliance of Audit zodra uw situatie daarom vraagt.",
  alternates: { canonical: "/pricing" },
};

const COLUMNS = ["Scan", "Basis", "Compliance", "Audit"];
const HIGHLIGHT = "Compliance";

const COMPARISON: { feature: string; values: (string | boolean)[] }[] = [
  { feature: "Risicoscan + PDF-rapport", values: [true, true, true, true] },
  { feature: "AI-register", values: [false, "Max. 3", "Max. 10", "Onbeperkt"] },
  { feature: "AI-beleid + transparantieverklaring", values: [false, true, true, true] },
  { feature: "FRIA + risicobeoordeling (gebruik hoog-risico AI)", values: [false, false, true, true] },
  { feature: "Technische documentatie, conformiteit, GPAI (aanbieder)", values: [false, false, false, true] },
  { feature: "E-learning & certificaten", values: [false, false, true, true] },
  { feature: "Gebruikers", values: ["1", "5", "25", "Onbeperkt"] },
  { feature: "Ondersteuning", values: ["—", "E-mail", "Prioriteit", "Persoonlijk"] },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "string") return <span className="text-sm">{value}</span>;
  return value ? (
    <Check className="mx-auto h-5 w-5 text-brand-600" />
  ) : (
    <Minus className="mx-auto h-5 w-5 text-muted-foreground/40" />
  );
}

export default function PricingPage({
  searchParams,
}: {
  searchParams: { scan?: string };
}) {
  return (
    <>
      <section className="border-b bg-navy-900 py-16 text-center text-white">
        <div className="container">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Wat u vooraf ziet, is wat u betaalt.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            De risicoscan is gratis. Het volledige platform neemt u erbij op het moment dat het u past.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <PricingTable scanId={searchParams.scan} />
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t bg-secondary/40 py-16">
        <div className="container">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">
            Alle plannen naast elkaar
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Functie
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className={
                        col === HIGHLIGHT
                          ? "p-4 text-center text-sm font-semibold text-brand-700"
                          : "p-4 text-center text-sm font-medium"
                      }
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-t bg-card">
                    <td className="p-4 text-sm font-medium">{row.feature}</td>
                    {row.values.map((value, i) => (
                      <td
                        key={i}
                        className={
                          COLUMNS[i] === HIGHLIGHT
                            ? "bg-brand-50/50 p-4 text-center"
                            : "p-4 text-center"
                        }
                      >
                        <Cell value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Bedragen zijn exclusief btw. Maandabonnementen kunt u elke maand opzeggen. Betaalt u per jaar, dan zijn twee maanden gratis.
          </p>
        </div>
      </section>
    </>
  );
}
