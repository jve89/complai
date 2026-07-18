// The ONE place the stored ComplianceProfile blob is read back off a row
// (company.profileJson or scanResult.profile). Centralizes the DB→domain JSON
// cast that was duplicated across ~16 sites, and makes PROFILE_VERSION
// load-bearing: a blob whose version predates the current shape is treated as
// "needs a re-scan" (null) rather than trusted, so a future bump can't feed a
// stale v1 profile into modules that assume the new shape.
//
// Types-only imports on purpose, so pages can read a profile without pulling the
// classification engine (lib/compliance/engine + profile) into their bundle.
import { PROFILE_VERSION, type ComplianceProfile } from "@/lib/compliance/types";

export function readProfile(raw: unknown): ComplianceProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const profile = raw as ComplianceProfile;
  return profile.version === PROFILE_VERSION ? profile : null;
}
