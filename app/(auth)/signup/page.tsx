import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { logoutToInvite } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Account aanmaken" };

const ROLE_LABEL: Record<string, string> = {
  admin: "Beheerder",
  manager: "Manager",
  employee: "Medewerker",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { scan?: string; invite?: string; plan?: string; interval?: string };
}) {
  const scanId = searchParams.scan;
  const inviteToken = searchParams.invite;
  const planId = searchParams.plan;
  const interval = searchParams.interval === "year" ? "year" : "month";
  const chosenPlan = planId ? PLANS.find((p) => p.id === planId) : undefined;

  let invite: { email: string; name: string | null; role: string; company: string } | null = null;
  let inviteInvalid = false;
  if (inviteToken) {
    const rec = await prisma.invite.findUnique({
      where: { token: inviteToken },
      include: { company: true },
    });
    const expired = rec?.expiresAt ? rec.expiresAt < new Date() : false;
    if (rec && !rec.accepted && !expired) {
      invite = { email: rec.email, name: rec.name, role: rec.role, company: rec.company.name };
    } else {
      inviteInvalid = true;
    }
  }

  // A logged-in visitor only reaches this page via an invite link (the middleware
  // bounces other auth-page visits to the dashboard). Rather than show a signup
  // form to someone who already has an account, offer to log out and accept.
  const current = inviteToken ? await getCurrentUser().catch(() => null) : null;
  if (current) {
    return (
      <Card className="text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">U bent al ingelogd</CardTitle>
          <CardDescription>
            {invite
              ? `Deze uitnodiging is bedoeld voor ${invite.email}. U bent ingelogd als ${current.email}. Log uit om de uitnodiging te accepteren.`
              : "Deze uitnodiging is niet meer geldig. U bent al ingelogd."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {invite && inviteToken && (
            <form action={logoutToInvite}>
              <input type="hidden" name="invite" value={inviteToken} />
              <Button type="submit" className="w-full">
                Uitloggen en uitnodiging accepteren
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/dashboard" className="font-medium text-primary hover:underline">
              Naar mijn dashboard
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl">
          {invite ? `Word lid van ${invite.company}` : "Start gratis"}
        </CardTitle>
        <CardDescription>
          {invite
            ? `U bent uitgenodigd als ${ROLE_LABEL[invite.role] ?? invite.role}. Maak uw account aan om deel te nemen.`
            : chosenPlan
              ? `Maak eerst uw account aan — daarna gaat u door naar de betaling voor ${chosenPlan.name}.`
              : scanId
                ? "Maak een account aan — we zetten uw scanresultaat meteen klaar in uw dashboard."
                : "Maak een account aan en krijg direct grip op uw AI-compliance."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {inviteInvalid && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            Deze uitnodiging is niet meer geldig. Vraag de beheerder om een nieuwe,
            of maak hieronder een eigen organisatie aan.
          </div>
        )}
        <AuthForm
          mode="signup"
          scanId={scanId}
          inviteToken={invite ? inviteToken : undefined}
          inviteEmail={invite?.email}
          inviteName={invite?.name ?? undefined}
          plan={chosenPlan ? planId : undefined}
          interval={chosenPlan ? interval : undefined}
        />
        <p className="text-center text-xs text-muted-foreground">
          Door te registreren gaat u akkoord met onze voorwaarden en
          privacyverklaring.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Al een account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inloggen
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
