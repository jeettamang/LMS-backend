import { InstructorModel } from "../models/instructorModel.js";
import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { comparePass, generateToken, hashedPass } from "../utils/bcrypt.js";
import { CourseModel } from "../models/coursesMdl.js";
import { EnrollModel } from "../models/EnrollmentModel.js";

const createInstructor = async (req, res) => {
  console.log("Instructor:", req.body);
  try {
    const { name, email, password, specialization, bio } = req.body;

    if (!name || !email || !password || !specialization || !bio) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const existInstructor = await InstructorModel.findOne({ email });
    if (existInstructor) {
      return res.status(400).json({
        message: "Instructor already exists",
      });
    }

    const pass = hashedPass(password);
    let profileImg = "";
    if (req.file) {
      const localPath = path.resolve(req.file.path);
      const uploaded = await uploadOnCloudinary(localPath);
      profileImg = uploaded?.secure_url;
    }

    const newInstructor = await InstructorModel.create({
      name,
      email,
      password: pass,
      specialization,
      profileImage: profileImg,
      bio,
    });

    res.status(201).json({
      message: "Instructor account created successfully",
      instructorDetails: newInstructor,
    });
  } catch (error) {
    console.error("Instructor creation error:", error);
    res.status(500).json({
      message: "Internal server error during instructor creation",
      error: error.message,
    });
  }
};
const getInstructors = async (req, res) => {
  try {
    const instructors = await InstructorModel.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "instructor",
          as: "assignedCourses",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          profileImage: 1,
          specialization: 1,
          bio: 1,
          coursesCount: { $size: "$assignedCourses" },
        },
      },
    ]);

    res.status(200).json({
      message: "All instructors list with course count",
      instructors: instructors,
    });
  } catch (error) {
    console.error("Instructor fetching error:", error);
    res.status(500).json({
      message: "Internal server error during instructor fetching",
      error: error.message,
    });
  }
};
const getInstructorPublically = async (req, res) => {
  try {
    const publicInstructors = await InstructorModel.find().select(
      "name specialization profileImage",
    );
    res
      .status(200)
      .json({ message: "Instructors for public", publicInstructors });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get instructors for public", error });
  }
};
const getMe = async (req, res) => {
  try {
    const id = req.user.id || req.user._id;
    const instructor = await InstructorModel.findById(id).select("-password");

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({ instructor });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const getMyCourses = async (req, res) => {
  try {
    const instructorId = req.user.id || req.user._id;

    if (!instructorId) {
      return res
        .status(401)
        .json({ message: "Instructor ID not found in request" });
    }

    const courses = await CourseModel.find({ instructor: instructorId });

    res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      courses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: err.message,
    });
  }
};
const getMyStudents = async (req, res) => {
  try {
    const instructorId = req.user._id || req.user.id;
    const enrollments = await EnrollModel.find({ status: "paid" })
      .populate({
        path: "course",
        select: "title instructor",
        match: { instructor: instructorId },
      })
      .populate("user", "name email profileImage")
      .sort({ createdAt: -1 });

    const filteredEnrollments = enrollments.filter(
      (enrollment) => enrollment.course !== null,
    );

    res.status(200).json({
      success: true,
      count: filteredEnrollments.length,
      students: filteredEnrollments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student list",
      error: error.message,
    });
  }
};
const getInstructorDashboard = async (req, res) => {
  try {
    const instructorId = req.user.id || req.user._id;

    const instructorCourses = await CourseModel.find({
      instructor: instructorId,
    });
    const courseIds = instructorCourses.map((course) => course._id);

    const allEnrollments = await EnrollModel.find({
      course: { $in: courseIds },
    })
      .populate("user", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 });
    const totalCourses = instructorCourses.length;

    const paidEnrollments = allEnrollments.filter((e) => e.status === "paid");
    const totalStudents = new Set(
      paidEnrollments.map((e) => e.user?._id.toString()),
    ).size;

    const totalEarnings = paidEnrollments.reduce(
      (sum, e) => sum + (e.amount || 0),
      0,
    );

    const pendingRequests = allEnrollments.filter(
      (e) => e.status === "pending",
    ).length;

    res.status(200).json({
      totalCourses,
      totalStudents,
      totalEarnings,
      pendingRequests,
      recentActivity: allEnrollments.slice(0, 5),
    });
  } catch (error) {
    console.error("Instructor Dashboard Error:", error);
    res.status(500).json({ message: "Failed to load instructor stats" });
  }
};
const loginInstructor = async (req, res) => {
  console.log("Login data:", req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    const instructor = await InstructorModel.findOne({ email });
    console.log("Instructor found", instructor);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const isMatch = comparePass(password, instructor.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    const token = generateToken(instructor);
    const payload = {
      _id: instructor._id,
      name: instructor.name,
      email: instructor.email,
      role: instructor.role,
      Bio: instructor.bio,
      profileImage: instructor.profileImage,
    };
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Instructor login successfully",
        instructorDetails: payload,
      });
  } catch (error) {
    console.error("login fail error:", error);
    res.status(500).json({
      message: "Internal server error during instructor login",
      error: error.message,
    });
  }
};
const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const isAdmin = req.user.role === "Admin";
    const isOwner = req.user.id === id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "You are not allowed to update this account",
      });
    }
    const { name, email, password, specialization, bio } = req.body;

    const updateData = {
      name,
      email,
      password,
      specialization,
      bio,
    };

    if (req.file) {
      const localPath = path.resolve(req.file.path);
      const uploaded = await uploadOnCloudinary(localPath);

      if (uploaded) {
        updateData.profileImage = uploaded.secure_url;
      }
    }

    const inst = await InstructorModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!inst) {
      return res.status(404).json({
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      message: "Instructor detail updated successfully",
      updatedDetail: inst,
    });
  } catch (error) {
    console.error("updation fail error:", error);
    res.status(500).json({
      message: "Internal server error during instructor updation",
      error: error.message,
    });
  }
};
const deleteIns = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInst = await InstructorModel.findByIdAndDelete(id);

    if (!deletedInst) {
      return res.status(404).json({
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      message: "Instructor deleted successfully",
      data: deletedInst,
    });
  } catch (error) {
    console.error("Instructor deletion fail error:", error);

    res.status(500).json({
      message: "Internal server error during instructor deletion",
      error: error.message,
    });
  }
};

export {
  createInstructor,
  loginInstructor,
  getInstructorPublically,
  getMe,
  getMyCourses,
  getMyStudents,
  getInstructorDashboard,
  updateInstructor,
  deleteIns,
  getInstructors,
};
