import express from "express";
const blogRouter = express.Router();
import {
  createBlog,
  getBySlug,
  list,
  removeBySlug,
  updateBySlug,
  updateByStatus,
} from "../controllers/blogController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

blogRouter
  .post(
    "/create",
    authMiddleware(["Admin", "Instructor"]),
    upload.single("image"),
    createBlog,
  )
  .get("/list", list)
  .get("/getBySlug/:slug", getBySlug)
  .put(
    "/update-by-slug/:slug",
    authMiddleware(["Admin", "Instructor"]),
    upload.single("image"),
    updateBySlug,
  )
  .patch("/status-slug/:slug", updateByStatus)
  .delete("/delete-by-slug/:slug", authMiddleware(["Admin"]), removeBySlug);
export default blogRouter;
