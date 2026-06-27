import { Hammer } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
  bullets,
}: {
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Hammer className="h-6 w-6" />
          </div>
          <p className="max-w-md text-muted-foreground">
            Deze module wordt binnenkort opgeleverd. Wat u hier straks kunt doen:
          </p>
          <ul className="mx-auto max-w-sm space-y-1 text-left text-sm text-muted-foreground">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-brand-600">•</span>
                {b}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
