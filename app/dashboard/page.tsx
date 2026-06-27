import { ShieldCheck } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          ComplAI
        </div>
        <form action={logout}>
          <Button variant="outline" size="sm">
            Uitloggen
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Welkom{user.profile?.name ? `, ${user.profile.name}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Organisatie: {user.company?.name ?? "—"}</p>
          <p>Rol: {user.profile?.role ?? "—"}</p>
          <p className="pt-3 text-foreground">
            Het volledige dashboard met compliance-score, AI-register, documenten,
            e-learning en governance wordt hier opgebouwd.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
