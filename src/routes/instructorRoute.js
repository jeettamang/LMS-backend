import express from "express";
import { upload } from "../middlewares/upload.js";
import {
  createInstructor,
  deleteIns,
  getInstructorDashboard,
  getInstructorPublically,
  getInstructors,
  getMe,
  getMyCourses,
  getMyStudents,
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
  .get("/public", getInstructorPublically)
  .get("/get-me", authMiddleware(["Admin", "Instructor"]), getMe)
  .get("/my-courses", authMiddleware(["Instructor"]), getMyCourses)
  .get("/my-students", authMiddleware(["Instructor"]), getMyStudents)
  .get(
    "/my-dashboard",
    authMiddleware(["Instructor", "instructor"]),
    getInstructorDashboard,
  )
  .put(
    "/update/:id",
    upload.single("profileImage"),
    authMiddleware(["Admin", "Instructor"]),
    updateInstructor,
  )
  .delete("/delete/:id", authMiddleware(["Admin"]), deleteIns);

export default instructorRouter;
