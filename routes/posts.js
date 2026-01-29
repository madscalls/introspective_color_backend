const router = require("express").Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const {
  validateCreatePost,
  validatePostId,
} = require("../middleware/validate");

// GET /api/posts?color=red   (PUBLIC)
router.get("/", async (req, res) => {
  try {
    const { color } = req.query;
    const filter = {};
    if (color) filter.color = color;

    const posts = await Post.find(filter).sort({ createdAt: -1 });
    return res.send(posts);
  } catch (err) {
    console.error("GET POSTS ERROR:", err);
    return res.status(500).send({ message: "Failed to fetch posts" });
  }
});

// POST /api/posts   (PROTECTED)
router.post("/", auth, validateCreatePost, async (req, res) => {
  try {
    const { imageUrl, publicId = "", color, hashtags = [] } = req.body;

    if (!imageUrl)
      return res.status(400).send({ message: "imageUrl required" });
    if (!color) return res.status(400).send({ message: "color required" });

    let tags = [];
    if (typeof hashtags === "string") {
      tags = hashtags
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => t.replace(/^#/, "").toLowerCase());
    } else if (Array.isArray(hashtags)) {
      tags = hashtags
        .map((t) => String(t).trim())
        .filter(Boolean)
        .map((t) => t.replace(/^#/, "").toLowerCase());
    }

    tags = Array.from(new Set(tags)).slice(0, 20);

    const post = await Post.create({
      imageUrl,
      publicId,
      color,
      hashtags: tags,
      owner: req.user._id,
    });

    return res.status(201).send(post);
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    return res.status(500).send({ message: "Failed to create post" });
  }
});

// DELETE /api/posts/:postId   (PROTECTED + OWNER ONLY)
router.delete("/:postId", auth, validatePostId, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).send({ message: "Invalid postId" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).send({ message: "Post not found" });

    // owner check
    if (String(post.owner) !== String(req.user._id)) {
      return res.status(403).send({ message: "Forbidden" });
    }

    await Post.findByIdAndDelete(postId);
    return res.send({ message: "Post deleted" });
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    return res.status(500).send({ message: "Failed to delete post" });
  }
});

module.exports = router;
