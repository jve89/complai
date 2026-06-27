import Link from "next/link";

import { SiteLogo } from "@/components/site-logo";

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <SiteLogo />
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Terug naar home
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
