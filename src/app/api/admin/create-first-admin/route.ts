import { ApiResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

export async function GET() {
  return ApiResponse.error(new NotFoundError("Endpoint not found"));
}
