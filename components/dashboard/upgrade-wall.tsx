import Link from "next/link";
import { ArrowRight, Lock, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Full-section "this is a paid feature" wall — shown to free (Scan) users on
 *  a locked page instead of the real content. Keeps the nav item visible (a
 *  locked preview) so it still pulls toward an upgrade. `children` can hold a
 *  teaser (e.g. "N wijzigingen relevant voor u"). */
export function UpgradeWall({
  icon: Icon = Lock,
  title,
  description,
  tierLabel,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  tierLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
        <Button asChild className="mt-1">
          <Link href="/pricing">
            Bekijk pakketten <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">Beschikbaar vanaf {tierLabel}.</p>
      </CardContent>
    </Card>
  );
}
