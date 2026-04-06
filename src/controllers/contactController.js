import { ContactModel } from "../models/contactModel.js";
import { mailSend } from "../utils/sendMail.js";
const createContact = async (req, res) => {
  console.log("message:", req.body);
  try {
    const { name, email, purpose, message } = req.body;

    if (!name || !email || !purpose || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const contact = await ContactModel.create({
      name,
      email,
      purpose,
      message,
    });

    const htmlMessage = `
      <h2>New Contact Message</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Purpose:</b> ${purpose}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `;

    await mailSend({
      to: process.env.ADMIN_EMAIL,
      subject: `Contact - ${purpose}`,
      message: htmlMessage,
      replyTo: email,
    });

    await mailSend({
      to: email,
      subject: "We received your message",
      message: `<p>Hi ${name}, we will contact you soon.</p>`,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await ContactModel.find();
    if (!contacts) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "All message list", messages: contacts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "contact message not found" });
    }
    const message = await ContactModel.findByIdAndDelete(id);
    if (!message) {
      return res.status(400).json({ message: "Something went wrong" });
    }
    res.status(200).json({ message: "Contact message deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export { createContact, getContacts, deleteMessage };
