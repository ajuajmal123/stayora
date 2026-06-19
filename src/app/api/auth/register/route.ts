import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/validations/auth";
import { ApiResponse } from "@/lib/api-response";
import { ConflictError } from "@/lib/errors";
import { setAuthCookies } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Validate request
    const parsedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: parsedData.email });
    if (existingUser) {
      throw new ConflictError("A user with this email address already exists");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(parsedData.password, salt);

    // Create user
    const newUser = await User.create({
      name: parsedData.name,
      email: parsedData.email,
      password: hashedPassword,
      role: parsedData.role,
      phoneNumber: parsedData.phoneNumber,
    });

    const tokenPayload = {
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role as "admin" | "agent" | "user",
    };

    // Generate cookies and tokens
    const { refreshToken } = await setAuthCookies(tokenPayload);

    // Save refresh token to user array (supports multi-device login)
    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    // Return user without password
    const userResponse = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      phoneNumber: newUser.phoneNumber,
    };

    return ApiResponse.success(userResponse, "Registration successful", 21);
  } catch (error) {
    return ApiResponse.error(error);
  }
}
