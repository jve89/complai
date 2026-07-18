"use client";

import { useEffect, useRef } from "react";

import { dismissOnboarding } from "@/app/dashboard/actions";

/**
 * Renders nothing. Fires the dismissOnboarding server action ONCE when the
 * onboarding is complete, so the "Aan de slag" checklist never returns — without
 * the dashboard page performing a DB write during its GET render. The parent only
 * mounts this while the company isn't yet dismissed, so it runs at most once.
 */
export function AutoDismissOnboarding() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void dismissOnboarding();
  }, []);
  return null;
}
