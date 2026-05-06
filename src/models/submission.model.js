import mongoose, { Schema } from "mongoose";
const submissionSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    marks: {
      type: Number,
      default: 0,
    },
    feedback: String,
  },
  { timestamps: true },
);

export const SubmissionModel = mongoose.model("Submission", submissionSchema);
