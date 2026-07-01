"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  active: { label: "Actief", variant: "success" },
  trialing: { label: "Proefperiode", variant: "success" },
  past_due: { label: "Betaling mislukt", variant: "warning" },
  canceled: { label: "Opgezegd", variant: "secondary" },
};

export function BillingSection({
  planLabel,
  planStatus,
  hasSubscription,
  renewsAt,
}: {
  planLabel: string;
  planStatus?: string | null;
  hasSubscription: boolean;
  renewsAt?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const status = hasSubscription && planStatus ? STATUS_LABEL[planStatus] : null;

  function openPortal() {
    setNotice(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/portal", { method: "POST" });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setNotice(data.message ?? "Facturatieportaal is niet beschikbaar.");
      } catch {
        setNotice("Er ging iets mis. Probeer het later opnieuw.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-secondary/30 p-4">
        <div>
          <p className="text-sm text-muted-foreground">Huidig abonnement</p>
          <p className="text-lg font-semibold">{planLabel}</p>
          {hasSubscription && renewsAt && (
            <p className="text-xs text-muted-foreground">
              {planStatus === "canceled" ? "Toegang tot" : "Verlengt op"} {renewsAt}
            </p>
          )}
        </div>
        <Badge variant={status?.variant ?? "secondary"}>
          {status?.label ?? "Gratis"}
        </Badge>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/pricing">
            {hasSubscription ? "Abonnement wijzigen" : "Kies een plan"}
          </Link>
        </Button>
        {hasSubscription && (
          <Button variant="outline" onClick={openPortal} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Beheer facturatie
          </Button>
        )}
      </div>

      {notice && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {notice}
        </p>
      )}
    </div>
  );
}
