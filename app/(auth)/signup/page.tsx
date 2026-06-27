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

export default function SignupPage() {
  return (
    <Card className="text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl">Start gratis</CardTitle>
        <CardDescription>
          Maak een account aan en krijg direct grip op uw AI-compliance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuthForm mode="signup" />
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
