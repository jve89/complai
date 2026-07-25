import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { TeamSection } from "@/components/dashboard/settings/team-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { company, user, demo } = await getActiveCompany();
  const canManage = !demo && user?.profile?.role === "admin";

  const [members, pendingInvites] = await Promise.all([
    prisma.user.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "asc" },
    }),
    // Only admins see/act on pending invites; skip the query otherwise.
    canManage
      ? prisma.invite.findMany({
          where: {
            companyId: company.id,
            accepted: false,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        title="Medewerkers"
        description={
          canManage
            ? "Nodig collega's uit, beheer hun rol en verwijder wie geen toegang meer nodig heeft."
            : "Uw team en hun rollen. Beheer is voorbehouden aan een beheerder."
        }
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
          <TeamSection
            members={members}
            pendingInvites={pendingInvites}
            currentUserId={user?.id}
            readOnly={!canManage}
          />
        </CardContent>
      </Card>
    </>
  );
}
