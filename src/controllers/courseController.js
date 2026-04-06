import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { CourseModel } from "../models/coursesMdl.js";
import { InstructorModel } from "../models/instructorModel.js";

const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      duration,
      instructor: instructorFromBody,
    } = req.body;

    let instructorId =
      req.user.role === "Instructor"
        ? req.user._id || req.user.id
        : instructorFromBody;

    const instructorExists = await InstructorModel.findById(instructorId);
    if (!instructorExists) {
      return res.status(404).json({ message: "Selected instructor not found" });
    }

    if (!title || !description || !price || !duration || !instructorId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existCourse = await CourseModel.findOne({ title });
    if (existCourse) {
      return res.status(400).json({ message: "Course already exists" });
    }
    let imageUrl = "";
    if (req.file) {
      const localPath = path.resolve(req.file.path);
      const uploaded = await uploadOnCloudinary(localPath);
      imageUrl = uploaded?.secure_url || "";
    }

    // Create course
    const newCourse = await CourseModel.create({
      title,
      description,
      price: +price,
      duration,
      instructor: instructorId,
      image: imageUrl,
    });

    res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during course creation",
      err: error.message,
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find().populate(
      "instructor",
      "-password -token",
    );
    res.status(200).json({
      message: "Course fetched successfully",
      course: courses,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during of fetching of courses",
      err: error.message,
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseModel.findById(id).populate(
      "instructor",
      "name bio experience profileImage",
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res
      .status(200)
      .json({ message: "Course fetched successfully", courseDetail: course });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching course",
      error: error.message,
    });
  }
};
const deleteCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseModel.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting course",
      error: error.message,
    });
  }
};

const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "Course not found" });
    }
    const { title, description, price, duration, instructor } = req.body;

    let updateImg = "";
    if (req.file) {
      const localPath = path.resolve(req.file.path);
      const upload = await uploadOnCloudinary(localPath);
      updateImg = upload?.secure_url;
    }
    const updateData = {
      title,
      description,
      price,
      duration,
      instructor,
      image: updateImg,
    };
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      { new: true },
    );
    res
      .status(200)
      .json({ message: "Course updated successfully", updatedCourse });
  } catch (error) {
    res.status(500).json({
      message: "Error editing course",
      error: error.message,
    });
  }
};
export {
  createCourse,
  getCourses,
  getCourseById,
  deleteCourseById,
  editCourse,
};
