"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/site-logo";

const links = [
  { href: "/#hoe-het-werkt", label: "Hoe het werkt" },
  { href: "/#functies", label: "Functies" },
  { href: "/pricing", label: "Prijzen" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-navy-900/95 text-white backdrop-blur supports-[backdrop-filter]:bg-navy-900/80">
      <div className="container flex h-16 items-center justify-between">
        <SiteLogo className="text-white" />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/login">Inloggen</Link>
          </Button>
          <Button asChild>
            <Link href="/scan">Start gratis risicoscan</Link>
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/80"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Inloggen</Link>
              </Button>
              <Button asChild>
                <Link href="/scan">Start gratis risicoscan</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
