"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { deleteCompany, deleteUser } from "@/app/dashboard/admin/actions";
import { Button } from "@/components/ui/button";

/**
 * Type-to-confirm delete. `kind` picks the target: an organisation (+ all its
 * data and members) or a single person. Requires typing the exact name.
 */
export function DeleteButton({
  id,
  name,
  kind,
}: {
  id: string;
  name: string;
  kind: "organisatie" | "persoon";
}) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    const typed = window.prompt(
      `Weet u het zeker? Dit verwijdert ${kind} "${name}" definitief` +
        (kind === "organisatie"
          ? ", inclusief alle gegevens, medewerkers en logins."
          : ", inclusief de login.") +
        `\n\nDit kan niet ongedaan worden gemaakt. Typ de naam "${name}" om te bevestigen:`
    );
    if (typed === null) return; // cancelled
    if (typed.trim() !== name) {
      window.alert("De naam kwam niet overeen. Verwijderen geannuleerd.");
      return;
    }

    const fd = new FormData();
    if (kind === "organisatie") {
      fd.set("companyId", id);
      startTransition(() => deleteCompany(fd));
    } else {
      fd.set("userId", id);
      startTransition(() => deleteUser(fd));
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={onClick}
      disabled={isPending}
      aria-label={`Verwijder ${kind} ${name}`}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
