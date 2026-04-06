import express from "express";
import {
  deleteUser,
  editUser,
  getMe,
  getMyCourses,
  getUsers,
  loginUser,
  logout,
  myPayments,
  registerUser,
} from "../controllers/userController.js";
import { upload } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const userRouter = express.Router();

userRouter
  .post("/register", upload.single("profile"), registerUser)
  .post("/login", loginUser)
  .get("/my-courses", authMiddleware(["Student"]), getMyCourses)
  .get("/get-me", authMiddleware(), getMe)
  .get("/get-all", getUsers)
  .put("/edit/:id", upload.single("profile"), editUser)
  .delete("/delete/:id", deleteUser)
  .get("/my-payments", authMiddleware(["Student"]), myPayments)
  .post("/logout", logout);
export default userRouter;
