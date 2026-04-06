import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI);
    console.log(`Mongodb connected successfully : ${conn.connection.host}`);
  } catch (error) {
    console.error("Databse connection failed", error.message);
    process.exit(1);
  }
};
