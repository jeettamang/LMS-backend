import mongoose, { Schema } from "mongoose";

const instructorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, 
      lowercase: true, 
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    specialization: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "Not specified",
    },
    role: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
      default: "Instructor",
    },
    token: {
      type: String,
      expiry: Date,
    },
  },
  { timestamps: true },
);

export const InstructorModel = mongoose.model("Instructor", instructorSchema);
