import mongoose, { Schema } from "mongoose";

const heroBannerSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    link: {
      type: String,
      default: "/",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const HeroBanner = mongoose.models.HeroBanner || mongoose.model("HeroBanner", heroBannerSchema);

export default HeroBanner;
export { heroBannerSchema };
