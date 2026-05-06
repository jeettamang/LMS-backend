import mongoose, { Schema } from "mongoose";
const assignmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true },
);
export const AssignmentModel = mongoose.model("Assignment", assignmentSchema);
