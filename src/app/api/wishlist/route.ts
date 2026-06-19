import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Property from "@/models/Property";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import mongoose from "mongoose";

// Helper to authenticate request
async function getAuthenticatedUserId(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new UnauthorizedError("Please login to manage your wishlist");
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    throw new UnauthorizedError("Session expired. Please log in again");
  }

  return decoded.id;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getAuthenticatedUserId();

    const user = await User.findById(userId).populate({
      path: "wishlist",
      model: Property,
    });

    if (!user) {
      throw new NotFoundError("User account not found");
    }

    return ApiResponse.success(user.wishlist, "Wishlist retrieved successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getAuthenticatedUserId();
    
    const body = await req.json();
    const { propertyId } = body;

    if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
      throw new ValidationError("Invalid property ID provided");
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Target luxury property not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found");
    }

    const hasInWishlist = user.wishlist.some(
      (id: mongoose.Types.ObjectId) => id.toString() === propertyId
    );

    let isAdded = false;
    if (hasInWishlist) {
      // Remove
      await User.updateOne(
        { _id: userId },
        { $pull: { wishlist: new mongoose.Types.ObjectId(propertyId) } }
      );
      isAdded = false;
    } else {
      // Add
      await User.updateOne(
        { _id: userId },
        { $push: { wishlist: new mongoose.Types.ObjectId(propertyId) } }
      );
      isAdded = true;
    }

    return ApiResponse.success(
      { isAdded },
      isAdded ? "Added to wishlist successfully" : "Removed from wishlist successfully"
    );
  } catch (error) {
    return ApiResponse.error(error);
  }
}
