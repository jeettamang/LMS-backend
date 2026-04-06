import express from "express";
import {
  createContact,
  deleteMessage,
  getContacts,
} from "../controllers/contactController.js";
const contactRouter = express.Router();

contactRouter.post("/send-message", createContact);
contactRouter.get("/get-all", getContacts);
contactRouter.delete("/delete-message/:id", deleteMessage);

export default contactRouter;
