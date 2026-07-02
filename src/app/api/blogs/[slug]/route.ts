import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { ApiResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      throw new NotFoundError("Blog article not found");
    }

    return ApiResponse.success(blog);
  } catch (error) {
    return ApiResponse.error(error);
  }
}
