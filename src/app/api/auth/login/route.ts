import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { loginSchema } from "@/validations/auth";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { setAuthCookies } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Validate request
    const parsedData = loginSchema.parse(body);

    // Find user
    const user = await User.findOne({ email: parsedData.email });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.isBlocked) {
      return ApiResponse.error(new ForbiddenError("Your account has been suspended by an administrator."));
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(parsedData.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role as "admin" | "agent" | "user",
    };

    // Set auth cookies
    const { refreshToken } = await setAuthCookies(tokenPayload);

    // Save refresh token to database
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Prepare response user object
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
    };

    return ApiResponse.success(userResponse, "Login successful");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
