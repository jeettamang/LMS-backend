import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "authorModel",
    },

    authorModel: {
      type: String,
      required: true,
      enum: ["User", "Instructor"],
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true },
);

export const Blog = mongoose.model("Blog", blogSchema);
