import { AssignmentModel } from "../models/assignment.model.js";
import { SubmissionModel } from "../models/submission.model.js";

const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, totalMarks } = req.body;
    const existing = await AssignmentModel.findOne({ title });
    if (existing) {
      return res.status(400).json({ message: "Assignment already exists" });
    }
    const assignment = await AssignmentModel.create({
      title,
      description,
      courseId,
      dueDate,
      totalMarks,
      instructorId: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: "Assignment created",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInstructorAssignment = async (req, res) => {
  try {
    const assignment = await AssignmentModel.findOne({
      instructorId: req.user.id,
    }).sort({ createdAt: -1 });
    res.status(201).json({ message: "Assignments", assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAssignmentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await AssignmentModel.findById(id);

    const submissions = await SubmissionModel.find({
      assignmentId: id,
    }).populate("studentId", "name email");
    res.json({
      assignment,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export { createAssignment, getInstructorAssignment, getAssignmentDetails };
