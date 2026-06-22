import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { setAuthCookies } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "user"; // requestedRole

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=Google+login+cancelled+or+failed", req.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Google credentials in environment variables.");
      return NextResponse.redirect(new URL("/login?error=Google+OAuth+not+fully+configured", req.url));
    }

    await connectToDatabase();

    // 1. Exchange authorization code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${req.nextUrl.origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token exchange error:", tokenData);
      return NextResponse.redirect(new URL("/login?error=Google+token+exchange+failed", req.url));
    }

    // 2. Retrieve user profile details from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok || !userInfo.email) {
      console.error("Google user profile fetch error:", userInfo);
      return NextResponse.redirect(new URL("/login?error=Failed+to+retrieve+profile+from+Google", req.url));
    }

    const { email, name, picture } = userInfo;

    // 3. Find or register user
    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash("google_auth_real_password_stayora_" + Math.random(), 10);
      user = new User({
        name: name || "Google Traveler",
        email,
        password: hashedPassword,
        role: state === "admin" ? "admin" : "user",
        avatar: picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        isVerified: true,
      });
      await user.save();
    } else {
      // Sync latest details from Google if modified
      let needsSave = false;
      if (name && user.name !== name) {
        user.name = name;
        needsSave = true;
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    if (user.isBlocked) {
      return NextResponse.redirect(new URL("/login?error=Your+account+has+been+suspended+by+an+administrator", req.url));
    }

    // 4. Set session cookies
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role as "admin" | "agent" | "user",
    };

    const { refreshToken } = await setAuthCookies(tokenPayload);
    
    // Track refresh tokens list in DB
    user.refreshTokens.push(refreshToken);
    await user.save();

    // 5. Successful login redirect
    const targetUrl = user.role === "admin" ? "/admin" : "/";
    return NextResponse.redirect(new URL(targetUrl, req.url));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=An+unexpected+error+occurred+during+login", req.url));
  }
}
