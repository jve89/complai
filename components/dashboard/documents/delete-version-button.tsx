"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { deleteDocumentVersion } from "@/app/dashboard/documents/actions";

/** Trash button next to a version's Download link (beheerder only). Confirms
 *  once, then deletes and refreshes. */
export function DeleteVersionButton({ id, version }: { id: string; version: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function onDelete() {
    if (!window.confirm(`Versie v${version} verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }
    setError(false);
    startTransition(async () => {
      const res = await deleteDocumentVersion(id);
      if (res.ok) router.refresh();
      else setError(true);
    });
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={isPending}
      aria-label={`Versie v${version} verwijderen`}
      title={error ? "Verwijderen mislukt" : `Versie v${version} verwijderen`}
      className={`transition-colors disabled:opacity-50 ${
        error ? "text-destructive" : "text-muted-foreground hover:text-destructive"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
