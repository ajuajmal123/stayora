import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError } from "@/lib/errors";
import { verifyAccessToken, verifyRefreshToken, setAuthCookies } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // 1. Try validating Access Token first
    if (accessToken) {
      const decodedAccess = verifyAccessToken(accessToken);
      if (decodedAccess) {
        const user = await User.findById(decodedAccess.id).select("-password -refreshTokens");
        if (user) {
          const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
          };
          return ApiResponse.success(userResponse, "Session active");
        }
      }
    }

    // 2. Access Token is missing or invalid. Check if we can refresh with Refresh Token
    if (refreshToken) {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      if (decodedRefresh) {
        const user = await User.findOne({ _id: decodedRefresh.id, refreshTokens: refreshToken });
        if (user) {
          // Token is valid. Auto-refresh tokens for the client.
          const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role as "admin" | "agent" | "user",
          };

          const { refreshToken: newRefreshToken } = await setAuthCookies(tokenPayload);

          // Rotate tokens in DB
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

          const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
          };

          return ApiResponse.success(userResponse, "Session active (refreshed)");
        }
      }
    }

    throw new UnauthorizedError("Session expired or user not logged in");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
