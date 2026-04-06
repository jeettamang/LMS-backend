import fs from "fs";
export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    
    const cloudinary = (await import("cloudinary")).v2;

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded:", response.secure_url);

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    if (localFilePath) fs.unlinkSync(localFilePath);
    throw error;
  }
};