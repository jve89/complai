"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { setSuperAdmin } from "@/app/dashboard/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Grant/revoke super-admin from the Alle personen table. `fixed` = granted via
 * the env allowlist (can't be changed here); `isSelf` = the current user.
 */
export function SuperAdminToggle({
  userId,
  name,
  isSuper,
  fixed,
  isSelf,
}: {
  userId: string;
  name: string;
  isSuper: boolean;
  fixed: boolean;
  isSelf: boolean;
}) {
  const [on, setOn] = useState(isSuper);
  const [isPending, startTransition] = useTransition();

  if (fixed) {
    return (
      <Badge variant="secondary" className="gap-1">
        <ShieldCheck className="h-3 w-3" /> super-admin (vast)
      </Badge>
    );
  }
  if (isSelf) {
    return (
      <Badge variant="secondary" className="gap-1">
        <ShieldCheck className="h-3 w-3" /> u
      </Badge>
    );
  }

  function toggle() {
    const next = !on;
    const ok = confirm(
      next
        ? `${name} super-admin maken? Zij krijgen dan toegang tot álle klanten.`
        : `Super-admin-rechten van ${name} intrekken?`
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await setSuperAdmin(userId, next);
      if (res.ok) setOn(next);
      else alert(res.error);
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={on ? "secondary" : "ghost"}
      onClick={toggle}
      disabled={isPending}
      className={on ? "gap-1" : "gap-1 text-muted-foreground"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShieldCheck className="h-4 w-4" />
      )}
      {on ? "Super-admin" : "Maak super-admin"}
    </Button>
  );
}
