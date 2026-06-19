import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters long"],
    },
  },
  {
    timestamps: true,
  }
);

// We can implement auto update rating on Property when review changes if necessary in future,
// but for setup we keep it simple.
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
export { reviewSchema };
