"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Segment error boundary for the dashboard. Because it lives under
 * app/dashboard/layout.tsx, a thrown page/render error shows this inline card
 * WITHIN the dashboard chrome (sidebar, header, impersonation banner stay put)
 * instead of bouncing to the full-screen root error and losing navigation.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border bg-card px-6 py-12 text-center">
      <h1 className="text-lg font-semibold tracking-tight">Er ging iets mis</h1>
      <p className="text-sm text-muted-foreground">
        Deze pagina kon niet worden geladen. Probeer het opnieuw. Blijft het
        misgaan, mail dan{" "}
        <a
          href="mailto:info@complai-eu.nl"
          className="font-medium text-brand-600 hover:underline"
        >
          info@complai-eu.nl
        </a>
        .
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/70">Foutcode: {error.digest}</p>
      )}
      <Button onClick={reset}>Opnieuw proberen</Button>
    </div>
  );
}
