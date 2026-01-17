require("dotenv").config();

console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const uploadsRouter = require("./routes/uploads");

const app = express();
const PORT = process.env.PORT || 3001;

// middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

//configure
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// MongoDB
mongoose.connect("mongodb://localhost:27017/ic");

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// test routes
app.get("/", (req, res) => {
  res.json({ message: "ic is running!" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// uploads
app.use("/api/uploads", uploadsRouter);

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
