import { ReturnDocument } from "mongodb";
import { Blog } from "../models/blogModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateSlug } from "../utils/slug.js";
import path from "path";

const createBlog = async (req, res) => {
  try {
    const { title, author, content, role } = req.body; 

    if (!title || !author || !content) {
      return res
        .status(400)
        .json({ message: "Title, author, and content are required" });
    }

    const authorModel = role === "admin" ? "User" : "Instructor";

    let slug = generateSlug(title);
    const existedBlog = await Blog.findOne({ slug });

    if (existedBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    let blogImage = "";
    if (req.file) {
      try {
        const localPath = path.resolve(req.file.path);
        const uploaded = await uploadOnCloudinary(localPath);
        blogImage = uploaded?.secure_url || "";
      } catch (uploadError) {
        console.log("Cloudinary error:", uploadError);
      }
    }
    const blog = await Blog.create({
      title,
      content,
      author,       
      authorModel, 
      slug,
      image: blogImage,
    });

    return res.status(201).json({
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Failed to create blog",
    });
  }
};
const list = async (req, res) => {
  try {
    const { title, page = 1, limit = 10 } = req.query;
    const query = [];
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (title) {
      query.push({
        $match: { title: new RegExp(title, "i") },
      });
    }

    query.push({
      $lookup: {
        from: "instructors",
        localField: "author",
        foreignField: "_id",
        as: "instructorData",
      },
    });

    query.push({
      $lookup: {
        from: "users", 
        localField: "author",
        foreignField: "_id",
        as: "adminData",
      },
    });

    query.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: { createdAt: -1 } }, 
          { $skip: (pageNum - 1) * limitNum },
          { $limit: limitNum },
          {
            $project: {
              title: 1,
              slug: 1,
              content: 1,
              image: 1,
              status: 1,
              createdAt: 1,
              author: {
                $cond: {
                  if: { $gt: [{ $size: "$instructorData" }, 0] },
                  then: "$instructorData",
                  else: "$adminData",
                },
              },
            },
          },
          {
            $project: {
              title: 1,
              slug: 1,
              content: 1,
              image: 1,
              status: 1,
              createdAt: 1,
              author: { $arrayElemAt: ["$author", 0] },
            },
          },
        ],
      },
    });

    const result = await Blog.aggregate(query);
    const blogs = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;

    return res.status(200).json({
      message: "All blogs are listed",
      data: {
        blogs,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: total > 0 ? Math.ceil(total / limitNum) : 0,
      },
    });
  } catch (error) {
    console.error("List Error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        message: "Slug not found",
      });
    }
    const blog = await Blog.findOne({ slug }).populate("author", "name email");
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }
    res.status(200).json({ message: "Blog fetched successfully", data: blog });
  } catch (error) {
    console.error("Failed to get blog");
    res.status(500).json({ message: "Error is getBySlug API", error });
  }
};
const updateBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, author, ...rest } = req.body; 

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    const updatedData = { ...rest };
    
    if (author) {
      updatedData.author = author;
    }

    if (title) {
      updatedData.title = title;
      updatedData.slug = generateSlug(title);
    }
    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $set: updatedData },
      { returnDocument: "after" }
    ).populate("author", "name email");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ 
      message: "Blog updated successfully", 
      data: blog 
    });
  } catch (error) {
    console.error("Failed to update Blog:", error);
    res.status(500).json({ message: "Error in update By slug API", error });
  }
};
const updateByStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status or use 'draft or published only'" });
    }

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $set: { status: status } },
      { returnDocument: "after" },
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog status updated successfully" });
  } catch (error) {
    console.error("Failed to update Blog");
    res.status(500).json({ message: "Error in update By slug API", error });
  }
};
const removeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }
    const blog = await Blog.findOneAndDelete({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(new ApiResponse(200, {}, "Blog deleted successfully"));
  } catch (error) {
    console.error("Failed to update Blog");
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(500, null, error.message || "Internal Server Error"),
      );
  }
};
export {
  createBlog,
  list,
  getBySlug,
  updateBySlug,
  updateByStatus,
  removeBySlug,
};
