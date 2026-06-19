import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import HeroBanner from "@/models/HeroBanner";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cookies } from "next/headers";
import mongoose from "mongoose";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new UnauthorizedError("Please login to perform this action");
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    throw new UnauthorizedError("Session expired. Please log in again");
  }

  if (decoded.role !== "admin") {
    throw new ForbiddenError("Access restricted to administrators only");
  }

  const user = await User.findById(decoded.id);
  if (!user || user.isBlocked) {
    throw new ForbiddenError("Your account has been suspended or does not exist");
  }

  return user;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const banners = await HeroBanner.find().sort({ order: 1, createdAt: -1 });
    return ApiResponse.success(banners);
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { title, subtitle, image, link, isActive, order } = body;

    if (!title || !image) {
      throw new ValidationError("Title and image are required");
    }

    let finalImageUrl = image;
    if (image.startsWith("data:image/")) {
      const uploadRes = await uploadToCloudinary(image, "banners");
      if (uploadRes) {
        finalImageUrl = uploadRes.secure_url;
      } else {
        throw new ValidationError("Failed to upload banner image to Cloudinary");
      }
    }

    const newBanner = new HeroBanner({
      title,
      subtitle: subtitle || "",
      image: finalImageUrl,
      link: link || "/",
      isActive: isActive === undefined ? true : !!isActive,
      order: Number(order) || 0,
    });

    await newBanner.save();
    return ApiResponse.success(newBanner, "Hero banner created successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { id, title, subtitle, image, link, isActive, order } = body;

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Banner ID");
    }

    const banner = await HeroBanner.findById(id);
    if (!banner) {
      throw new NotFoundError("Banner not found");
    }

    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (link !== undefined) banner.link = link;
    if (isActive !== undefined) banner.isActive = !!isActive;
    if (order !== undefined) banner.order = Number(order) || 0;

    if (image !== undefined) {
      let finalImageUrl = image;
      if (image.startsWith("data:image/")) {
        const uploadRes = await uploadToCloudinary(image, "banners");
        if (uploadRes) {
          finalImageUrl = uploadRes.secure_url;
        } else {
          throw new ValidationError("Failed to upload banner image to Cloudinary");
        }
      }
      banner.image = finalImageUrl;
    }

    await banner.save();
    return ApiResponse.success(banner, "Hero banner updated successfully");
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
      throw new ValidationError("Invalid Banner ID");
    }

    const banner = await HeroBanner.findById(id);
    if (!banner) {
      throw new NotFoundError("Banner not found");
    }

    await HeroBanner.findByIdAndDelete(id);
    return ApiResponse.success({ id }, "Hero banner deleted successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
