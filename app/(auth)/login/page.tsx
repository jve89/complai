import Link from "next/link";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Inloggen" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; registered?: string; scan?: string };
}) {
  return (
    <Card className="text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl">Welkom terug</CardTitle>
        <CardDescription>
          Log in op uw ComplAI-omgeving om verder te werken aan uw compliance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {searchParams.registered && (
          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
            Account aangemaakt. Bevestig eventueel uw e-mailadres en log in.
          </div>
        )}
        <AuthForm
          mode="login"
          redirectTo={searchParams.redirect}
          scanId={searchParams.scan}
        />
        <p className="text-center text-sm text-muted-foreground">
          Nog geen account?{" "}
          <Link
            href={searchParams.scan ? `/signup?scan=${searchParams.scan}` : "/signup"}
            className="font-medium text-primary hover:underline"
          >
            Gratis starten
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
