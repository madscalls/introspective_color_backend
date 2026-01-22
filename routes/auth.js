const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// helper
function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

// POST /api/signup
router.post("/signup", async (req, res) => {
  try {
    const { password, name, avatarUrl } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return res.status(400).send({ message: "Email and password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).send({ message: "Email already in use" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      name,
      avatarUrl,
    });

    // don’t send password back
    return res.status(201).send({
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).send({ message: "Signup failed" });
  }
});

// POST /api/signin
router.post("/signin", async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return res.status(400).send({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).send({ message: "Incorrect email or password" });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).send({ message: "Incorrect email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET in environment");
      return res.status(500).send({ message: "Server misconfigured" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    return res.send({ token });
  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    return res.status(500).send({ message: "Signin failed" });
  }
});

module.exports = router;
