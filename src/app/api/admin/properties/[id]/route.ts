import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cookies } from "next/headers";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Property ID");
    }

    const property = await Property.findById(id).populate("destination");
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    return ApiResponse.success(property);
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Property ID");
    }

    const property = await Property.findById(id);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const body = await req.json();
    const {
      title,
      description,
      type,
      status,
      pricePerNight,
      address,
      city,
      country,
      amenities,
      bedrooms,
      bathrooms,
      maxGuests,
      images,
      destination,
      unavailableDates,
    } = body;

    // Process images
    let uploadedImages: string[] = [];
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (typeof img === "string" && img.startsWith("data:image/")) {
          const uploadRes = await uploadToCloudinary(img, "properties");
          if (uploadRes) {
            uploadedImages.push(uploadRes.secure_url);
          } else {
            throw new ValidationError("Failed to upload property image to Cloudinary");
          }
        } else if (typeof img === "string") {
          uploadedImages.push(img);
        }
      }
    } else {
      uploadedImages = property.images;
    }

    // Update fields
    if (title !== undefined) property.title = title;
    if (description !== undefined) property.description = description;
    if (type !== undefined) property.type = type;
    if (status !== undefined) property.status = status;
    if (pricePerNight !== undefined) property.pricePerNight = pricePerNight;
    if (address !== undefined) property.address = address;
    if (city !== undefined) property.city = city;
    if (country !== undefined) property.country = country;
    if (amenities !== undefined) property.amenities = amenities;
    if (bedrooms !== undefined) property.bedrooms = bedrooms;
    if (bathrooms !== undefined) property.bathrooms = bathrooms;
    if (maxGuests !== undefined) property.maxGuests = maxGuests;
    if (images !== undefined) property.images = uploadedImages;
    if (destination !== undefined) property.destination = destination || null;
    if (unavailableDates !== undefined) property.unavailableDates = unavailableDates;

    // Ensure slug regenerates if title has changed and slug wasn't manually passed
    if (title !== undefined && body.slug === undefined) {
      property.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    await property.save();

    return ApiResponse.success(property, "Property updated successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const { id } = await params;
    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Property ID");
    }

    const property = await Property.findById(id);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    await Property.findByIdAndDelete(id);

    return ApiResponse.success({ id }, "Property deleted successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
