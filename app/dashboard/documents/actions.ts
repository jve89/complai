"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { buildDocument, DOCUMENT_META, type DocumentType } from "@/lib/documents/templates";
import { docUnlocked, TIER_LABEL, minTierFor } from "@/lib/plan";

export type GenerateResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

// Single source of truth — every catalogued document is generatable. (A stale
// hardcoded list here previously blocked new types like the audit report.)
const VALID_TYPES = new Set<DocumentType>(DOCUMENT_META.map((m) => m.type));

export async function generateDocument(
  type: DocumentType
): Promise<GenerateResult> {
  if (!VALID_TYPES.has(type)) {
    return { ok: false, error: "Onbekend documenttype." };
  }

  const { company } = await getActiveCompany();

  // The document package is what the plan buys — gate generation server-side.
  if (!docUnlocked(company.plan, type)) {
    return {
      ok: false,
      error: `Dit document is beschikbaar vanaf het pakket ${TIER_LABEL[minTierFor(type)]}.`,
    };
  }

  try {
    const systems = await prisma.aiSystem.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "asc" },
    });

    const content = buildDocument(type, company, systems);

    // Next version number for this document type.
    const last = await prisma.document.findFirst({
      where: { companyId: company.id, type },
      orderBy: { version: "desc" },
    });
    const version = (last?.version ?? 0) + 1;

    const doc = await prisma.document.create({
      data: {
        companyId: company.id,
        type,
        version,
        content: content as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard/documents");
    return { ok: true, id: doc.id };
  } catch {
    return { ok: false, error: "Genereren mislukt. Probeer het opnieuw." };
  }
}
