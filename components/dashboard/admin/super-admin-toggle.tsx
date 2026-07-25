"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { setSuperAdmin } from "@/app/dashboard/admin/actions";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

/**
 * Grant/revoke super-admin from the Alle personen table via an on/off switch.
 * `fixed` = granted via the env allowlist (can't be changed here); `isSelf` =
 * the current user. Both render a read-only badge instead of the switch.
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

  function toggle(next: boolean) {
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
    <span className="inline-flex items-center gap-2">
      <Switch
        checked={on}
        onCheckedChange={toggle}
        disabled={isPending}
        aria-label={
          on
            ? `Super-admin-rechten van ${name} intrekken`
            : `${name} super-admin maken`
        }
      />
      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      )}
    </span>
  );
}
