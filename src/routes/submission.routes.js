import express from "express";
import {
  getStudentSubmissions,
  gradeSubmission,
  submitAssignment,
} from "../controllers/submission.controller.js";
import { upload } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const submissionRouter = express.Router();

submissionRouter
  .post("/submit", upload.single("fileUrl"),authMiddleware(["Student"]), submitAssignment)
  .put("/grade/:id",authMiddleware(["Instructor"]), gradeSubmission)
  .get("/:id",authMiddleware(["Student"]), getStudentSubmissions);

export default submissionRouter;
