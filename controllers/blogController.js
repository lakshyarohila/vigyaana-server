const prisma = require("../config/db");
const cloudinary = require("../config/cloudinary");

exports.createBlog = async (req, res) => {
  try {
    const file = req.file;

    const upload = await cloudinary.uploader.upload(file.path, {
      folder: "blogs",
    });

    const blog = await prisma.blog.create({
      data: {
        title: req.body.title,
        content: req.body.content,
        imageUrl: upload.secure_url,
        authorId: req.user.id,
      },
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: { author: true },
    });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const existing = await prisma.blog.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ message: "Not found" });

    let imageUrl = existing.imageUrl;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
      });
      imageUrl = upload.secure_url;
    }

    const updated = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        content: req.body.content,
        imageUrl,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
