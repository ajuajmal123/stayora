import { NextRequest } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, NotFoundError, ValidationError, ConflictError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { uploadToCloudinary } from "@/lib/cloudinary";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().default(""),
  avatar: z.string().optional(), // base64 string
});

// Helper to authenticate request
async function getAuthenticatedUserId(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new UnauthorizedError("Please login to update your profile");
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    throw new UnauthorizedError("Session expired. Please log in again");
  }

  return decoded.id;
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getAuthenticatedUserId();

    const body = await req.json();
    const parsed = updateProfileSchema.parse(body);

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found");
    }

    // Check if new email is already in use by another user
    if (parsed.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailConflict = await User.findOne({ email: parsed.email.toLowerCase() });
      if (emailConflict) {
        throw new ConflictError("This email address is already in use by another account");
      }
      user.email = parsed.email.toLowerCase();
    }

    // Upload avatar if base64 provided
    let avatarUrl = "";
    if (parsed.avatar && parsed.avatar.startsWith("data:image")) {
      const uploadResult = await uploadToCloudinary(parsed.avatar, "avatars");
      if (uploadResult) {
        avatarUrl = uploadResult.secure_url;
      }
    }

    // Update fields
    user.name = parsed.name;
    user.phoneNumber = parsed.phoneNumber;
    if (avatarUrl) {
      user.avatar = avatarUrl;
    }

    await user.save();

    const responseUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
    };

    return ApiResponse.success(responseUser, "Profile updated successfully!");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
