"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

import { setCompanyPlan } from "@/app/dashboard/admin/actions";
import { TIER_LABEL, TIER_ORDER } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";
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
  companyId,
  currentTier,
}: {
  planLabel: string;
  planStatus?: string | null;
  hasSubscription: boolean;
  renewsAt?: string | null;
  /** Scheduled to end at period end (still active until then). */
  canceling?: boolean;
  /** ComplAI staff: swap the paying-customer controls for a plan switcher. */
  isSuperAdmin?: boolean;
  companyId: string;
  currentTier: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState(currentTier);

  // ComplAI staff never pay: instead of the Stripe controls, show that access is
  // internal and let a super-admin switch to ANY tier directly. setCompanyPlan is
  // super-admin-gated and staff companies are exempt from Stripe reconciliation,
  // so the choice sticks. No trial/billing UI here.
  if (isSuperAdmin) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border bg-secondary/30 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Huidig abonnement</p>
            <p className="text-lg font-semibold">{planLabel}</p>
            <p className="text-xs text-muted-foreground">
              ComplAI-staff — volledige toegang, geen betaling nodig.
            </p>
          </div>
          <Badge variant="secondary">Interne toegang</Badge>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">
              Wissel van pakket (alleen staff)
            </span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              disabled={isPending}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              {TIER_ORDER.map((tier) => (
                <option key={tier} value={tier}>
                  {TIER_LABEL[tier]}
                </option>
              ))}
            </select>
          </label>
          <Button
            onClick={() => {
              setNotice(null);
              startTransition(async () => {
                const res = await setCompanyPlan(companyId, selected);
                if (res.ok) {
                  setNotice(`Pakket ingesteld op ${TIER_LABEL[selected as TierId]}.`);
                  router.refresh();
                } else {
                  setNotice(res.error ?? "Kon het pakket niet wijzigen.");
                }
              });
            }}
            disabled={isPending || selected === currentTier}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Toepassen
          </Button>
        </div>

        {notice && (
          <p className="rounded-md border bg-secondary/30 p-3 text-sm text-muted-foreground">
            {notice}
          </p>
        )}
      </div>
    );
  }

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
        <Badge variant={status?.variant ?? "secondary"}>
          {status?.label ?? "Gratis"}
        </Badge>
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
