import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedRole = searchParams.get("role") === "admin" ? "admin" : "user";
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing GOOGLE_CLIENT_ID in environment configuration.");
      return NextResponse.redirect(new URL("/login?error=Google+Client+ID+not+configured", req.url));
    }

    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
    const scope = "openid email profile";
    const state = requestedRole;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google authentication redirect initialization error:", error);
    return NextResponse.redirect(new URL("/login?error=Failed+to+initialize+Google+sign+in", req.url));
  }
}
