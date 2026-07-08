"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getActiveCompany, canAdminister } from "@/lib/auth";

/** Hides the "Aan de slag" checklist permanently for this company. */
export async function dismissOnboarding(): Promise<void> {
  const { company, user, demo } = await getActiveCompany();
  if (demo) return; // never persist onto the shared demo company
  if (!canAdminister(user)) return; // company-wide state — beheerder only

  await prisma.company.update({
    where: { id: company.id },
    data: { onboardingDismissedAt: new Date() },
  });
  revalidatePath("/dashboard");
}
