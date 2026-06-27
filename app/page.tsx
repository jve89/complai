import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-navy-900 px-6 text-center text-white">
      <span className="rounded-full border border-white/15 px-4 py-1 text-sm text-brand-400">
        ComplAI
      </span>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        Grip op uw AI. Klaar voor de AI Act.
      </h1>
      <p className="max-w-xl text-balance text-white/70">
        De landingspagina wordt opgebouwd. Start alvast de gratis risicoscan.
      </p>
      <Button asChild size="lg">
        <Link href="/scan">Start gratis risicoscan</Link>
      </Button>
    </main>
  );
}
