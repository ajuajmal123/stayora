import { env } from "./env";

/**
 * Strips script tags, HTML tags, and potentially malicious script attributes from input strings.
 * Prevents XSS attacks on public reviews and profile content.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, "") // strip <script> blocks
    .replace(/<[^>]*>?/gm, "") // strip html tags
    .replace(/on\w+="[^"]*"/g, "") // strip onclick, onload, etc.
    .replace(/on\w+='[^']*'/g, "")
    .trim();
}

/**
 * Validates request Origin and Referer against the application domain.
 * Blocks Cross-Site Request Forgery (CSRF) on mutation API endpoints.
 */
export function verifyCsrfHeaders(request: Request): boolean {
  // Safe requests don't require CSRF checks
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const appUrl = env.NEXT_PUBLIC_APP_URL;

  // Origin verification
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const appOriginUrl = new URL(appUrl);
      if (originUrl.host !== appOriginUrl.host) {
        return false;
      }
    } catch {
      return false;
    }
  } else if (referer) {
    // Fallback to Referer verification
    try {
      const refererUrl = new URL(referer);
      const appOriginUrl = new URL(appUrl);
      if (refererUrl.host !== appOriginUrl.host) {
        return false;
      }
    } catch {
      return false;
    }
  } else {
    // Non-GET requests without Origin or Referer are rejected in production
    if (env.NODE_ENV === "production") {
      return false;
    }
  }

  return true;
}
