import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TourPackage from "@/models/TourPackage";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { verifyAdmin } from "@/lib/security";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const packages = await TourPackage.find().sort({ createdAt: -1 });
    return ApiResponse.success(packages);
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { title, description, duration, price, location, image, isFeatured } = body;

    if (!title || !description || !duration || price === undefined || !location || !image) {
      throw new ValidationError("Missing required package details");
    }

    let finalImageUrl = image;
    if (image.startsWith("data:image/")) {
      const uploadRes = await uploadToCloudinary(image, "packages");
      if (uploadRes) {
        finalImageUrl = uploadRes.secure_url;
      } else {
        throw new ValidationError("Failed to upload package image to Cloudinary");
      }
    }

    const newPackage = new TourPackage({
      title,
      description,
      duration,
      price: Number(price),
      location,
      image: finalImageUrl,
      isFeatured: !!isFeatured,
    });

    await newPackage.save();
    return ApiResponse.success(newPackage, "Tour package created successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { id, title, description, duration, price, location, image, isFeatured } = body;

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Package ID");
    }

    const pack = await TourPackage.findById(id);
    if (!pack) {
      throw new NotFoundError("Tour package not found");
    }

    if (title !== undefined) {
      pack.title = title;
      pack.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (description !== undefined) pack.description = description;
    if (duration !== undefined) pack.duration = duration;
    if (price !== undefined) pack.price = Number(price);
    if (location !== undefined) pack.location = location;
    if (isFeatured !== undefined) pack.isFeatured = !!isFeatured;

    if (image !== undefined) {
      let finalImageUrl = image;
      if (image.startsWith("data:image/")) {
        const uploadRes = await uploadToCloudinary(image, "packages");
        if (uploadRes) {
          finalImageUrl = uploadRes.secure_url;
        } else {
          throw new ValidationError("Failed to upload package image to Cloudinary");
        }
      }
      pack.image = finalImageUrl;
    }

    await pack.save();
    return ApiResponse.success(pack, "Tour package updated successfully");
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
      throw new ValidationError("Invalid Package ID");
    }

    const pack = await TourPackage.findById(id);
    if (!pack) {
      throw new NotFoundError("Tour package not found");
    }

    await TourPackage.findByIdAndDelete(id);
    return ApiResponse.success({ id }, "Tour package deleted successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
