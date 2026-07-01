import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { TeamSection } from "@/components/dashboard/settings/team-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { company, demo } = await getActiveCompany();

  const members = await prisma.user.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Medewerkers"
        description="Nodig collega's uit, beheer hun rol en houd AI-geletterdheid op orde."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teamleden</CardTitle>
          <CardDescription>
            Beheer wie toegang heeft en welke rol zij hebben. De rol bepaalt ook
            hun leerpad in de e-learning (Medewerker · Manager · Beheerder).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamSection members={members} readOnly={demo} />
        </CardContent>
      </Card>
    </>
  );
}
