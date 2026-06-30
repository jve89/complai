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

export const metadata: Metadata = { title: "Account aanmaken" };

export default function SignupPage({
  searchParams,
}: {
  searchParams: { scan?: string };
}) {
  const scanId = searchParams.scan;
  return (
    <Card className="text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl">Start gratis</CardTitle>
        <CardDescription>
          {scanId
            ? "Maak een account aan — we zetten uw scanresultaat meteen klaar in uw dashboard."
            : "Maak een account aan en krijg direct grip op uw AI-compliance."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuthForm mode="signup" scanId={scanId} />
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
