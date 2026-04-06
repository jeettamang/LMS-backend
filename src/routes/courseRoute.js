import express from "express";
import {
  createCourse,
  deleteCourseById,
  editCourse,
  getCourseById,
  getCourses,
} from "../controllers/courseController.js";
import { upload } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const courseRouter = express.Router();

courseRouter
  .post(
    "/create",
    authMiddleware(["Instructor", "Admin"]),
    upload.single("image"),

    createCourse,
  )
  .get("/get-all", getCourses)
  .get("/get/:id", getCourseById)
  .put(
    "/edit/:id",
    authMiddleware(["Admin", "Instructor"]),
    upload.single("image"),
    editCourse,
  )
  .delete(
    "/delete/:id",
    authMiddleware(["Admin", "Instructor"]),
    deleteCourseById,
  );

export default courseRouter;
