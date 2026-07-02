import jwt from "jsonwebtoken";
import { env } from "./env";

// Let's import cookies properly
import { cookies as getCookies } from "next/headers";

interface TokenPayload {
  id: string;
  email: string;
  role: "admin" | "agent" | "user";
}

const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookies(payload: TokenPayload, customRefreshToken?: string) {
  const cookieStore = await getCookies();

  const accessToken = signAccessToken(payload);
  const refreshToken = customRefreshToken || signRefreshToken(payload);

  // Set Access Token (15 mins)
  cookieStore.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  // Set Refresh Token (7 days)
  cookieStore.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return { accessToken, refreshToken };
}

export async function clearAuthCookies() {
  const cookieStore = await getCookies();

  cookieStore.set({
    name: "accessToken",
    value: "",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set({
    name: "refreshToken",
    value: "",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set({
    name: "next-auth.session-token",
    value: "",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set({
    name: "__Secure-next-auth.session-token",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
