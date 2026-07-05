import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, NotFoundError, ValidationError, ConflictError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { propertyId, checkIn, checkOut, guests, name, email, phoneNumber } = body;

    // Validate inputs
    if (!name || !email) {
      throw new ValidationError("Name and email are required to request a reservation");
    }
    if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
      throw new ValidationError("Invalid Property ID");
    }
    if (!checkIn || !checkOut) {
      throw new ValidationError("Check-in and Check-out dates are required");
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new ValidationError("Invalid date formats");
    }

    if (checkInDate >= checkOutDate) {
      throw new ValidationError("Check-out date must be after check-in date");
    }

    if (checkInDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new ValidationError("Check-in date cannot be in the past");
    }

    const guestsCount = parseInt(guests);
    if (isNaN(guestsCount) || guestsCount < 1) {
      throw new ValidationError("Invalid guest count");
    }

    // 1. Fetch Property details
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Luxury property not found");
    }

    // 3. Calculate Pricing
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    // Each property capacity is for 1 room. Guests exceeding maxGuests are placed in additional rooms.
    const maxG = property.maxGuests > 0 ? property.maxGuests : 1;
    const rooms = Math.ceil(guestsCount / maxG);
    const baseTotal = nights * property.pricePerNight * rooms;
    const totalPrice = baseTotal;

    // 4. Create the booking
    const booking = await Booking.create({
      property: propertyId,
      name: name,
      email: email,
      phoneNumber: phoneNumber || "",
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: totalPrice,
      guests: guestsCount,
      status: "pending",
      paymentStatus: "unpaid",
    });

    // 5. Generate direct P2P UPI link
    // Format: upi://pay?pa=merchant_vpa&pn=merchant_name&am=amount&cu=INR&tn=transaction_note
    const merchantVpa = process.env.MERCHANT_UPI_ID || "stayora@upi";
    const merchantName = encodeURIComponent("Stayora Luxury Stays");
    const transactionNote = encodeURIComponent(`Booking-${booking._id.toString().substring(18)}`);
    const upiUri = `upi://pay?pa=${merchantVpa}&pn=${merchantName}&am=${totalPrice}&cu=INR&tn=${transactionNote}`;

    const responsePayload = {
      bookingId: booking._id.toString(),
      propertyTitle: property.title,
      pricePerNight: property.pricePerNight,
      nights,
      totalPrice,
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      guests: guestsCount,
      upiUri,
      merchantVpa,
    };

    return ApiResponse.success(responsePayload, "Booking created, awaiting UPI payment receipt submission", 201);
  } catch (error) {
    return ApiResponse.error(error);
  }
}
