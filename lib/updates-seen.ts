/** localStorage key for the client-side "last seen updates" timestamp that drives
 *  the sidebar "new updates" badge. Per-device by design for now (no migration);
 *  upgradeable to a per-account column later. */
export const UPDATES_SEEN_KEY = "complai:updatesSeenAt";
