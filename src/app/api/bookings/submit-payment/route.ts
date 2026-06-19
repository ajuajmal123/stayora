import { NextRequest } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, NotFoundError, ValidationError, ConflictError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { uploadToCloudinary } from "@/lib/cloudinary";
import mongoose from "mongoose";

const submitPaymentSchema = z.object({
  bookingId: z.string().refine((val) => mongoose.isValidObjectId(val), "Invalid Booking ID"),
  upiTransactionId: z.string().min(8, "UPI Transaction ID / UTR must be at least 8 characters long"),
  upiReceiptScreenshot: z.string().optional(), // base64 string
});

// Helper to authenticate request
async function getAuthenticatedUserId(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new UnauthorizedError("Please login to submit a payment receipt");
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    throw new UnauthorizedError("Session expired. Please log in again");
  }

  return decoded.id;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getAuthenticatedUserId();

    const body = await req.json();
    const parsed = submitPaymentSchema.parse(body);

    // 1. Fetch booking and confirm owner
    const booking = await Booking.findById(parsed.bookingId);
    if (!booking) {
      throw new NotFoundError("Booking request not found");
    }

    if (booking.user.toString() !== userId) {
      throw new UnauthorizedError("You are not authorized to modify this booking");
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      throw new ValidationError(`Cannot submit payment for a booking that is already ${booking.status}`);
    }

    // 2. Anti-fraud check: Prevent UTR code reuse across different bookings
    const duplicateUtr = await Booking.findOne({
      upiTransactionId: parsed.upiTransactionId.trim(),
      _id: { $ne: booking._id },
    });

    if (duplicateUtr) {
      throw new ConflictError("This Transaction Reference Code (UTR) has already been submitted for another booking.");
    }

    // 3. Upload screenshot if available
    let screenshotUrl = "";
    if (parsed.upiReceiptScreenshot) {
      const uploadResult = await uploadToCloudinary(parsed.upiReceiptScreenshot, "receipts");
      if (uploadResult) {
        screenshotUrl = uploadResult.secure_url;
      }
    }

    // 4. Update Booking details
    booking.upiTransactionId = parsed.upiTransactionId.trim();
    if (screenshotUrl) {
      booking.upiReceiptScreenshot = screenshotUrl;
    }
    
    // Save state
    await booking.save();

    return ApiResponse.success(
      {
        bookingId: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        upiTransactionId: booking.upiTransactionId,
        upiReceiptScreenshot: booking.upiReceiptScreenshot,
      },
      "UPI payment transaction reference submitted successfully. Awaiting administrator verification."
    );
  } catch (error) {
    return ApiResponse.error(error);
  }
}
