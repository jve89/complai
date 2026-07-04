"use client";

import { useTransition } from "react";
import { Loader2, RotateCcw } from "lucide-react";

import { resetCompanyData } from "@/app/dashboard/admin/actions";
import { Button } from "@/components/ui/button";

/**
 * Type-to-confirm reset of a company's product data (scans, documents,
 * AI-register, compliance items, e-learning progress). Keeps logins, team and
 * plan — so it's safe on your own org, unlike delete. Requires typing the name.
 */
export function ResetButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    const typed = window.prompt(
      `Dit wist alle gegevens van "${name}" — scans, gegenereerde documenten, ` +
        `AI-register, nalevingsitems en e-learningvoortgang — maar behoudt de ` +
        `logins, het team en het pakket.\n\n` +
        `Dit kan niet ongedaan worden gemaakt. Typ de naam "${name}" om te bevestigen:`
    );
    if (typed === null) return; // cancelled
    if (typed.trim() !== name) {
      window.alert("De naam kwam niet overeen. Reset geannuleerd.");
      return;
    }

    const fd = new FormData();
    fd.set("companyId", id);
    startTransition(() => resetCompanyData(fd));
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
      onClick={onClick}
      disabled={isPending}
      aria-label={`Reset gegevens van ${name}`}
      title="Gegevens resetten (login blijft)"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
    </Button>
  );
}
