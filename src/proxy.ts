import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

  // Define route types
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminRoute = pathname.startsWith("/admin");
  const isAgentRoute = pathname.startsWith("/agent");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/bookings");

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let user = accessToken ? decodeJwt(accessToken) : null;

  if (!user) {
    const nextAuthToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (nextAuthToken) {
      user = {
        id: nextAuthToken.id as string,
        email: nextAuthToken.email as string,
        role: nextAuthToken.role as "admin" | "agent" | "user",
      };
    }
  }

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

  // 1. If user is logged in:
  if (user) {
    // Redirect authenticated users away from auth pages (login/register) depending on role
    if (isAuthPage) {
      if (user.role === "admin") {
        return withCookies(NextResponse.redirect(new URL("/admin", request.url)));
      }
      return withCookies(NextResponse.redirect(new URL("/dashboard", request.url)));
    }

    // Redirect regular users away from admin routes
    if (isAdminRoute && user.role !== "admin") {
      return withCookies(NextResponse.redirect(new URL("/", request.url)));
    }

    // Redirect non-agents and non-admins away from agent routes
    if (isAgentRoute && user.role !== "agent" && user.role !== "admin") {
      return withCookies(NextResponse.redirect(new URL("/", request.url)));
    }

    return withCookies(NextResponse.next());
  }

  // 2. If user is NOT logged in:
  if (isAuthPage) {
    return withCookies(NextResponse.next());
  }

  // Let unauthenticated users access `/admin` so they can see the AdminLogin component
  if (pathname === "/admin") {
    return withCookies(NextResponse.next());
  }

  // Protect admin subpaths, agent paths, and user dashboards
  if (isAdminRoute || isAgentRoute || isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withCookies(NextResponse.redirect(loginUrl));
  }

  return withCookies(NextResponse.next());
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/agent/:path*",
    "/bookings/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
