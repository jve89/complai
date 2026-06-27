import Link from "next/link";
import { ShieldCheck } from "lucide-react";

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
      className={cn("flex items-center gap-2 text-lg font-bold", className)}
    >
      <ShieldCheck className="h-6 w-6 text-brand-500" />
      <span>
        Compl<span className="text-brand-500">AI</span>
      </span>
    </Link>
  );
}
