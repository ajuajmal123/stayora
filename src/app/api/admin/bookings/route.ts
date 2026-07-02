import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Property from "@/models/Property";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { verifyAdmin } from "@/lib/security";
import mongoose from "mongoose";
import { sendBookingConfirmationEmail } from "@/lib/mail";

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

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { propertyId, name, email, checkIn, checkOut, guests, totalPrice, status, paymentStatus, customAmenities, customRules, phoneNumber } = body;

    // Validation
    if (!name || !email || !propertyId || !mongoose.isValidObjectId(propertyId) || !checkIn || !checkOut || guests === undefined || totalPrice === undefined) {
      throw new ValidationError("Missing required booking creation details");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new ValidationError("Invalid date formats");
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Luxury property not found");
    }

    const bookingStatus = status || "pending";
    const payment = paymentStatus || "unpaid";

    const newBooking = new Booking({
      property: propertyId,
      name,
      email,
      phoneNumber: phoneNumber || "",
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      totalPrice: Number(totalPrice),
      status: bookingStatus,
      paymentStatus: payment,
      customAmenities: customAmenities ? customAmenities.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      customRules: customRules ? customRules.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    });

    await newBooking.save();

    // Trigger confirmation email with PDF if confirmed immediately
    if (bookingStatus === "confirmed") {
      sendBookingConfirmationEmail(email, newBooking, property).catch((err) => {
        console.error("Manual booking email sending error:", err);
      });
    }

    // Populate property details before returning
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate({
        path: "property",
        model: Property,
        select: "_id title city images pricePerNight",
      });

    return ApiResponse.success(populatedBooking, "Custom booking created successfully");
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
