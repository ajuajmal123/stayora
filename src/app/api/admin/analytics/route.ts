import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
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

    // 1. Core counters
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookingsCount = await Booking.countDocuments();

    // 2. Revenue sums
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" }, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 3. Occupancy calculation for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const bookingsInLast30Days = await Booking.find({
      status: { $in: ["confirmed", "completed"] },
      checkIn: { $gte: thirtyDaysAgo }
    });

    let totalBookedDays = 0;
    bookingsInLast30Days.forEach((b) => {
      const diffTime = Math.abs(b.checkOut.getTime() - b.checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      totalBookedDays += diffDays;
    });

    const activeProperties = await Property.countDocuments({ status: "published" }) || 1;
    const occupancyRate = Math.min(Math.round((totalBookedDays / (activeProperties * 30)) * 100), 100);

    // 4. Popular destinations by booking count
    const popularDestinations = await Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "propertyDetail"
        }
      },
      { $unwind: "$propertyDetail" },
      {
        $group: {
          _id: "$propertyDetail.city",
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);

    // 5. Monthly revenue trend for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Set to start of month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format monthly trend data to be client-friendly
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-indexed for aggregation matching

      const match = monthlyRevenue.find((item) => item._id.year === y && item._id.month === m);
      trendData.push({
        month: monthNames[m - 1],
        year: y,
        revenue: match ? match.revenue : 0,
        count: match ? match.count : 0
      });
    }

    return ApiResponse.success({
      summary: {
        totalUsers,
        totalProperties,
        totalBookings: totalBookingsCount,
        totalRevenue,
        occupancyRate
      },
      popularDestinations: popularDestinations.map(d => ({
        city: d._id,
        bookings: d.bookingCount,
        revenue: d.revenue
      })),
      revenueTrend: trendData
    });
  } catch (error) {
    return ApiResponse.error(error);
  }
}
