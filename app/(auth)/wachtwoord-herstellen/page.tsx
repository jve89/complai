import type { Metadata } from "next";

import { UpdatePasswordForm } from "@/components/auth/password-reset-forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Nieuw wachtwoord" };

export default function ResetPasswordPage() {
  return (
    <Card className="text-card-foreground">
      <CardHeader>
        <CardTitle className="text-2xl">Kies een nieuw wachtwoord</CardTitle>
        <CardDescription>
          Stel hieronder uw nieuwe wachtwoord in. Daarna bent u meteen ingelogd.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
