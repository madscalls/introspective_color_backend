const router = require("express").Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// GET /api/posts?color=red  (PUBLIC)
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

// POST /api/posts  (PROTECTED)
router.post("/", auth, async (req, res) => {
  try {
    const { imageUrl, publicId = "", color, hashtags = [] } = req.body;

    if (!imageUrl)
      return res.status(400).send({ message: "imageUrl required" });
    if (!color) return res.status(400).send({ message: "color required" });

    let tags = [];
    if (typeof hashtags === "string") {
      tags = hashtags
        .split(/\s+/)
        .map((t) => t.replace(/^#/, "").toLowerCase())
        .filter(Boolean);
    } else if (Array.isArray(hashtags)) {
      tags = hashtags
        .map((t) => String(t).replace(/^#/, "").toLowerCase())
        .filter(Boolean);
    }

    const post = await Post.create({
      imageUrl,
      publicId,
      color,
      hashtags: tags,
    });

    return res.status(201).send(post);
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    return res.status(500).send({ message: "Failed to create post" });
  }
});

module.exports = router;
