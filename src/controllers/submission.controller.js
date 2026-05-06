import { SubmissionModel } from "../models/submission.model.js";
import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const existing = await SubmissionModel.findOne({
      assignmentId,
      studentId: req.user.id,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already submitted",
      });
    }
    let fileUrl = "";
    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);
      fileUrl = uploaded.secure_url;
    }

    //create
    const submission = await SubmissionModel.create({
      assignmentId,
      studentId: req.user.id,
      fileUrl: fileUrl,
    });
    res.status(201).json({
      message: "Assinment submitted",
      submission,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    const submission = await SubmissionModel.findByIdAndUpdate(
      id,
      { marks, feedback },
      { new: true, runValidators: true },
    );
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }
    res.json({
      success: true,
      message: "Graded successfully",
      submission,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await SubmissionModel.find({
      studentId: req.user.id,
    }).populate("assignmentId");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export { submitAssignment, gradeSubmission, getStudentSubmissions };
