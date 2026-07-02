"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/env";
import { TIER_ORDER } from "@/lib/plan";
import type { TierId } from "@/lib/compliance/types";

export type AdminResult = { ok: true } | { ok: false; error: string };

/**
 * Sets a client company's plan directly (no Stripe). Super-admin only. Used to
 * grant/adjust access manually — e.g. comp a client or fix a billing mismatch.
 * Does NOT touch their Stripe subscription; if they have one, the next webhook
 * will reconcile the plan back to what they actually pay for.
 */
export async function setCompanyPlan(
  companyId: string,
  plan: string
): Promise<AdminResult> {
  const user = await getCurrentUser().catch(() => null);
  if (!isSuperAdmin(user?.email)) {
    return { ok: false, error: "Geen toegang." };
  }
  if (!TIER_ORDER.includes(plan as TierId)) {
    return { ok: false, error: "Onbekend pakket." };
  }

  await prisma.company.update({
    where: { id: companyId },
    data: { plan },
  });

  revalidatePath("/dashboard/admin");
  return { ok: true };
}
