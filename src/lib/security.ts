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

export async function verifyAdmin() {
  const { cookies } = await import("next/headers");
  const { verifyAccessToken, verifyRefreshToken, setAuthCookies, clearAuthCookies } = await import("./jwt");
  const { default: User } = await import("@/models/User");
  const { UnauthorizedError } = await import("./errors");

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // 1. Validate Access Token
  if (accessToken) {
    const decoded = verifyAccessToken(accessToken);
    if (decoded && decoded.role === "admin") {
      const user = await User.findById(decoded.id);
      if (user && !user.isBlocked) {
        return user;
      }
    }
  }

  // 2. Access Token expired/missing. Check if Refresh Token is present for silent auto-refresh
  if (refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded && decoded.role === "admin") {
      const user = await User.findOne({ _id: decoded.id, refreshTokens: refreshToken });
      if (user && !user.isBlocked) {
        // Rotate tokens
        const tokenPayload = {
          id: user._id.toString(),
          email: user.email,
          role: user.role as "admin" | "agent" | "user",
        };

        const { refreshToken: newRefreshToken } = await setAuthCookies(tokenPayload);

        // Update database tokens
        await User.updateOne(
          { _id: user._id },
          {
            $pull: { refreshTokens: refreshToken },
          }
        );
        await User.updateOne(
          { _id: user._id },
          {
            $push: { refreshTokens: newRefreshToken },
          }
        );

        return user;
      }
    }
  }

  // If both tokens are invalid/missing, clear cookies and throw Unauthorized
  await clearAuthCookies();
  throw new UnauthorizedError("Session expired or user not logged in");
}
