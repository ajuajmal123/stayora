import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { clearAuthCookies } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Read the refresh token from cookies to delete it from DB
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      // Find the user and remove this refresh token
      await User.updateOne(
        { refreshTokens: refreshToken },
        { $pull: { refreshTokens: refreshToken } }
      );
    }

    // Clear the HTTP-only cookies
    await clearAuthCookies();

    return ApiResponse.success(null, "Logout successful");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
