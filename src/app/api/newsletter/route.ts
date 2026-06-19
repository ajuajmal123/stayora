import { NextRequest } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import { ApiResponse } from "@/lib/api-response";
import { ConflictError } from "@/lib/errors";

const newsletterInputSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const parsed = newsletterInputSchema.parse(body);

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: parsed.email });
    if (existing) {
      if (existing.isActive) {
        throw new ConflictError("This email is already subscribed to our newsletter.");
      } else {
        // Reactivate subscription
        existing.isActive = true;
        await existing.save();
        return ApiResponse.success(null, "Subscription reactivated successfully!");
      }
    }

    // Create subscription
    await Newsletter.create({
      email: parsed.email,
      isActive: true,
    });

    return ApiResponse.success(null, "Successfully subscribed to the Stayora newsletter!");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
