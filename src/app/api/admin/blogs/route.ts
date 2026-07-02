import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import User from "@/models/User";
import { ApiResponse } from "@/lib/api-response";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import mongoose from "mongoose";

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

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { title, content, excerpt, coverImage, author, tags } = body;

    if (!title || !content || !excerpt || !coverImage) {
      throw new ValidationError("Missing required blog creation parameters");
    }

    const newBlog = new Blog({
      title,
      content,
      excerpt,
      coverImage,
      author: author || "Stayora Concierge",
      tags: tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    });

    await newBlog.save();
    return ApiResponse.success(newBlog, "Blog article created successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const body = await req.json();
    const { id, title, content, excerpt, coverImage, author, tags } = body;

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Blog ID");
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError("Blog article not found");
    }

    if (title !== undefined) {
      blog.title = title;
      // Recalculate slug on title edit
      blog.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (content !== undefined) blog.content = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (author !== undefined) blog.author = author;
    if (tags !== undefined) {
      blog.tags = typeof tags === "string" 
        ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) 
        : tags;
    }

    await blog.save();
    return ApiResponse.success(blog, "Blog article updated successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    await verifyAdmin();

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id || !mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid Blog ID");
    }

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      throw new NotFoundError("Blog article not found");
    }

    return ApiResponse.success(null, "Blog article deleted successfully");
  } catch (error) {
    return ApiResponse.error(error);
  }
}
