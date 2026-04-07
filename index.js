// server.js
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import userRoutes from "./src/routes/userRoute.js";
import courseRoutes from "./src/routes/courseRoute.js";
import instructorRoutes from "./src/routes/instructorRoute.js";
import contactRoutes from "./src/routes/contactRoute.js";
import blogRoutes from "./src/routes/blogRoute.js";
import enrollRoutes from "./src/routes/enrollmentRoute.js";
import courseCategoryRoutes from "./src/routes/courseCategoryRoute.js";
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://lms-frontend-jade-xi.vercel.app/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use("/tmp/users", express.static("tmp/users"));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/instructor", instructorRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/enrollment", enrollRoutes);
app.use("/api/v1/course-category", courseCategoryRoutes);
connectDB();

const PORT = Number(process.env.PORT) || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
