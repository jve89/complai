"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

import { setUserRole } from "@/app/dashboard/admin/actions";

const ROLES: Array<[string, string]> = [
  ["admin", "Beheerder"],
  ["manager", "Manager"],
  ["employee", "Medewerker"],
];
const LABEL: Record<string, string> = Object.fromEntries(ROLES);

export function RoleSelect({
  userId,
  name,
  role,
}: {
  userId: string;
  name: string;
  role: string;
}) {
  const [current, setCurrent] = useState(role);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function change(next: string) {
    if (next === current) return;
    if (!confirm(`Rol van ${name} wijzigen naar ${LABEL[next]}?`)) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await setUserRole(userId, next);
      if (res.ok) {
        setCurrent(next);
        setSaved(true);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={`Rol voor ${name}`}
        value={current}
        onChange={(e) => change(e.target.value)}
        disabled={isPending}
        className="rounded-md border bg-background px-2 py-1 text-sm"
      >
        {ROLES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : saved ? (
        <Check className="h-4 w-4 text-brand-600" />
      ) : null}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
