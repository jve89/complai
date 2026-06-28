"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BillingSection({ planName }: { planName: string }) {
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

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
          <p className="text-lg font-semibold">{planName}</p>
        </div>
        <Badge variant="secondary">Actief</Badge>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/pricing">Abonnement wijzigen</Link>
        </Button>
        <Button variant="outline" onClick={openPortal} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          Beheer facturatie
        </Button>
      </div>

      {notice && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {notice}
        </p>
      )}
    </div>
  );
}
