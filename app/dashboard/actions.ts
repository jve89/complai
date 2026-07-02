"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";

/** Hides the "Aan de slag" checklist permanently for this company. */
export async function dismissOnboarding(): Promise<void> {
  const { company, demo } = await getActiveCompany();
  if (demo) return; // never persist onto the shared demo company

  await prisma.company.update({
    where: { id: company.id },
    data: { onboardingDismissedAt: new Date() },
  });
  revalidatePath("/dashboard");
}
