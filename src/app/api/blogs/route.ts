import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { ApiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const tag = searchParams.get("tag");
    const query = searchParams.get("query");

    const filter: any = {};
    if (tag) {
      filter.tags = tag;
    }
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { excerpt: { $regex: query, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    return ApiResponse.success(blogs);
  } catch (error) {
    return ApiResponse.error(error);
  }
}
