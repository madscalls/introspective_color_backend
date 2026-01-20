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

module.exports = router;
