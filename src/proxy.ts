import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight JWT decoding for edge runtime (no node.js crypto dependency)
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let user = accessToken ? decodeJwt(accessToken) : null;
  let newCookies: string[] = [];

  // If access token is missing/expired, but refresh token is present, try to auto-refresh
  if (!user && refreshToken) {
    try {
      // Call the API refresh endpoint
      const refreshResponse = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        const body = await refreshResponse.json();
        user = body.data;
        newCookies = refreshResponse.headers.getSetCookie();
      }
    } catch (error) {
      console.error("Middleware refresh token fetch failed:", error);
    }
  }

  // Helper to propagate new cookies to the response
  const withCookies = (res: NextResponse) => {
    newCookies.forEach((cookie) => {
      res.headers.append("Set-Cookie", cookie);
    });
    return res;
  };

  // Allow anyone to access /admin directly to see login modal
  if (pathname === "/admin") {
    return withCookies(NextResponse.next());
  }

  // Protect admin subpaths if not logged in as admin
  if (isAdminRoute) {
    if (!user || user.role !== "admin") {
      return withCookies(NextResponse.redirect(new URL("/admin", request.url)));
    }
  }

  return withCookies(NextResponse.next());
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
