import { AlertTriangle } from "lucide-react";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Laatst bijgewerkt: {updated}
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <strong>Conceptversie.</strong> Deze tekst is een sjabloon en vormt
          geen juridisch advies. Laat hem vóór livegang controleren door een
          jurist en vul de gegevens tussen [vierkante haken] aan.
        </p>
      </div>

      <div className="mt-8 space-y-2 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:mt-1 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_a]:text-primary [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
