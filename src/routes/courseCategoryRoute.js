import express from "express";
import { createCategory } from "../controllers/courseCategoryController.js";
const courseCategoryRouter = express.Router();

courseCategoryRouter.post("/create", createCategory);

export default courseCategoryRouter;
