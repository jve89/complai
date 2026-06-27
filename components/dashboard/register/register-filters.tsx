"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { RISK_LEVELS, RISK_LABEL, STATUSES, STATUS_LABEL } from "@/lib/register/labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const risk = params.get("risk") ?? "all";
  const status = params.get("status") ?? "all";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(`/dashboard/register${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={risk} onValueChange={(v) => update("risk", v)}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Risiconiveau" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle risiconiveaus</SelectItem>
          {RISK_LEVELS.map((r) => (
            <SelectItem key={r} value={r}>
              {RISK_LABEL[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => update("status", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle statussen</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
