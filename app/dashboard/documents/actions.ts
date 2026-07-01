"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getActiveCompany } from "@/lib/auth";
import { buildDocument, type DocumentType } from "@/lib/documents/templates";

export type GenerateResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const VALID_TYPES: DocumentType[] = [
  "ai_policy",
  "risk_assessment",
  "fria",
  "transparency",
  "tech_doc",
  "doc_conformity",
  "assessment_record",
  "gpai_docs",
];

export async function generateDocument(
  type: DocumentType
): Promise<GenerateResult> {
  if (!VALID_TYPES.includes(type)) {
    return { ok: false, error: "Onbekend documenttype." };
  }

  const { company } = await getActiveCompany();

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
