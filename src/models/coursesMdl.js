import mongoose, {Schema} from "mongoose";

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, lowercase: true, unique: true },
    description: { type: String },
    image: { type: String, required: true },
    price: { type: Number, default: 1 },
    videoUrl: { type: String },
    duration: { type: String, required: true },
    syllabus: [
      {
        type: String,
        default:[]
      },
    ],
    prerequisites: { type: [String], default: [] },
    enrollmentDeadline: { type: Date },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCategory",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
    rating: { type: Number, default: 0 },
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
export const CourseModel = mongoose.model("Course", courseSchema)