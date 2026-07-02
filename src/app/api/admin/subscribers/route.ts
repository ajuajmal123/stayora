import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { verifyAdmin } from "@/lib/security";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    return ApiResponse.success(subscribers);
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Subscriber ID");
    }

    const subscriber = await Newsletter.findById(id);
    if (!subscriber) {
      throw new NotFoundError("Subscriber record not found");
    }

    await Newsletter.findByIdAndDelete(id);
    return ApiResponse.success({ id }, "Newsletter subscriber removed successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
