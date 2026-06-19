import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a base64 encoded string or file path to Cloudinary
 * @param fileUri base64 string or file path
 * @param folder folder name inside Cloudinary
 */
export async function uploadToCloudinary(
  fileUri: string,
  folder: string = "stayora"
): Promise<{ secure_url: string; public_id: string } | null> {
  try {
    const response = await cloudinary.uploader.upload(fileUri, {
      folder: `stayora/${folder}`,
      resource_type: "auto",
    });
    return {
      secure_url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
}

/**
 * Deletes an asset from Cloudinary using its public ID
 * @param publicId the resource public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return false;
  }
}

export default cloudinary;
