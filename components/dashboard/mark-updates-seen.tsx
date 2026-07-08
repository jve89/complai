"use client";

import { useEffect } from "react";

import { UPDATES_SEEN_KEY } from "@/lib/updates-seen";

/** Records "you've seen the updates" in localStorage when the feed page mounts,
 *  which clears the sidebar "new" badge. Renders nothing. */
export function MarkUpdatesSeen() {
  useEffect(() => {
    try {
      window.localStorage.setItem(UPDATES_SEEN_KEY, new Date().toISOString());
    } catch {
      /* localStorage unavailable (private mode) — badge simply stays. */
    }
  }, []);
  return null;
}
