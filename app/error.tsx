"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/site-logo";

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center">
      <SiteLogo />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Er ging iets mis</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Er trad een onverwachte fout op. Probeer het opnieuw. Blijft het
          misgaan, mail dan{" "}
          <a href="mailto:hallo@complai.nl" className="font-medium text-brand-600 hover:underline">
            hallo@complai.nl
          </a>
          .
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/70">Foutcode: {error.digest}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Opnieuw proberen</Button>
        <Button asChild variant="outline">
          <Link href="/">Naar de homepage</Link>
        </Button>
      </div>
    </div>
  );
}
