const router = require("express").Router();
const User = require("../models/User");

// GET /api/users/me (protected)
router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send({ message: "User not found" });

    return res.send({
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).send({ message: "Failed to load user" });
  }
});

// PATCH /api/users/me (protected)
router.patch("/me", async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).send({ message: "Name is required" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: String(name).trim(),
        avatarUrl: avatarUrl ? String(avatarUrl).trim() : "",
      },
      { new: true, runValidators: true },
    );

    if (!updated) return res.status(404).send({ message: "User not found" });

    return res.send({
      _id: updated._id,
      email: updated.email,
      name: updated.name,
      avatarUrl: updated.avatarUrl,
    });
  } catch (err) {
    console.error("UPDATE ME ERROR:", err);
    return res.status(500).send({ message: "Failed to update user" });
  }
});

module.exports = router;
