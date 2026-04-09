import express from "express";
import {
  createEnrollment,
  deleteEnrollment,
  getEnrollmentById,
  getEnrollments,
  getEnrollmentStatus,
  getTotalEarnings,
  getUserDashboard,
  verifyEsewaPayment,
} from "../controllers/enrollmentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const Enrollrouter = express.Router();

Enrollrouter.post("/create", authMiddleware(["Student"]), createEnrollment);
Enrollrouter.get("/verify-esewa", verifyEsewaPayment)
  .get("/get-enrolls", authMiddleware(["Admin"]), getEnrollments)
  .get("/check-status/:tid", getEnrollmentStatus)
  .get("/single-enroll/:id", getEnrollmentById)
  .delete("/:id", deleteEnrollment)
  .get("/user-dashboard", authMiddleware(["Student"]), getUserDashboard)
  .get("/total-earnings", authMiddleware(["Admin"]), getTotalEarnings);

export default Enrollrouter;
