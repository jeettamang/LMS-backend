import express from "express";
import {
  createAssignment,
  getAssignmentDetails,
  getInstructorAssignment,
} from "../controllers/assignmentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const assinmentRouter = express.Router();

assinmentRouter
  .post("/create", authMiddleware(["Instructor"]), createAssignment)
  .get("/instructor/",authMiddleware(["Instructor"]), getInstructorAssignment)
  .get("/submission/:id", getAssignmentDetails);

export default assinmentRouter;
