import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { verifyAdmin } from "@/lib/security";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const users = await User.find().select("-password -refreshTokens").sort({ createdAt: -1 });
    return ApiResponse.success(users);
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const adminUser = await verifyAdmin();

    const body = await req.json();
    const { userId, isBlocked } = body;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      throw new ValidationError("Invalid User ID");
    }

    if (typeof isBlocked !== "boolean") {
      throw new ValidationError("Blocked status must be a boolean");
    }

    if (userId === adminUser._id.toString()) {
      throw new ValidationError("You cannot block or modify your own administrator account");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.isBlocked = isBlocked;
    
    // Kick out the blocked user by wiping their refresh tokens
    if (isBlocked) {
      user.refreshTokens = [];
    }

    await user.save();

    return ApiResponse.success(
      {
        userId: user._id.toString(),
        isBlocked: user.isBlocked,
      },
      `User was successfully ${isBlocked ? "blocked" : "unblocked"}.`
    );
  } catch (error) {
    return ApiResponse.error(error);
  }
}
