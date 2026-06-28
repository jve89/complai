import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function SiteLogo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5 text-lg font-bold tracking-tight", className)}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-sm">
        <Check className="h-4 w-4" strokeWidth={3.5} />
      </span>
      <span>ComplAI</span>
    </Link>
  );
}
