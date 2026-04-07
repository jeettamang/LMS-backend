import mongoose, { Schema } from "mongoose";

const courseCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
  },
  { timestamps: true },
);

export const CourseCategoryModel =
  mongoose.models.Category ||
  mongoose.model("CourseCategory", courseCategorySchema);
