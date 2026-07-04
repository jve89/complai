"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";

const KEY = "complai_cookie_consent";
const MAX_AGE = 60 * 60 * 24 * 180; // 180 days

/**
 * Privacy-first cookie consent. Nothing non-essential runs until the visitor
 * opts in — "Alleen noodzakelijk" is the safe default and is offered as
 * prominently as accepting. The choice is stored in localStorage + a first-party
 * cookie so it survives navigation and is readable server-side if needed. When
 * analytics are added later, load them only when the stored value is "accepted".
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      // localStorage unavailable (private mode) — skip the banner rather than crash.
    }
  }, []);

  function choose(value: "accepted" | "necessary") {
    try {
      localStorage.setItem(KEY, value);
      document.cookie = `${KEY}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax`;
    } catch {
      // Best-effort; a blocked store just means we'll ask again next visit.
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookievoorkeuren"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 shadow-[0_-4px_24px_-12px_rgba(28,26,64,0.25)] backdrop-blur"
    >
      <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
          <span>
            We gebruiken noodzakelijke cookies om ComplAI te laten werken. Met uw
            toestemming gebruiken we ook analytische cookies om de site te
            verbeteren.{" "}
            <Link href="/cookies" className="font-medium text-brand-600 hover:underline">
              Lees ons cookiebeleid
            </Link>
            .
          </span>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => choose("necessary")}>
            Alleen noodzakelijk
          </Button>
          <Button size="sm" onClick={() => choose("accepted")}>
            Accepteren
          </Button>
        </div>
      </div>
    </div>
  );
}
