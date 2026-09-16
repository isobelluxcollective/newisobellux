/**
 * Stage 1 public access allowlist.
 * All other page routes still exist in the codebase but redirect to `/`.
 * Flip `STAGE1_PUBLIC_LOCKDOWN` to false (or expand the allowlist) for Stage 2.
 */
export const STAGE1_PUBLIC_LOCKDOWN = true;

const ALWAYS_ALLOWED_PREFIXES = [
  "/admin", // staff panel
  "/api/", // webhooks / server APIs
] as const;

const PUBLIC_EXACT = new Set(["/", "/privacy", "/cookies"]);

/** Paths that remain publicly reachable during Stage 1. */
export function isPubliclyAllowedPath(pathname: string): boolean {
  if (!STAGE1_PUBLIC_LOCKDOWN) return true;

  const path = pathname.replace(/\/+$/, "") || "/";

  if (PUBLIC_EXACT.has(path)) return true;

  for (const prefix of ALWAYS_ALLOWED_PREFIXES) {
    if (path === prefix.replace(/\/+$/, "") || path.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}
