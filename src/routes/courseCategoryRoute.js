import express from "express";
import { createCategory, getCategories } from "../controllers/courseCategoryController.js";
const courseCategoryRouter = express.Router();

courseCategoryRouter.post("/create", createCategory).get("/get-all", getCategories)

export default courseCategoryRouter;
