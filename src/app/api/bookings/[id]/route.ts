import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to authenticate request and get user payload
async function getAuthenticatedUser(): Promise<{ id: string; role: string }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new UnauthorizedError("Please login to perform this action");
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    throw new UnauthorizedError("Session expired. Please log in again");
  }

  return { id: decoded.id, role: decoded.role };
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const currentUser = await getAuthenticatedUser();
    const { id: bookingId } = await params;

    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
      throw new ValidationError("Invalid Booking ID");
    }

    // Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking record not found");
    }

    // Check permissions (only owner or admin can cancel)
    const isOwner = booking.user.toString() === currentUser.id;
    const isAdmin = currentUser.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedError("You are not authorized to cancel this booking");
    }

    // Check cancellation states
    if (booking.status === "cancelled") {
      throw new ValidationError("This booking has already been cancelled");
    }
    if (booking.status === "completed") {
      throw new ValidationError("Cannot cancel a completed booking stay");
    }

    // Check 48-hour cancellation policy (only travelers are bound by it, admins can bypass)
    if (!isAdmin) {
      const now = Date.now();
      const checkInTime = new Date(booking.checkIn).getTime();
      const diffHours = (checkInTime - now) / (1000 * 60 * 60);

      if (diffHours < 48) {
        throw new ValidationError(
          "Cancellations are only permitted at least 48 hours prior to the check-in date. Please contact Stayora support."
        );
      }
    }

    // Update status
    booking.status = "cancelled";
    
    // If they had already paid, mark as refunded (indicating manual refund is due)
    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    return ApiResponse.success(
      {
        bookingId: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
      "Booking cancelled successfully."
    );
  } catch (error) {
    return ApiResponse.error(error);
  }
}
