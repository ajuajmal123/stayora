import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError } from "@/lib/errors";
import { verifyRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const oldRefreshToken = cookieStore.get("refreshToken")?.value;

    if (!oldRefreshToken) {
      throw new UnauthorizedError("Refresh token missing");
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded) {
      // Clear cookies if the refresh token is invalid
      await clearAuthCookies();
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Find the user holding this token
    const user = await User.findOne({ _id: decoded.id, refreshTokens: oldRefreshToken });

    if (!user) {
      // Security warning: potential token theft/reuse. Invalidate all tokens for safety.
      await User.updateOne({ _id: decoded.id }, { $set: { refreshTokens: [] } });
      await clearAuthCookies();
      throw new UnauthorizedError("Token theft detected. Please login again.");
    }

    // Rotate tokens
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role as "admin" | "agent" | "user",
    };

    // Generate new access token and new refresh token, set new cookies
    const { refreshToken: newRefreshToken } = await setAuthCookies(tokenPayload);

    // Update database: remove old token, add new token
    await User.updateOne(
      { _id: user._id },
      {
        $pull: { refreshTokens: oldRefreshToken },
      }
    );
    
    await User.updateOne(
      { _id: user._id },
      {
        $push: { refreshTokens: newRefreshToken },
      }
    );

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
    };

    return ApiResponse.success(userResponse, "Token refreshed successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
