import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(8, "JWT_ACCESS_SECRET must be at least 8 characters long"),
  JWT_REFRESH_SECRET: z.string().min(8, "JWT_REFRESH_SECRET must be at least 8 characters long"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  RAZORPAY_KEY_ID: z.string().default("rzp_test_dummykeyid123"),
  RAZORPAY_KEY_SECRET: z.string().default("dummysecret456"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

// Since Next.js can execute this on both server and client,
// but some variables should not be exposed to the client,
// we only validate them when running in a Node environment (server-side).
const isServer = typeof window === "undefined";

let env: z.infer<typeof envSchema>;

if (isServer) {
  const parsed = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykeyid123",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "dummysecret456",
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment variables. Fix them in your .env file.");
  }

  env = parsed.data;
} else {
  // Client side fallback for public variables only
  env = {
    MONGODB_URI: "",
    JWT_ACCESS_SECRET: "",
    JWT_REFRESH_SECRET: "",
    CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    CLOUDINARY_API_KEY: "",
    CLOUDINARY_API_SECRET: "",
    RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummykeyid123",
    RAZORPAY_KEY_SECRET: "",
    NODE_ENV: (process.env.NODE_ENV as any) || "development",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };
}

export { env };
