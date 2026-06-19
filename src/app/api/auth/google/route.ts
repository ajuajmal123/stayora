import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Support picking user vs admin role for mock testing
    const body = await req.json().catch(() => ({}));
    const requestedRole = body.role === "admin" ? "admin" : "user";
    
    const email = requestedRole === "admin" ? "admin@stayora.com" : "googleuser@stayora.com";
    const name = requestedRole === "admin" ? "Stayora Administrator" : "Alexander Mercer";
    const avatar = requestedRole === "admin" 
      ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

    let user = await User.findOne({ email });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash("google_auth_mock_password_stayora", 10);
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: requestedRole,
        avatar,
        isVerified: true,
      });
      await user.save();
    }

    if (user.isBlocked) {
      return ApiResponse.error("Your account has been suspended by an administrator.");
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role as "admin" | "agent" | "user",
    };

    const { refreshToken } = await setAuthCookies(tokenPayload);
    user.refreshTokens.push(refreshToken);
    await user.save();

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
    };

    return ApiResponse.success(userResponse, "Google login successful");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
