import { CourseModel } from "../models/coursesMdl.js";
import { EnrollModel } from "../models/EnrollmentModel.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const createEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, phone, course } = req.body;

    const courseData = await CourseModel.findById(course);
    if (!courseData)
      return res.status(404).json({ message: "Course not found" });

    const existing = await EnrollModel.findOne({
      user: userId,
      course,
      status: "paid",
    });
    if (existing) return res.status(400).json({ message: "Already enrolled" });

    const transaction_uuid = uuidv4();
    const amount = String(courseData.price);
    const product_code = "EPAYTEST";
    const secretKey = process.env.SECRET_KEY || "8gBm/:&EnhH.1/q";

    const signatureMessage = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(signatureMessage)
      .digest("base64");

    const enrollment = await EnrollModel.create({
      user: userId,
      address,
      phone,
      course,
      amount,
      transaction_uuid,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      transaction_uuid,
      amount,
      signature,
      product_code,
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    const transaction_uuid = decoded.transaction_uuid;

    const isProd = process.env.NODE_ENV === "production";

    const frontendURL = isProd
      ? "https://lms-frontend-jade-xi.vercel.app"
      : "http://localhost:5173";

    const successPath = isProd ? "/payment-success" : "/payment-success";
    const failurePath = isProd ? "/payment-failure" : "/payment-failure";

    const enrollment = await EnrollModel.findOne({ transaction_uuid });

    if (!enrollment || decoded.status !== "COMPLETE") {
      return res.redirect(`${frontendURL}${failurePath}`);
    }

    // Success logic
    enrollment.status = "paid";
    await enrollment.save();

    return res.redirect(`${frontendURL}${successPath}?tid=${transaction_uuid}`);
  } catch (error) {
    console.error("Verify error:", error);
    const isProd = process.env.NODE_ENV === "production";
    const frontendURL = isProd
      ? "https://lms-frontend-jade-xi.vercel.app"
      : "http://localhost:5173";
    const failurePath = isProd ? "/failure" : "/payment-failure";

    return res.redirect(`${frontendURL}${failurePath}`);
  }
};
const getEnrollmentStatus = async (req, res) => {
  try {
    const { tid } = req.params;
    const enrollment = await EnrollModel.findOne({ transaction_uuid: tid });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }
    res.status(200).json({
      success: true,
      status: enrollment.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getEnrollments = async (req, res) => {
  try {
    const enrollments = await EnrollModel.find({ status: "paid" })
      .populate("user", "name email")
      .populate("course")
      .sort({ createdAt: -1 });

    const result = req.query.limit
      ? enrollments.slice(0, parseInt(req.query.limit))
      : enrollments;

    res.json({
      success: true,
      enrollments: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await EnrollModel.findById(req.params.id).populate(
      "course",
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await EnrollModel.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json({ message: "Enrollment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await EnrollModel.find({ user: userId })
      .populate("course")
      .sort({ createdAt: -1 });

    if (!enrollments || enrollments.length === 0) {
      return res.status(200).json({
        totalCourses: 0,
        paidCourses: 0,
        pendingPayments: 0,
        totalAmountPaid: 0,
        recentEnrollments: [],
      });
    }

    const totalCourses = enrollments.length;
    const paidCourses = enrollments.filter((e) => e.status === "paid").length;
    const pendingPayments = enrollments.filter(
      (e) => e.status === "pending",
    ).length;

    const totalAmountPaid = enrollments
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    res.status(200).json({
      totalCourses,
      paidCourses,
      pendingPayments,
      totalAmountPaid,
      recentEnrollments: enrollments.slice(0, 5),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
const getTotalEarnings = async (req, res) => {
  try {
    const enrollments = await EnrollModel.find().populate("course");

    const totalEarnings = enrollments.reduce((total, enrollment) => {
      return total + (enrollment.course?.price || 0);
    }, 0);

    res.json({ totalEarnings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export {
  createEnrollment,
  verifyEsewaPayment,
  getEnrollmentStatus,
  getEnrollmentById,
  getEnrollments,
  deleteEnrollment,
  getUserDashboard,
  getTotalEarnings,
};
