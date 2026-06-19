import mongoose, { Schema } from "mongoose";

const destinationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
      unique: true,
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
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    propertiesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

destinationSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

const Destination = mongoose.models.Destination || mongoose.model("Destination", destinationSchema);

export default Destination;
export { destinationSchema };
