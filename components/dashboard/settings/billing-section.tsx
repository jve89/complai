"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  active: { label: "Actief", variant: "success" },
  // No trials anymore — a legacy trialing subscription still grants access, so
  // show it as active rather than advertising a "Proefperiode" we don't offer.
  trialing: { label: "Actief", variant: "success" },
  past_due: { label: "Betaling mislukt", variant: "warning" },
  canceled: { label: "Opgezegd", variant: "secondary" },
};

export function BillingSection({
  planLabel,
  planStatus,
  hasSubscription,
  renewsAt,
  canceling = false,
  isSuperAdmin = false,
}: {
  planLabel: string;
  planStatus?: string | null;
  hasSubscription: boolean;
  renewsAt?: string | null;
  /** Scheduled to end at period end (still active until then). */
  canceling?: boolean;
  /** ComplAI staff: adds an "Interne toegang" badge. The controls stay identical
   *  to a client's — plan switching lives in ComplAI-beheer, not here. */
  isSuperAdmin?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  // A scheduled cancellation overrides the raw status: the sub is still
  // trialing/active but will end, so show that honestly.
  const status = canceling
    ? ({ label: "Wordt opgezegd", variant: "warning" } as const)
    : hasSubscription && planStatus
      ? STATUS_LABEL[planStatus]
      : null;
  // Only a still-granting subscription can be switched or cancelled in the
  // portal; a canceled/lapsed one should re-pick a plan instead.
  const isActive =
    hasSubscription && ["active", "trialing", "past_due"].includes(planStatus ?? "");

  function openPortal(flow?: "update" | "cancel") {
    setNotice(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flow ? { flow } : {}),
        });
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
              {canceling || planStatus === "canceled" ? "Toegang tot" : "Verlengt op"} {renewsAt}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isSuperAdmin && <Badge variant="secondary">Interne toegang</Badge>}
          <Badge variant={status?.variant ?? "secondary"}>
            {status?.label ?? "Gratis"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {isActive ? (
          <>
            <Button onClick={() => openPortal("update")} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Abonnement wijzigen
            </Button>
            <Button variant="outline" onClick={() => openPortal()} disabled={isPending}>
              <CreditCard className="h-4 w-4" />
              Facturen & betaalgegevens
            </Button>
            {!canceling && (
              <Button
                variant="ghost"
                onClick={() => openPortal("cancel")}
                disabled={isPending}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:ml-auto"
              >
                Abonnement opzeggen
              </Button>
            )}
          </>
        ) : (
          <>
            <Button asChild>
              <Link href="/pricing">Kies een pakket</Link>
            </Button>
            {hasSubscription && (
              <Button variant="outline" onClick={() => openPortal()} disabled={isPending}>
                <CreditCard className="h-4 w-4" />
                Facturen & betaalgegevens
              </Button>
            )}
          </>
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
