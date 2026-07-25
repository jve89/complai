"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Small amber info icon that reveals `children` in a popover on click/tap —
 * for tucking away long inline notes. Uses fixed positioning so it isn't
 * clipped by an `overflow-auto` ancestor (e.g. the admin table wrapper).
 * Closes on outside-click, Escape, scroll, or resize.
 */
export function InfoHint({
  children,
  label = "Meer informatie",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const hide = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (prev) return false;
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
      return true;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [open, hide]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <Info className="h-4 w-4" />
      </button>
      {open && pos && (
        <div
          ref={panelRef}
          role="tooltip"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 w-60 -translate-x-1/2 rounded-md border border-amber-200 bg-popover p-2.5 text-left text-xs font-normal leading-relaxed text-popover-foreground shadow-lg"
        >
          {children}
        </div>
      )}
    </>
  );
}
