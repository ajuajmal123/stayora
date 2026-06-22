import mongoose, { Schema } from "mongoose";

const tourPackageSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Package image URL is required"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

tourPackageSchema.pre("validate", function (this: any) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});

const TourPackage = mongoose.models.TourPackage || mongoose.model("TourPackage", tourPackageSchema);

export default TourPackage;
export { tourPackageSchema };
