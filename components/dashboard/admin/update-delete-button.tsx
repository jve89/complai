"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { deleteRegulatoryUpdate } from "@/app/dashboard/admin/updates/actions";
import { Button } from "@/components/ui/button";

/** Inline delete for the updates list — confirm, then remove without opening the
 *  row. Refreshes the list on success. */
export function UpdateDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(`Update "${title}" definitief verwijderen?`)) return;
    startTransition(async () => {
      const res = await deleteRegulatoryUpdate(id);
      if (res.ok) router.refresh();
      else window.alert(res.error);
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={onClick}
      disabled={isPending}
      aria-label={`Verwijder update ${title}`}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
