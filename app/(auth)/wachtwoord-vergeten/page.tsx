import Link from "next/link";
import type { Metadata } from "next";

import { RequestResetForm } from "@/components/auth/password-reset-forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Wachtwoord vergeten" };

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <Card className="text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl">Wachtwoord vergeten?</CardTitle>
        <CardDescription>
          Vul uw e-mailadres in en we sturen u een link om een nieuw wachtwoord in
          te stellen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {searchParams.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            Die herstel-link is verlopen of ongeldig. Vraag hieronder een nieuwe aan.
          </div>
        )}
        <RequestResetForm />
        <p className="text-center text-sm text-muted-foreground">
          Weet u het weer?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Terug naar inloggen
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
