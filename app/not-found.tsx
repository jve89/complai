import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/site-logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center">
      <SiteLogo />
      <p className="bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent">
        404
      </p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Deze pagina bestaat niet</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          De link klopt niet meer of de pagina is verplaatst. Ga terug naar de
          start of begin met de gratis risicoscan.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Naar de homepage</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/scan">Doe de gratis scan</Link>
        </Button>
      </div>
    </div>
  );
}
