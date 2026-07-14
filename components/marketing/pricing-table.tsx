"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";

import { PLANS, type PlanId } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatEuro } from "@/lib/utils";

type Interval = "month" | "year";

export function PricingTable({ scanId }: { scanId?: string }) {
  const [interval, setInterval] = useState<Interval>("month");
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);
  const [, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  function checkout(planId: PlanId) {
    setNotice(null);
    setPendingPlan(planId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, interval }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        // Account-first: no account yet → sign up, then continue to checkout.
        // A scan that led here travels along, so signup still claims it.
        if (data.needsAccount) {
          const scan = scanId ? `&scan=${encodeURIComponent(scanId)}` : "";
          window.location.href = `/signup?plan=${planId}&interval=${interval}${scan}`;
          return;
        }
        setNotice(data.message ?? "Afrekenen is momenteel niet beschikbaar.");
      } catch {
        setNotice("Er ging iets mis. Probeer het later opnieuw.");
      } finally {
        setPendingPlan(null);
      }
    });
  }

  return (
    <div>
      {/* Interval toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span
          className={cn(
            "text-sm",
            interval === "month" ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          Maandelijks
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={interval === "year"}
          onClick={() => setInterval((i) => (i === "month" ? "year" : "month"))}
          className={cn(
            "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
            interval === "year" ? "bg-primary" : "bg-muted-foreground/30"
          )}
        >
          <span
            className="pointer-events-none absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ease-in-out"
            style={{ left: interval === "year" ? 22 : 2 }}
          />
        </button>
        <span
          className={cn(
            "flex items-center gap-2 text-sm",
            interval === "year" ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          Jaarlijks
          <Badge variant="success">2 maanden gratis</Badge>
        </span>
      </div>

      {notice && (
        <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
          {notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isYear = interval === "year";
          const perMonth =
            plan.monthly === 0 ? 0 : isYear ? plan.yearly / 12 : plan.monthly;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-xl border bg-card p-6",
                plan.highlighted && "border-2 border-brand-500 shadow-lg"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-6">Aanbevolen</Badge>
              )}

              <h3 className="font-semibold">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                {plan.monthly === 0 ? (
                  <span className="text-3xl font-bold">Gratis</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">€{formatEuro(perMonth)}</span>
                    <span className="text-sm text-muted-foreground">/mnd</span>
                  </>
                )}
              </div>
              <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs text-muted-foreground">
                {plan.monthly === 0
                  ? "Geen betaalgegevens nodig — geen abonnement"
                  : isYear
                    ? `€${formatEuro(plan.yearly)}/jaar, jaarlijks gefactureerd`
                    : "Maandelijks opzegbaar"}
              </p>

              {/* Fixed to 3 lines (not just a minimum) so every card reserves
                  identical space here regardless of tagline length — otherwise
                  the longest tagline pushes its button lower than the rest. */}
              <p className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm text-muted-foreground">
                {plan.tagline}
              </p>

              {plan.id === "free" ? (
                <Button asChild variant="outline" className="mt-5 w-full">
                  <Link href="/scan">Doe de gratis scan</Link>
                </Button>
              ) : (
                <Button
                  className="mt-5 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => checkout(plan.id)}
                  disabled={pendingPlan !== null}
                >
                  {pendingPlan === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Kies ${plan.name}`
                  )}
                </Button>
              )}

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
