import mongoose, { Schema } from "mongoose";

const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
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
    type: {
      type: String,
      enum: ["villa", "hotel", "resort", "apartment", "cabin", "mansion", "hostel", "guesthouse", "lodge", "spa"],
      required: [true, "Property type is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: [
        (val: string[]) => val.length > 0,
        "Property must have at least one image",
      ],
    },
    amenities: {
      type: [String],
      default: [],
    },
    bedrooms: {
      type: Number,
      required: [true, "Number of bedrooms is required"],
      min: [0, "Bedrooms cannot be negative"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Number of bathrooms is required"],
      min: [0, "Bathrooms cannot be negative"],
    },
    maxGuests: {
      type: Number,
      required: [true, "Maximum guest limit is required"],
      min: [1, "Max guests must be at least 1"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agent is required"],
    },
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },
    unavailableDates: {
      type: [String],
      default: [],
    },
    rules: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from title before validation if not provided
propertySchema.pre("validate", function (this: any) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});

propertySchema.index({ city: 1, status: 1 });
propertySchema.index({ pricePerNight: 1 });
propertySchema.index({ rating: -1 });

const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);

export default Property;
export { propertySchema };
