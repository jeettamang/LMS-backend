import { EnrollModel } from "../models/EnrollmentModel.js";
import { UserModel } from "../models/userModel.js";
import { comparePass, generateToken, hashedPass } from "../utils/bcrypt.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import path from "path";

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    let profileUrl = "";
    if (req.file) {
      const localFilePath = path.resolve(req.file.path);
      const uploaded = await uploadOnCloudinary(localFilePath);
      profileUrl = uploaded?.secure_url || "";
    }

    const hashedPassword = hashedPass(password);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      profile: profileUrl,
    });

    res.status(201).json({
      message: "User registered successfully",
      userData: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Internal server error during registration",
      error: error.message,
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = comparePass(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "User login successfully",
        userData: payload,
      });
  } catch (error) {
    console.error("Login Crash Error:", error.message);
    return res.status(500).json({
      message: "Internal server error during login",
      devError: error.message,
    });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    res.status(200).json({ message: "User found successfully", user });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error fetching user",
    });
  }
};
const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json({ message: "Users list", users });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error fetching users",
    });
  }
};
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const existUser = await UserModel.findById(id);
    if (!existUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const capitalizedRole = role
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : existUser.role;

    const updateData = {
      name,
      email,
      role: capitalizedRole,
      profile: req.file ? req.file.filename : existUser.profile,
    };

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Error:", error.message);
    return res.status(500).json({
      message: error.message || "Internal server error during update",
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "ID is required",
      });
    }
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during user delete",
    });
  }
};
const logout = async (req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
};
const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    const courses = await EnrollModel.find({
      user: userId,
    }).populate("course");

    if (!courses) {
      return res.status(400).json({ message: "Something went wrond" });
    }
    res.status(200).json({ message: "Enrolled courses", data: courses });
  } catch (error) {
    console.log("Error in getUserCourses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user courses",
    });
  }
};
const myPayments = async (req, res) => {
  try {
    const payments = await EnrollModel.find({ user: req.user.id })
      .populate("course", "title price duration image")
      .populate("course.instructor", "name profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: payments, // return in "data" key for consistency
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  getMyCourses,
  editUser,
  logout,
  deleteUser,
  myPayments,
};
