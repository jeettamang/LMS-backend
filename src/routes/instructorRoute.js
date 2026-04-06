import express from "express";
import { upload } from "../middlewares/upload.js";
import {
  createInstructor,
  deleteIns,
  getInstructors,
  getMe,
  getMyCourses,
  loginInstructor,
  updateInstructor,
} from "../controllers/instructorController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const instructorRouter = express.Router();

instructorRouter
  .post(
    "/create",
    upload.single("profileImage"),
    authMiddleware(["Admin"]),
    createInstructor,
  )
  .post("/login", loginInstructor)
  .get("/get-all", authMiddleware(["Admin"]), getInstructors)
  .get("/get-me", authMiddleware(["Admin", "Instructor"]), getMe)
  .get("/my-courses", authMiddleware(["Instructor"]), getMyCourses)
  .put(
    "/update/:id",
    upload.single("profileImage"),
    authMiddleware(["Admin", "Instructor"]),
    updateInstructor,
  )
  .delete("/delete/:id", authMiddleware(["Admin"]), deleteIns);

export default instructorRouter;
