import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { CourseModel } from "../models/coursesMdl.js";
import { InstructorModel } from "../models/instructorModel.js";
import { generateSlug } from "../utils/slug.js";

const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      duration,
      videoUrl,
      category,
      syllabus,
      prerequisites,
      enrollmentDeadline,
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

    if (
      !title ||
      !description ||
      !price ||
      !duration ||
      !category ||
      !instructorId
    ) {
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
      category,
      slug: generateSlug(title),
      videoUrl,
      instructor: instructorId,
      image: imageUrl,
      syllabus: typeof syllabus === "string" ? JSON.parse(syllabus) : syllabus,
      prerequisites:
        typeof prerequisites === "string"
          ? JSON.parse(prerequisites)
          : prerequisites,
      enrollmentDeadline,
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
    const { search, category } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category && category !== "All Categories") {
      query.category = category;
    }
    const courses = await CourseModel.find(query)
      .populate("instructor", "name profileImage specialization bio")
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      count: courses.length,
      course: courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during fetching of courses",
      err: error.message,
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseModel.findById(id).populate(
      "instructor",
      "name bio experience profileImage videoUrl",
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
    const {
      title,
      description,
      price,
      duration,
      category,
      videoUrl,
      instructor,
      syllabus,
      prerequisites,
      enrollmentDeadline,
    } = req.body;

    const updateData = {
      title,
      description,
      price,
      duration,
      instructor,
      category,
      videoUrl,
      enrollmentDeadline,
    };
    if (syllabus)
      updateData.syllabus =
        typeof syllabus === "string" ? JSON.parse(syllabus) : syllabus;
    if (prerequisites)
      updateData.prerequisites =
        typeof prerequisites === "string"
          ? JSON.parse(prerequisites)
          : prerequisites;
    if (req.file) {
      const localPath = path.resolve(req.file.path);
      const upload = await uploadOnCloudinary(localPath);

      if (upload?.secure_url) {
        updateData.image = upload.secure_url;
      }
    }

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Course updated successfully",
      updatedCourse,
    });
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
