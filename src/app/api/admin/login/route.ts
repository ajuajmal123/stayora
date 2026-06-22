import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import { setAuthCookies } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new ValidationError("Username and password are required");
    }

    // Standardize input
    const inputEmail = email.trim().toLowerCase();
    
    // Map literal Admin@stayora or admin@stayora.com inputs to the seeded Mongoose profile
    const targetEmail = (inputEmail === "admin@stayora" || inputEmail === "admin@stayora.com")
      ? "admin@stayora.com"
      : inputEmail;

    const user = await User.findOne({ email: targetEmail });
    
    if (!user || user.role !== "admin") {
      throw new UnauthorizedError("Invalid administrative credentials");
    }

    if (user.isBlocked) {
      throw new ForbiddenError("Administrative profile suspended");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid administrative credentials");
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
    };

    return ApiResponse.success(userResponse, "Admin authentication successful");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
