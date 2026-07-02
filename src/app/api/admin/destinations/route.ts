import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Destination from "@/models/Destination";
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

    const destinations = await Destination.find().sort({ createdAt: -1 });
    return ApiResponse.success(destinations);
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { name, description, image, isFeatured, popularSpots } = body;

    if (!name || !description || !image) {
      throw new ValidationError("Missing required destination details");
    }

    let finalImageUrl = image;
    if (image.startsWith("data:image/")) {
      const uploadRes = await uploadToCloudinary(image, "destinations");
      if (uploadRes) {
        finalImageUrl = uploadRes.secure_url;
      } else {
        throw new ValidationError("Failed to upload destination image to Cloudinary");
      }
    }

    const processedSpots = [];
    if (popularSpots && Array.isArray(popularSpots)) {
      for (const spot of popularSpots) {
        let spotImageUrl = spot.image;
        if (spot.image && spot.image.startsWith("data:image/")) {
          const uploadRes = await uploadToCloudinary(spot.image, "destinations_spots");
          if (uploadRes) {
            spotImageUrl = uploadRes.secure_url;
          } else {
            throw new ValidationError("Failed to upload spot image to Cloudinary");
          }
        }
        processedSpots.push({
          name: spot.name,
          image: spotImageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80",
          activities: Array.isArray(spot.activities) ? spot.activities : [],
        });
      }
    }

    const newDest = new Destination({
      name,
      description,
      image: finalImageUrl,
      isFeatured: !!isFeatured,
      popularSpots: processedSpots,
    });

    await newDest.save();
    return ApiResponse.success(newDest, "Destination created successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { id, name, description, image, isFeatured, popularSpots } = body;

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Destination ID");
    }

    const dest = await Destination.findById(id);
    if (!dest) {
      throw new NotFoundError("Destination not found");
    }

    if (name !== undefined) {
      dest.name = name;
      dest.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (description !== undefined) dest.description = description;
    if (isFeatured !== undefined) dest.isFeatured = !!isFeatured;

    if (image !== undefined) {
      let finalImageUrl = image;
      if (image.startsWith("data:image/")) {
        const uploadRes = await uploadToCloudinary(image, "destinations");
        if (uploadRes) {
          finalImageUrl = uploadRes.secure_url;
        } else {
          throw new ValidationError("Failed to upload destination image to Cloudinary");
        }
      }
      dest.image = finalImageUrl;
    }

    if (popularSpots !== undefined) {
      const processedSpots = [];
      if (Array.isArray(popularSpots)) {
        for (const spot of popularSpots) {
          let spotImageUrl = spot.image;
          if (spot.image && spot.image.startsWith("data:image/")) {
            const uploadRes = await uploadToCloudinary(spot.image, "destinations_spots");
            if (uploadRes) {
              spotImageUrl = uploadRes.secure_url;
            } else {
              throw new ValidationError("Failed to upload spot image to Cloudinary");
            }
          }
          processedSpots.push({
            name: spot.name,
            image: spotImageUrl || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80",
            activities: Array.isArray(spot.activities) ? spot.activities : [],
          });
        }
      }
      dest.popularSpots = processedSpots;
    }

    await dest.save();
    return ApiResponse.success(dest, "Destination updated successfully");
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
      throw new ValidationError("Invalid Destination ID");
    }

    const dest = await Destination.findById(id);
    if (!dest) {
      throw new NotFoundError("Destination not found");
    }

    await Destination.findByIdAndDelete(id);
    return ApiResponse.success({ id }, "Destination deleted successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
