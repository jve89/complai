"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileDown, Loader2, RefreshCw } from "lucide-react";

import { generateDocument } from "@/app/dashboard/documents/actions";
import type { DocumentType } from "@/lib/documents/templates";
import { Button } from "@/components/ui/button";

export function GenerateButton({
  type,
  hasExisting,
}: {
  type: DocumentType;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const res = await generateDocument(type);
      if (res.ok) {
        router.refresh();
        window.open(`/api/pdf/document/${res.id}`, "_blank");
      }
    });
  }

  return (
    <Button
      onClick={generate}
      disabled={isPending}
      variant={hasExisting ? "outline" : "default"}
      size="sm"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : hasExisting ? (
        <RefreshCw className="h-4 w-4" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {hasExisting ? "Nieuwe versie" : "Genereer"}
    </Button>
  );
}
