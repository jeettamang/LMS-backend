import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    transaction_uuid: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    payment_method: {
      type: String,
      default: "esewa",
    },
  },
  { timestamps: true },
);

enrollmentSchema.index(
  { user: 1, course: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "paid" } }
);

export const EnrollModel = mongoose.model("Enrollment", enrollmentSchema);
