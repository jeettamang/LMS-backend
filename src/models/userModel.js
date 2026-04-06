import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    profile: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
      default: "Student",
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model("User", userSchema);
