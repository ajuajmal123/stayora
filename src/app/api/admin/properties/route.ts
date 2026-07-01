import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cookies } from "next/headers";

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

    const properties = await Property.find().populate("destination").sort({ createdAt: -1 });
    return ApiResponse.success(properties);
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const admin = await verifyAdmin();

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

    // Validation
    if (!title || !description || !type || pricePerNight === undefined || !address || !city || !country || bedrooms === undefined || bathrooms === undefined || maxGuests === undefined) {
      throw new ValidationError("Missing required property details");
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new ValidationError("At least one image is required for a property");
    }

    // Process images: upload base64 strings to Cloudinary, retain standard URL strings
    const uploadedImages: string[] = [];
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

    const newProperty = new Property({
      title,
      description,
      type,
      status: status || "draft",
      pricePerNight,
      address,
      city,
      country,
      amenities: amenities || [],
      bedrooms,
      bathrooms,
      maxGuests,
      images: uploadedImages,
      agent: admin._id,
      destination: destination || null,
      unavailableDates: unavailableDates || [],
    });

    await newProperty.save();

    return ApiResponse.success(newProperty, "Property created successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
