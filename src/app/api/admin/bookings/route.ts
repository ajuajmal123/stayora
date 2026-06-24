import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Property from "@/models/Property";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { sendBookingConfirmationEmail } from "@/lib/mail";

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

    const bookings = await Booking.find()
      .populate({
        path: "property",
        model: Property,
        select: "_id title city images pricePerNight",
      })
      .populate({
        path: "user",
        model: User,
        select: "_id name email phoneNumber",
      })
      .sort({ createdAt: -1 });

    return ApiResponse.success(bookings);
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { bookingId, status, paymentStatus } = body;

    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
      throw new ValidationError("Invalid Booking ID");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (status) {
      if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
        throw new ValidationError("Invalid booking status value");
      }
      
      const previousStatus = booking.status;
      booking.status = status;
      
      // Auto-refund paid bookings if they get cancelled
      if (status === "cancelled") {
        if (booking.paymentStatus === "paid") {
          booking.paymentStatus = "refunded";
        }
      }

      // Send confirmation email when moving to 'confirmed'
      if (status === "confirmed" && previousStatus !== "confirmed") {
        const property = await Property.findById(booking.property);
        const traveler = await User.findById(booking.user);
        const targetEmail = booking.email || traveler?.email;
        
        if (targetEmail && property) {
          sendBookingConfirmationEmail(targetEmail, booking, property).catch((err) => {
            console.error("Async email sending error:", err);
          });
        }
      }
    }

    if (paymentStatus) {
      if (!["unpaid", "paid", "refunded"].includes(paymentStatus)) {
        throw new ValidationError("Invalid payment status value");
      }
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    return ApiResponse.success(booking, "Booking updated successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
