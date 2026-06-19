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

  // Define route protections
  const isAdminRoute = pathname.startsWith("/admin");
  const isAgentRoute = pathname.startsWith("/agent");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/bookings");

  if (!isAdminRoute && !isAgentRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let user = accessToken ? decodeJwt(accessToken) : null;

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

        // Propagate the new set-cookie headers to the response
        const response = NextResponse.next();
        const setCookieHeaders = refreshResponse.headers.getSetCookie();
        
        setCookieHeaders.forEach((cookie) => {
          response.headers.append("Set-Cookie", cookie);
        });

        // Enforce roles after successful refresh
        if (isAdminRoute && user?.role !== "admin") {
          return NextResponse.redirect(new URL("/", request.url));
        }
        if (isAgentRoute && user?.role !== "agent" && user?.role !== "admin") {
          return NextResponse.redirect(new URL("/", request.url));
        }

        return response;
      }
    } catch (error) {
      console.error("Middleware refresh token fetch failed:", error);
    }
  }

  // If still no user, block access and redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Enforce Role authorization
  if (isAdminRoute && user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAgentRoute && user.role !== "agent" && user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/agent/:path*",
    "/bookings/:path*",
    "/dashboard/:path*",
  ],
};
