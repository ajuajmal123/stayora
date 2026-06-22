import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { ZodError } from "zod";

export interface ApiResponsePayload<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export class ApiResponse {
  static success<T = any>(
    data?: T,
    message: string = "Request successful",
    status: number = 200
  ): NextResponse<ApiResponsePayload<T>> {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  }

  static error(error: unknown): NextResponse<ApiResponsePayload<null>> {
    // Only log unexpected server errors as errors; log client/request warnings cleanly
    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        console.error("API Server Error Logged:", error);
      } else {
        console.warn(`API Request Warning [${error.statusCode}]: ${error.message}`);
      }
    } else {
      console.error("API Error Logged:", error);
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Default system error
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
