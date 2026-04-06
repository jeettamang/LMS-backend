import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 1,
    },
    duration: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: String,
        rating: Number,
      },
    ],
  },
  { timestamps: true },
);

export const CourseModel =
  mongoose.models.Course || mongoose.model("Course", courseSchema);
